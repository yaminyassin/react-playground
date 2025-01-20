import React from "react";

import { CoonsPatchMeshGradient } from "./components/CoonsMeshView";
import { StyleSheet, Text, View } from "react-native";
import { AntDesign, SimpleLineIcons } from "@expo/vector-icons";

export interface AnimatedCardProps {
  width: number;
  height: number;
  r: number;
}

export const AnimatedCard = ({ width, height, r }: AnimatedCardProps) => {
  const styles = useStylesheet({
    width,
    height,
    r,
  });

  return (
    <>
      <CoonsPatchMeshGradient
        width={width}
        height={height}
        r={r}
        rows={3}
        cols={3}
        colors={palette}
      />
      <View style={styles.container}>
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={{ fontWeight: "400", color: "white" }}>
              Hoje podes gastar
            </Text>
            <SimpleLineIcons name="options-vertical" size={16} color="white" />
          </View>
          <View style={styles.currency}>
            <Text style={{ fontWeight: "500", color: "white" }}>253.21 €</Text>
            <View style={styles.currencySuffix}>
              <AntDesign name="arrowright" size={16} color="white" />
            </View>
          </View>
        </View>

        <View style={styles.cardFooterContainer}>
          <View style={styles.footerBlurLayer}>
            <View style={styles.footerText}>
              <Text style={{ fontWeight: "300", color: "white" }}>
                o teu saldo é
              </Text>
              <Text style={{ fontWeight: "500", color: "white" }}>
                500.21 €
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const palette = [
  "#036aac",
  "#033b9c",
  "#033b9c",
  "#036b9c",
  "#e33dfc",
  "#9702ad",
  "#731182",
  "#e33dfc",
  "#9702ad",
  "#e33dfc",
  "#731182",
  "#9702ad",
  "#731182",
  "#e33dfc",
  "#e33dfc",
  "#e33dfc",
  "#9702ad",
];

export const useStylesheet = (context: {
  width: number;
  height: number;
  r: number;
}) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      borderRadius: context.r,
      width: context.width,
      height: context.height,
      overflow: "hidden",
    },
    cardContainer: { padding: 24 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between" },
    currency: {
      flexDirection: "row",
      rowGap: 8,
    },
    currencySuffix: {
      alignSelf: "flex-end",
      paddingBottom: 4,
    },
    cardFooterContainer: {
      position: "absolute",
      bottom: 0,
    },
    footerBlurLayer: {
      width: context.width,
      height: 40,
      justifyContent: "center",
      paddingLeft: 24,
      backgroundColor: "rgba(100,100, 100, 0.6)",
    },
    footerText: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "baseline",
      gap: 4,
    },
    textBalanceInner: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
    },
  });
