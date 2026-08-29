import { MeetingData } from "@/services/firebase/group-service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MeetingInviteModalProps {
  meeting: MeetingData | null;
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function MeetingInviteModal({
  meeting,
  visible,
  onAccept,
  onDecline,
}: MeetingInviteModalProps) {
  if (!meeting) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={32}
              color="#00ffff"
            />
            <Text style={styles.title}>Convite de Encontro</Text>
          </View>

          <Text style={styles.subtitle}>
            <Text style={{ fontWeight: "bold", color: "#fff" }}>
              {meeting.creatorName}
            </Text>{" "}
            marcou um ponto de encontro para o comboio!
          </Text>

          <View style={styles.addressBox}>
            <MaterialCommunityIcons
              name="navigation-variant"
              size={20}
              color="#ffcc00"
            />
            <Text style={styles.addressText}>{meeting.address}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.declineBtn]}
              onPress={onDecline}
            >
              <Text style={styles.declineText}>Recusar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.acceptBtn]}
              onPress={onAccept}
            >
              <Text style={styles.acceptText}>Aceitar Encontro</Text>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  container: {
    backgroundColor: "#020810",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#00ffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 15, color: "#aaa", marginBottom: 20, lineHeight: 22 },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  addressText: { color: "#ffcc00", fontSize: 14, flexShrink: 1 },
  buttonContainer: { flexDirection: "row", gap: 12 },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  declineBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  acceptBtn: { backgroundColor: "#00ffff" },
  declineText: { color: "#ff4444", fontWeight: "bold", fontSize: 15 },
  acceptText: { color: "#000", fontWeight: "bold", fontSize: 15 },
});
