import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface StatusSelectionModalProps {
  visible: boolean;
  onSelectStatus: (
    status: "active" | "fuel" | "flat_tire" | "food" | "stopped",
  ) => void;
  onCancel: () => void;
}

export function StatusSelectionModal({
  visible,
  onSelectStatus,
  onCancel,
}: StatusSelectionModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="car-info" size={28} color="#00ffff" />
            <Text style={styles.title}>Meu Status Atual</Text>
          </View>
          <Text style={styles.subtitle}>
            Informe ao comboio o que você está fazendo no momento.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { borderColor: "#00ffff" }]}
              onPress={() => onSelectStatus("active")}
            >
              <Text style={styles.emoji}>🟢</Text>
              <Text style={styles.btnText}>Ativo / Em Movimento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { borderColor: "#ffaa00" }]}
              onPress={() => onSelectStatus("fuel")}
            >
              <Text style={styles.emoji}>⛽</Text>
              <Text style={styles.btnText}>Abastecendo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { borderColor: "#ffaa00" }]}
              onPress={() => onSelectStatus("food")}
            >
              <Text style={styles.emoji}>🍔</Text>
              <Text style={styles.btnText}>Comendo / Pausa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { borderColor: "#ff4444" }]}
              onPress={() => onSelectStatus("flat_tire")}
            >
              <Text style={styles.emoji}>🔧</Text>
              <Text style={styles.btnText}>Problema Mecânico</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { borderColor: "#ff4444" }]}
              onPress={() => onSelectStatus("stopped")}
            >
              <Text style={styles.emoji}>🛑</Text>
              <Text style={styles.btnText}>Parado</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#020810",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#00ffff55",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 13, color: "#aaa", marginBottom: 20 },
  buttonContainer: { gap: 10 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 12,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  emoji: { fontSize: 20 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  cancelButton: { alignItems: "center", paddingVertical: 12, marginTop: 10 },
  cancelButtonText: { color: "#888", fontWeight: "600", fontSize: 14 },
});
