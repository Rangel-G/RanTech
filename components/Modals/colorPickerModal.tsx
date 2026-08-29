import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { runOnJS } from "react-native-reanimated";
import ColorPicker, {
    HueSlider,
    Panel1,
    Preview,
} from "reanimated-color-picker";

interface ColorPickerModalProps {
  visible: boolean;
  initialColor: string;
  onClose: () => void;
  onSelectColor: (hex: string) => void;
}

export function ColorPickerModal({
  visible,
  initialColor,
  onClose,
  onSelectColor,
}: ColorPickerModalProps) {
  const [finalColor, setFinalColor] = useState(initialColor);

  useEffect(() => {
    if (visible) setFinalColor(initialColor);
  }, [visible, initialColor]);

  const handleConfirm = () => {
    onSelectColor(finalColor);
    onClose();
  };

  const onColorComplete = ({ hex }: { hex: string }) => {
    "worklet";
    // @ts-ignore
    runOnJS(setFinalColor)(hex);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecione a Cor</Text>

          {/* Container flexível que divide a tela em duas colunas */}
          <View style={styles.contentRow}>
            {/* Coluna da Esquerda (Color Picker) */}
            <View style={styles.pickerColumn}>
              <ColorPicker
                style={{ width: "100%", gap: 16 }}
                value={initialColor}
                onComplete={onColorComplete}
              >
                <Panel1 style={{ height: 200, borderRadius: 8 }} />
                <HueSlider style={{ borderRadius: 8 }} />
                <Preview style={styles.previewBox} hideInitialColor />
              </ColorPicker>
            </View>

            {/* Coluna da Direita (Botões) */}
            <View style={styles.buttonsColumn}>
              <Pressable style={styles.actionButton} onPress={handleConfirm}>
                <Text style={styles.buttonText}>✓ Salvar</Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: "#ff6666" }]}>
                  Cancelar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center", // Centraliza o modal na tela
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#0a121e",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.3)",
  },
  modalTitle: {
    color: "#8be8ff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textTransform: "uppercase",
    textAlign: "center", // Mantém o título centralizado no topo
  },
  contentRow: {
    flexDirection: "row", // Faz os elementos ficarem lado a lado (Colunas)
    width: "100%",
    gap: 20, // Espaço entre o Color Picker e os botões
  },
  pickerColumn: {
    flex: 1, // Pega todo o espaço restante da esquerda
  },
  buttonsColumn: {
    width: 120, // Largura fixa para a coluna dos botões
    justifyContent: "flex-end", // Joga os botões para baixo (alinhados com o Preview)
    gap: 12, // Espaço vertical entre o Salvar e Cancelar
  },
  previewBox: {
    width: "100%",
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  actionButton: {
    width: "100%",
    paddingVertical: 14,
    backgroundColor: "rgba(0, 200, 150, 0.2)",
    borderColor: "rgba(0, 255, 200, 0.4)",
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 50, 50, 0.15)",
    borderColor: "rgba(255, 80, 80, 0.5)",
  },
  buttonText: {
    color: "#00ffaa",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
