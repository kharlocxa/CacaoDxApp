import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Easing, Text } from "react-native";

const LoadingScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [rotationCount, setRotationCount] = useState(0);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const spin = () => {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000, // 1 second per rotation (was 10000)
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        rotateAnim.setValue(0);
        setRotationCount((prev) => {
          const next = prev + 1;
          if (next === 5) {
            // After 5 rotations (5 seconds), show text
            setShowText(true);

            // Fade in the text
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800, // fade-in duration (was 15000)
              useNativeDriver: true,
            }).start(() => {
              // Wait 500ms after text appears, then finish
              setTimeout(() => onFinish(), 500);
            });
          } else {
            spin(); // continue spinning
          }
          return next;
        });
      });
    };

    spin();
  }, []);

  const spinStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Animated.Image
          source={require("../assets/homepics/cacaopod.png")}
          style={[styles.logo, spinStyle]}
        />
        {showText && (
          <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
            CacaoDx
          </Animated.Text>
        )}
      </View>
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 92,
    marginRight: 10,
  },
  text: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#000000ff",
  },
});