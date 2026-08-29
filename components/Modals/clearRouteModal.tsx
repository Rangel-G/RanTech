import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ClearRoutesModalProps {
  visible: boolean;
  onClear: (type: "public" | "private" | "all") => void;
  onCancel: () => void;
}

export function ClearRoutesModal({
  visible,
  onClear,
  onCancel,
}: ClearRoutesModalProps) {
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
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={28}
              color="#ff4444"
            />
            <Text style={styles.title}>Limpar Minhas Rotas</Text>
          </View>
          <Text style={styles.subtitle}>
            Quais rotas você deseja apagar? Lembre-se, isso removerá apenas as
            rotas que você criou.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.publicBtn]}
              onPress={() => onClear("public")}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color="#00ffff"
              />
              <Text style={styles.btnText}>Públicas (Do Grupo)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.privateBtn]}
              onPress={() => onClear("private")}
            >
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color="#ffaa00"
              />
              <Text style={styles.btnText}>Particulares</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.allBtn]}
              onPress={() => onClear("all")}
            >
              <MaterialCommunityIcons name="check-all" size={20} color="#fff" />
              <Text style={styles.btnTextAll}>Todas as Minhas Rotas</Text>
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
    borderColor: "#ff444455",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 13, color: "#aaa", marginBottom: 20 },
  buttonContainer: { gap: 10 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 12,
    borderWidth: 1,
  },
  publicBtn: {
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    borderColor: "#00ffff",
  },
  privateBtn: {
    backgroundColor: "rgba(255, 170, 0, 0.1)",
    borderColor: "#ffaa00",
  },
  allBtn: { backgroundColor: "#ff4444", borderColor: "#cc0000" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  btnTextAll: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  cancelButton: { alignItems: "center", paddingVertical: 12, marginTop: 10 },
  cancelButtonText: { color: "#888", fontWeight: "600", fontSize: 14 },
});
