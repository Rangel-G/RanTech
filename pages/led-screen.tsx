import { useLed } from "@/contexts/led-context";
import * as Haptics from "expo-haptics";
import React from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PRESET_COLORS = [
  { name: "Vermelho", r: 255, g: 0, b: 0, hex: "#FF0000" },
  { name: "Verde", r: 0, g: 255, b: 0, hex: "#00FF00" },
  { name: "Azul", r: 0, g: 0, b: 255, hex: "#0000FF" },
  { name: "Amarelo", r: 255, g: 255, b: 0, hex: "#FFFF00" },
  { name: "Ciano", r: 0, g: 255, b: 255, hex: "#00FFFF" },
  { name: "Roxo", r: 128, g: 0, b: 128, hex: "#800080" },
  { name: "Branco", r: 255, g: 255, b: 255, hex: "#FFFFFF" },
  { name: "Desligar", r: 0, g: 0, b: 0, hex: "#222222" },
];

export default function LedScreen() {
  const {
    ledSettings,
    isScanning,
    isConnected,
    connectedDevice,
    scannedDevices,
    error,
    startLedScan,
    stopLedScan,
    connectToDevice,
    disconnect,
    setColor,
  } = useLed();

  const handleColorPress = (r: number, g: number, b: number) => {
    Haptics.selectionAsync();
    setColor(r, g, b);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Painel de Controle — Fita LED</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Buscar Fitas LED Próximas:</Text>

          {!isConnected ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.connectButton]}
                onPress={() => (isScanning ? stopLedScan() : startLedScan())}
              >
                {Boolean(isScanning) ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>🔍 Buscar LED</Text>
                )}
              </TouchableOpacity>

              {Boolean(scannedDevices.length > 0) && (
                <View style={styles.deviceList}>
                  <Text style={styles.subLabel}>Dispositivos Compatíveis:</Text>
                  {scannedDevices.map((device) => (
                    <TouchableOpacity
                      key={device.id}
                      style={styles.deviceItem}
                      onPress={() => connectToDevice(device.id)}
                    >
                      <Text style={styles.deviceName}>
                        {device.name || "Fita LED (Desconhecida)"}
                      </Text>
                      <Text style={styles.deviceId}>{device.id}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.disconnectButton]}
              onPress={() => {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning,
                );
                disconnect();
              }}
            >
              <Text style={styles.buttonText}>Desconectar Fita LED</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Status:{" "}
            <Text
              style={
                isConnected
                  ? styles.statusConnected
                  : isScanning
                    ? styles.statusScanning
                    : styles.statusDisconnected
              }
            >
              {isConnected
                ? `Conectado (${connectedDevice?.name || ledSettings.name})`
                : isScanning
                  ? "Buscando fitas LED..."
                  : "Desconectado"}
            </Text>
          </Text>

          {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {Boolean(isConnected) && (
          <View style={styles.card}>
            <Text style={styles.label}>Cores Rápidas:</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.name}
                  style={[styles.colorButton, { backgroundColor: color.hex }]}
                  onPress={() => handleColorPress(color.r, color.g, color.b)}
                >
                  <Text
                    style={[
                      styles.colorButtonText,
                      ["#FFFFFF", "#00FF00", "#FFFF00", "#00FFFF"].includes(
                        color.hex,
                      )
                        ? { color: "#000" }
                        : { color: "#FFF" },
                    ]}
                  >
                    {color.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(2, 8, 16, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 255, 255, 0.12)",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  label: {
    color: "#AAA",
    fontSize: 14,
    marginBottom: 8,
  },
  subLabel: {
    color: "#8be8ff",
    fontSize: 13,
    marginTop: 12,
    marginBottom: 6,
  },
  deviceList: {
    marginTop: 10,
    gap: 8,
  },
  deviceItem: {
    backgroundColor: "#2A2A2A",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  deviceName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  deviceId: {
    color: "#888",
    fontSize: 11,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  connectButton: {
    backgroundColor: "#007AFF",
  },
  disconnectButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  statusContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  statusText: {
    color: "#FFF",
    fontSize: 16,
  },
  statusConnected: {
    color: "#34C759",
    fontWeight: "bold",
  },
  statusScanning: {
    color: "#FF9500",
    fontWeight: "bold",
  },
  statusDisconnected: {
    color: "#FF3B30",
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF453A",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  colorButton: {
    width: "48%",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
  colorButtonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
