import {
  useWindowDimensions,
  ScrollView,
  Button,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedCard } from "../../components/AnimatedCard/AnimatedCard";
import { router } from "expo-router";

export default function HomeScreen() {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <AnimatedCard width={width - 32} height={200} r={16} />

          <View style={styles.buttonContainer}>
            <Button
              title="Go to Account"
              onPress={() => router.push("/account")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {},
  buttonContainer: {
    marginTop: 20,
  },
});
