// components/StartRouteModal.tsx
import { RouteData } from "@/services/firebase/group-service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface StartRouteModalProps {
  visible: boolean;
  routes: RouteData[];
  onSelectScope: (scope: "public" | "private") => void;
  onCancel: () => void;
}

export function StartRouteModal({
  visible,
  routes,
  onSelectScope,
  onCancel,
}: StartRouteModalProps) {
  const publicRoutes = routes.filter((r) => !r.isPrivate);
  const privateRoutes = routes.filter((r) => r.isPrivate);

  const hasPublic = publicRoutes.length > 0;
  const hasPrivate = privateRoutes.length > 0;

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
              name="navigation-variant"
              size={28}
              color="#00ffff"
            />
            <Text style={styles.title}>Iniciar Navegação</Text>
          </View>

          <Text style={styles.subtitle}>
            Escolha qual modo de rota você deseja seguir no mapa 3D:
          </Text>

          <View style={styles.optionsContainer}>
            {/* Opção Rota Compartilhada */}
            <TouchableOpacity
              style={[styles.optionCard, !hasPublic && styles.disabledCard]}
              disabled={!hasPublic}
              onPress={() => onSelectScope("public")}
            >
              <View style={styles.optionHeader}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={24}
                  color={hasPublic ? "#00ffff" : "#555"}
                />
                <Text
                  style={[
                    styles.optionTitle,
                    !hasPublic && styles.disabledText,
                  ]}
                >
                  Rota Compartilhada
                </Text>
              </View>
              <Text style={styles.optionBadge}>
                {hasPublic
                  ? `${publicRoutes.length} parada(s)`
                  : "Nenhuma rota"}
              </Text>
            </TouchableOpacity>

            {/* Opção Rota Particular */}
            <TouchableOpacity
              style={[styles.optionCard, !hasPrivate && styles.disabledCard]}
              disabled={!hasPrivate}
              onPress={() => onSelectScope("private")}
            >
              <View style={styles.optionHeader}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={24}
                  color={hasPrivate ? "#ffaa00" : "#555"}
                />
                <Text
                  style={[
                    styles.optionTitle,
                    !hasPrivate && styles.disabledText,
                  ]}
                >
                  Rota Particular
                </Text>
              </View>
              <Text
                style={[
                  styles.optionBadge,
                  { color: hasPrivate ? "#ffaa00" : "#555" },
                ]}
              >
                {hasPrivate
                  ? `${privateRoutes.length} parada(s)`
                  : "Nenhuma rota"}
              </Text>
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
    borderColor: "rgba(0, 255, 255, 0.3)",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.2)",
  },
  disabledCard: {
    borderColor: "rgba(255, 255, 255, 0.05)",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  disabledText: {
    color: "#555",
  },
  optionBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00ffff",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 14,
  },
});
