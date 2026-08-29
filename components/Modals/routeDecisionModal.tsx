import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface RouteDecisionModalProps {
  visible: boolean;
  hasExistingRoute: boolean;
  destinationName?: string;
  onReplace: (isPrivate: boolean) => void;
  onNextStop: (isPrivate: boolean) => void;
  onCreateSingle?: (isPrivate: boolean) => void;
  onCancel: () => void;
}

export function RouteDecisionModal({
  visible,
  hasExistingRoute,
  destinationName,
  onReplace,
  onNextStop,
  onCreateSingle,
  onCancel,
}: RouteDecisionModalProps) {
  const [isPrivate, setIsPrivate] = useState(false);

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
              name={isPrivate ? "lock-outline" : "map-marker-path"}
              size={28}
              color={isPrivate ? "#ffaa00" : "#00ffff"}
            />
            <Text style={styles.title}>Definir Rota</Text>
          </View>

          {destinationName ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              Destino: <Text style={styles.highlight}>{destinationName}</Text>
            </Text>
          ) : null}

          {/* Toggle de Visibilidade (Pública x Privada) */}
          <View style={styles.privacyToggleContainer}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyTitle}>
                {isPrivate
                  ? "Rota Particular (Apenas Você)"
                  : "Rota Pública (Todo o Comboio)"}
              </Text>
              <Text style={styles.privacyDescription}>
                {isPrivate
                  ? "Visível somente para a sua conta e salva no seu perfil."
                  : "Compartilhada em tempo real com os membros do grupo."}
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: "#00ffff33", true: "#ffaa0055" }}
              thumbColor={isPrivate ? "#ffaa00" : "#00ffff"}
            />
          </View>

          <View style={styles.buttonContainer}>
            {hasExistingRoute ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => onNextStop(isPrivate)}
                >
                  <MaterialCommunityIcons
                    name="format-list-bulleted"
                    size={20}
                    color="#000"
                  />
                  <Text style={styles.primaryButtonText}>
                    Adicionar como Próxima Parada
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => onReplace(isPrivate)}
                >
                  <MaterialCommunityIcons
                    name="swap-horizontal"
                    size={20}
                    color="#00ffff"
                  />
                  <Text style={styles.secondaryButtonText}>
                    Substituir Minha Rota Atual
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => {
                  if (onCreateSingle) onCreateSingle(isPrivate);
                  else onReplace(isPrivate);
                }}
              >
                <MaterialCommunityIcons
                  name="navigation"
                  size={20}
                  color="#000"
                />
                <Text style={styles.primaryButtonText}>Iniciar Rota</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 12,
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
    marginBottom: 12,
  },
  highlight: {
    color: "#fff",
    fontWeight: "bold",
  },
  privacyToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  privacyInfo: {
    flex: 1,
    marginRight: 10,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#fff",
  },
  privacyDescription: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#00ffff",
  },
  primaryButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#00ffff",
  },
  secondaryButtonText: {
    color: "#00ffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 4,
  },
  cancelButtonText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 14,
  },
});
