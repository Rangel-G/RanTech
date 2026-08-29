import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface SpeedDialMenuProps {
  onMeetingPress: () => void;
  onClearPress: () => void;
}

export function SpeedDialMenu({
  onMeetingPress,
  onClearPress,
}: SpeedDialMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 5,
    }).start();
    setIsOpen(!isOpen);
  };

  const translateYMeeting = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -120],
  });
  const translateYClear = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -65],
  });
  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <View style={styles.container}>
      {/* Botão Encontro */}
      <Animated.View
        style={[
          styles.actionWrapper,
          { opacity, transform: [{ translateY: translateYMeeting }] },
        ]}
      >
        <Text style={styles.label}>Encontro</Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#00ffff" }]}
          onPress={() => {
            toggleMenu();
            onMeetingPress();
          }}
          disabled={!isOpen}
        >
          <MaterialCommunityIcons name="account-group" size={20} color="#000" />
        </TouchableOpacity>
      </Animated.View>

      {/* Botão Limpar */}
      <Animated.View
        style={[
          styles.actionWrapper,
          { opacity, transform: [{ translateY: translateYClear }] },
        ]}
      >
        <Text style={styles.label}>Limpar</Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#ff4444" }]}
          onPress={() => {
            toggleMenu();
            onClearPress();
          }}
          disabled={!isOpen}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Botão Mais (Principal) */}
      <TouchableOpacity
        style={styles.mainButton}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <MaterialCommunityIcons name="plus" size={28} color="#000" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 95,
    right: 20,
    alignItems: "flex-end",
    zIndex: 100,
  },
  actionWrapper: {
    position: "absolute",
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "bold",
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  mainButton: {
    backgroundColor: "#00ffff",
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
