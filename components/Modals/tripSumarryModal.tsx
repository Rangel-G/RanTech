import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TripSummaryProps {
  visible: boolean;
  data: {
    distanceKm: number;
    durationFormatted: string;
    maxSpeedKmH: number;
    avgSpeedKmH: number;
    destinationAddress: string;
    userName: string;
  } | null;
  onClose: () => void;
}

export function TripSummaryModal({ visible, data, onClose }: TripSummaryProps) {
  if (!data) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="flag-checkered"
              size={32}
              color="#00ffff"
            />
            <Text style={styles.title}>Resumo da Viagem</Text>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.card}>
              <MaterialCommunityIcons name="map" size={24} color="#00ffff" />
              <Text style={styles.cardValue}>{data.distanceKm} km</Text>
              <Text style={styles.cardLabel}>Distância</Text>
            </View>

            <View style={styles.card}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="#00ffff"
              />
              <Text style={styles.cardValue}>{data.durationFormatted}</Text>
              <Text style={styles.cardLabel}>Tempo</Text>
            </View>

            <View style={styles.card}>
              <MaterialCommunityIcons
                name="speedometer"
                size={24}
                color="#ffaa00"
              />
              <Text style={styles.cardValue}>{data.maxSpeedKmH} km/h</Text>
              <Text style={styles.cardLabel}>Vel. Máxima</Text>
            </View>

            <View style={styles.card}>
              <MaterialCommunityIcons
                name="car-speed-limiter"
                size={24}
                color="#ffaa00"
              />
              <Text style={styles.cardValue}>{data.avgSpeedKmH} km/h</Text>
              <Text style={styles.cardLabel}>Vel. Média</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Voltar ao Mapa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "80%",
    height: "110%",
    maxWidth: 380,
    backgroundColor: "#020810",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#00ffff55",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  destinationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  destinationText: { color: "#aaa", fontSize: 13, flex: 1 },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: "47%",
    height:"40%",
    backgroundColor: "rgba(0,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(0,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 4,
  },
  cardLabel: { fontSize: 12, color: "#888" },
  closeButton: {
    top:"-10%",
    backgroundColor: "#00ffff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: { color: "#000", fontWeight: "bold", fontSize: 15 },
});
