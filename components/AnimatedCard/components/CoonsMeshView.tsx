import React, {useMemo} from 'react';
import type {CubicBezierHandle} from '@shopify/react-native-skia';
import {
  Skia,
  isEdge,
  Group,
  add,
  Canvas,
  Patch,
  vec,
  useClock,
  Mask,
  RoundedRect,
} from '@shopify/react-native-skia';
import {View, useWindowDimensions} from 'react-native';
import {useDerivedValue, type SharedValue} from 'react-native-reanimated';
import {Curves} from './Curves';
import {Cubic} from './Cubic';
import {AnimatedCardProps} from '../AnimatedCard';
import {getSeed, perlin} from '../utils/animations';
import {symmetric} from '../utils/math';

const rectToTexture = (
  vertices: CubicBezierHandle[],
  [tl, tr, br, bl]: number[],
) =>
  [
    vertices[tl].pos,
    vertices[tr].pos,
    vertices[br].pos,
    vertices[bl].pos,
  ] as const;

const rectToColors = (colors: string[], [tl, tr, br, bl]: number[]) => [
  colors[tl],
  colors[tr],
  colors[br],
  colors[bl],
];

const useRectToPatch = (
  mesh: SharedValue<CubicBezierHandle[]>,
  indices: number[],
): SharedValue<
  [CubicBezierHandle, CubicBezierHandle, CubicBezierHandle, CubicBezierHandle]
> =>
  useDerivedValue(() => {
    const tl = mesh.value[indices[0]];
    const tr = mesh.value[indices[1]];
    const br = mesh.value[indices[2]];
    const bl = mesh.value[indices[3]];
    return [
      {
        pos: tl.pos,
        c1: tl.c2,
        c2: tl.c1,
      },
      {
        pos: tr.pos,
        c1: symmetric(tr.c1, tr.pos),
        c2: tr.c2,
      },
      {
        pos: br.pos,
        c1: symmetric(br.c2, br.pos),
        c2: symmetric(br.c1, br.pos),
      },
      {
        pos: bl.pos,
        c1: bl.c1,
        c2: symmetric(bl.c2, bl.pos),
      },
    ];
  }, [mesh]);

interface CoonsPatchMeshGradientProps extends AnimatedCardProps {
  rows: number;
  cols: number;
  colors: string[];
  debug?: boolean;
}

const F = 5000;
const A = 50;

export const CoonsPatchMeshGradient = ({
  rows,
  cols,
  colors,
  debug,
  ...animatedCardProps
}: CoonsPatchMeshGradientProps) => {
  const {width: windowWidth} = useWindowDimensions();

  const {width: cardWidth, height: cardHeight} = animatedCardProps;

  const clock = useClock();

  const localHeight = 256;
  const dx = cardWidth / cols;
  const dy = localHeight / rows;
  const C = dx / 3;

  const skiaWindow = useMemo(
    () => Skia.XYWHRect(0, 0, cardWidth, localHeight),
    [localHeight, cardWidth],
  );

  const defaultMesh = useMemo(
    () =>
      new Array(cols + 1)
        .fill(0)
        .map((_c, col) =>
          new Array(rows + 1).fill(0).map((_r, row) => {
            const pos = vec(row * dx, col * dy);
            return {
              pos,
              c1: add(pos, vec(C, 0)),
              c2: add(pos, vec(0, C)),
            };
          }),
        )
        .flat(2),
    [C, cols, dx, dy, rows],
  );

  const rects = useMemo(
    () =>
      new Array(rows).fill(0).flatMap((_r, row) =>
        new Array(cols).fill(0).map((_c, col) => {
          const l = cols + 1;
          const tl = row * l + col;
          const tr = tl + 1;
          const bl = (row + 1) * l + col;
          const br = bl + 1;
          return [tl, tr, br, bl];
        }),
      ),
    [cols, rows],
  );
  const seeds = useMemo(
    () => defaultMesh.map(() => [getSeed(), getSeed(), getSeed()]),
    [defaultMesh],
  );

  const mesh = useDerivedValue(() => {
    return defaultMesh.map((pt, i) => {
      if (isEdge(pt.pos, skiaWindow)) {
        return pt;
      }

      const [noisePos, noiseC1, noiseC2] = seeds[i];
      return {
        pos: add(
          pt.pos,
          vec(
            A * perlin(noisePos, clock.value / F, 0),
            A * perlin(noisePos, 0, clock.value / F),
          ),
        ),
        c1: add(
          pt.c1,
          vec(
            A * perlin(noiseC1, clock.value / F, 0),
            A * perlin(noiseC1, 0, clock.value / F),
          ),
        ),
        c2: add(
          pt.c1,
          vec(
            A * perlin(noiseC2, clock.value / F, 0),
            A * perlin(noiseC2, 0, clock.value / F),
          ),
        ),
      };
    });
  }, [clock]);

  return (
    <View>
      <Canvas style={{width: windowWidth, height: cardHeight}}>
        <Mask
          mask={
            <Group>
              <RoundedRect x={0} y={0} {...animatedCardProps} />
            </Group>
          }>
          <Group>
            {rects.map((r, i) => {
              return (
                <RectPatch
                  key={i}
                  r={r}
                  mesh={mesh}
                  debug={debug}
                  colors={colors}
                  defaultMesh={defaultMesh}
                />
              );
            })}
          </Group>
          {!!debug &&
            defaultMesh.map(({pos}, index) =>
              isEdge(pos, skiaWindow) ? null : (
                <Cubic
                  key={index}
                  mesh={mesh}
                  index={index}
                  color={colors[index]}
                />
              ),
            )}
        </Mask>
      </Canvas>
    </View>
  );
};

interface RectPatchProps {
  r: number[];
  debug?: boolean;
  colors: string[];
  mesh: SharedValue<CubicBezierHandle[]>;
  defaultMesh: CubicBezierHandle[];
}

const RectPatch = ({r, debug, colors, mesh, defaultMesh}: RectPatchProps) => {
  const patch = useRectToPatch(mesh, r);
  return (
    <>
      <Patch
        patch={patch}
        colors={debug ? undefined : rectToColors(colors, r)}
        texture={rectToTexture(defaultMesh, r)}
      />
      {!!debug && <Curves patch={patch} />}
    </>
  );
};
