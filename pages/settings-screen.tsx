import { ColorPickerModal } from "@/components/Modals/colorPickerModal";
import { ExpandablePanel } from "@/components/ui/expandable-panel";
import { useConnection } from "@/contexts/connectionContext";
import { useGroup } from "@/contexts/group-context";
import { useLed } from "@/contexts/led-context";
import { UserService } from "@/services/firebase/user-service";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    DEFAULT_GEAR_SETTINGS,
    DEFAULT_OBD_SETTINGS,
    GearSettings,
    ObdSettings,
    SettingsStorage,
} from "../services/storage/settings-storage";

export function SettingsScreen() {
  const {
    status,
    scannedDevices,
    errorMessage,
    startScan,
    stopScan,
    connect,
    disconnect,
  } = useConnection();

  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [currentColorKey, setCurrentColorKey] = useState<
    "map" | "normal" | "redline" | null
  >(null);
  const [selectedColor, setSelectedColor] = useState("#00FFFF");

  const openColorPicker = (
    key: "map" | "normal" | "redline",
    initialColor: string,
  ) => {
    setCurrentColorKey(key);
    setSelectedColor(initialColor || "#00FFFF");
    setColorModalVisible(true);
  };

  const handleSelectColor = ({ hex }: { hex: string }) => {
    if (currentColorKey === "map") setMapColor(hex);
    if (currentColorKey === "normal")
      updateLedSettings({ ...ledSettings, colorNormal: hex });
    if (currentColorKey === "redline")
      updateLedSettings({ ...ledSettings, colorRedline: hex });
  };

  const {
    user,
    activeGroup,
    userName,
    pointerColor,
    saveMapSettings,
    createGroup,
    joinGroup,
    leaveGroup,
    logout,
    promptGoogleLogin,
  } = useGroup();

  const obdTypeOptions = [
    { value: "bluetooth", label: "Bluetooth ELM327 (Porta COM)" },
    { value: "usb", label: "USB Direto (Porta COM)" },
  ];

  const baudRateOptions = ["9600", "38400", "115200", "500000"];
  const protocolOptions = [
    { value: "auto", label: "Auto Detectar (ATSP0)" },
    { value: "iso9141", label: "ISO 9141-2" },
    { value: "iso14230", label: "ISO 14230-4 (KWP)" },
    { value: "can11-500", label: "CAN 11-bit / 500 Kbps" },
    { value: "can29-500", label: "CAN 29-bit / 500 Kbps" },
    { value: "can11-250", label: "CAN 11-bit / 250 Kbps" },
    { value: "can29-250", label: "CAN 29-bit / 250 Kbps" },
  ];

  const ftdiDevices = [
    { value: "", label: "-- Nenhum adaptador encontrado --" },
    { value: "FTDI-123456", label: "FTDI-123456" },
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [obdSettings, setObdSettings] =
    useState<ObdSettings>(DEFAULT_OBD_SETTINGS);
  const [gearSettings, setGearSettings] = useState<GearSettings>(
    DEFAULT_GEAR_SETTINGS,
  );

  // Estado do Formulário do Perfil e Grupo
  const [mapColor, setMapColor] = useState(pointerColor);
  const [pilotName, setPilotName] = useState(userName);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [groupPasswordInput, setGroupPasswordInput] = useState("");

  // Sincroniza estados do contexto quando carregados
  useEffect(() => {
    setMapColor(pointerColor);
    setPilotName(userName);
  }, [pointerColor, userName]);

  // Dados Globais do LED via Contexto
  const {
    ledSettings,
    updateLedSettings,
    isConnected: isLedConnected,
    isScanning: isLedScanning,
    connectToLed,
    disconnect: disconnectLed,
  } = useLed();

  useEffect(() => {
    async function loadOtherSettings() {
      setIsLoading(true);
      const [savedObd, savedGear] = await Promise.all([
        SettingsStorage.getObdSettings(),
        SettingsStorage.getGearSettings(),
      ]);

      setObdSettings(savedObd);
      setGearSettings(savedGear);
      setIsLoading(false);
    }
    loadOtherSettings();
  }, []);

  const handleSaveObd = async () => {
    await SettingsStorage.saveObdSettings(obdSettings);
    if (user?.uid) {
      await UserService.saveUserSettings(user.uid, { obd: obdSettings });
    }
    Alert.alert("Sucesso", "Configurações OBD salvas!");
  };

  const handleSaveLed = async () => {
    if (!ledSettings.name.trim() || !ledSettings.uuid.trim()) {
      Alert.alert("Erro", "Nome e UUID do LED não podem ficar vazios.");
      return;
    }
    await updateLedSettings(ledSettings);

    if (user?.uid) {
      await UserService.saveUserSettings(user.uid, { led: ledSettings });
    }
    Alert.alert("Sucesso", "Configurações do LED salvas!");
  };

  const handleSaveGear = async () => {
    await SettingsStorage.saveGearSettings(gearSettings);
    if (user?.uid) {
      await UserService.saveUserSettings(user.uid, { gear: gearSettings });
    }
    Alert.alert("Sucesso", "Relações de Marcha salvas!");
  };

  const handleSaveMapSettings = async () => {
    await saveMapSettings(mapColor, pilotName);
    if (user?.uid) {
      await UserService.saveUserSettings(user.uid, {
        profile: {
          pilotName,
          pointerColor: mapColor,
          activeGroup,
        },
      });
    }
    Alert.alert("Sucesso", "Configurações do Perfil salvas!");
  };

  const handleCreateGroup = async () => {
    if (!groupNameInput.trim() || !groupPasswordInput.trim()) {
      Alert.alert("Atenção", "Informe o nome e a senha do grupo.");
      return;
    }

    try {
      await createGroup(groupNameInput, groupPasswordInput);
      Alert.alert("Sucesso", `Grupo "${groupNameInput}" criado!`);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao criar o grupo.");
    }
  };

  const handleJoinGroup = async () => {
    if (!groupNameInput.trim() || !groupPasswordInput.trim()) {
      Alert.alert("Atenção", "Informe o nome e a senha do grupo.");
      return;
    }

    try {
      await joinGroup(groupNameInput, groupPasswordInput);
      Alert.alert("Sucesso", `Você entrou no grupo "${groupNameInput}"!`);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao entrar no grupo.");
    }
  };

  const handleLeaveGroup = async () => {
    await leaveGroup();
    setGroupNameInput("");
    setGroupPasswordInput("");
    Alert.alert("Sucesso", "Você saiu do grupo.");
  };

  const renderOptionButtonList = (
    items: Array<{ value: string; label: string }>,
    selectedValue: string,
    onSelect: (value: string) => void,
    isCompact = false,
  ) => (
    <View
      style={[
        styles.selectContainer,
        isCompact && styles.selectContainerCompact,
      ]}
    >
      {items.map((item) => (
        <Pressable
          key={item.value || item.label}
          style={[
            styles.selectButton,
            selectedValue === item.value && styles.selectButtonActive,
            isCompact && styles.selectButtonCompact,
          ]}
          onPress={() => onSelect(item.value)}
        >
          <Text
            style={[
              styles.selectButtonText,
              selectedValue === item.value && styles.selectButtonTextActive,
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ffff" />
      </View>
    );
  }

  const showFtdiSelector = obdSettings.connectionType === "usb";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Status da Conta do Usuário */}
      <ExpandablePanel
        title="Conta e Autenticação"
        icon="👤"
        status={user ? user.email || "Conectado" : "Não Logado"}
      >
        {user ? (
          <View style={styles.fieldContainer}>
            <Text style={styles.accountText}>Logado como: {user.email}</Text>
            <Pressable
              style={[styles.actionButton, styles.leaveButton]}
              onPress={logout}
            >
              <Text style={styles.leaveButtonText}>
                🚪 Sair da Conta Google
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.fieldContainer}>
            <Text style={styles.accountText}>
              Faça login com a sua Conta Google na tela inicial para sincronizar
              suas preferências.
            </Text>

            <Pressable
              style={[styles.actionButton, styles.connectButton]}
              onPress={() => promptGoogleLogin()}
            >
              <Text style={styles.buttonText}>🔑 Entrar com Google</Text>
            </Pressable>
          </View>
        )}
      </ExpandablePanel>

      {/* Configurações do Mapa e Perfil do Piloto (Exibido apenas se houver e-mail logado) */}
      {user?.email ? (
        <ExpandablePanel
          title="Perfil e Configurações do Mapa"
          icon="🗺️"
          status={activeGroup ? `🟢 Grupo: ${activeGroup}` : "Sem Grupo"}
        >
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nome do Piloto</Text>
            <TextInput
              style={styles.textInput}
              value={pilotName}
              onChangeText={setPilotName}
              placeholder="Ex: Ayrton Senna"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Cor do Pointer Pessoal</Text>
            <View style={styles.colorPickerWrapper}>
              <TextInput
                style={[styles.textInput, styles.colorInput]}
                value={mapColor}
                editable={false}
                placeholder="#00FFFF"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />
              <Pressable
                style={[
                  styles.colorPreview,
                  { backgroundColor: mapColor || "#00ffff" },
                ]}
                onPress={() => openColorPicker("map", mapColor)}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSaveMapSettings}
            >
              <Text style={styles.buttonText}>✓ Salvar Perfil / Cor</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nome do Grupo</Text>
            <TextInput
              style={styles.textInput}
              value={groupNameInput}
              onChangeText={setGroupNameInput}
              placeholder="Ex: Serra do Mar Rally"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              editable={!activeGroup}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Senha do Grupo</Text>
            <TextInput
              style={styles.textInput}
              value={groupPasswordInput}
              onChangeText={setGroupPasswordInput}
              placeholder="••••••••"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              secureTextEntry
              editable={!activeGroup}
            />
          </View>

          {activeGroup ? (
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.actionButton, styles.leaveButton]}
                onPress={handleLeaveGroup}
              >
                <Text style={styles.leaveButtonText}>
                  🚪 Sair do Grupo ({activeGroup})
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleCreateGroup}
              >
                <Text style={styles.buttonText}>➕ Criar Grupo</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.connectButton]}
                onPress={handleJoinGroup}
              >
                <Text style={styles.buttonText}>🔑 Entrar no Grupo</Text>
              </Pressable>
            </View>
          )}
        </ExpandablePanel>
      ) : null}

      {/* Configuração OBD-II */}
      <ExpandablePanel
        title="Configurar Conexão OBD"
        icon="🔌"
        status={obdSettings.port}
      >
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Tipo de Conexão</Text>
          {renderOptionButtonList(
            obdTypeOptions,
            obdSettings.connectionType,
            (value) =>
              setObdSettings({ ...obdSettings, connectionType: value }),
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Porta Serial</Text>
          <TextInput
            style={styles.textInput}
            value={obdSettings.port}
            onChangeText={(text) =>
              setObdSettings({ ...obdSettings, port: text })
            }
            placeholder="COM4"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
          />
        </View>

        {showFtdiSelector && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Adaptador FTDI Detectado</Text>
            <View style={styles.inlineFieldRow}>
              <View style={styles.inlineFieldFlex}>
                {renderOptionButtonList(
                  ftdiDevices,
                  obdSettings.ftdiDevice,
                  (value) =>
                    setObdSettings({ ...obdSettings, ftdiDevice: value }),
                  true,
                )}
              </View>
              <Pressable
                style={[styles.actionButton, styles.smallActionButton]}
              >
                <Text style={styles.buttonText}>🔄 Buscar</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Baud Rate</Text>
          <View style={styles.selectContainer}>
            {baudRateOptions.map((rate) => (
              <Pressable
                key={rate}
                style={[
                  styles.selectButton,
                  obdSettings.baudRate === rate && styles.selectButtonActive,
                ]}
                onPress={() =>
                  setObdSettings({ ...obdSettings, baudRate: rate })
                }
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    obdSettings.baudRate === rate &&
                      styles.selectButtonTextActive,
                  ]}
                >
                  {rate}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Protocolo OBD</Text>
          <View style={[styles.selectContainer]}>
            {protocolOptions.map((protocol) => (
              <Pressable
                key={protocol.value}
                style={[
                  styles.selectButton,
                  styles.protocolButton,
                  obdSettings.protocol === protocol.value &&
                    styles.selectButtonActive,
                ]}
                onPress={() =>
                  setObdSettings({ ...obdSettings, protocol: protocol.value })
                }
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    obdSettings.protocol === protocol.value &&
                      styles.selectButtonTextActive,
                  ]}
                >
                  {protocol.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Dispositivo OBD (Bluetooth LE)</Text>

          <Pressable
            style={[
              styles.actionButton,
              status === "SCANNING" && styles.connectButton,
            ]}
            onPress={() => (status === "SCANNING" ? stopScan() : startScan())}
            disabled={status === "CONNECTING"}
          >
            <Text style={styles.buttonText}>
              {status === "SCANNING"
                ? "⏹ Parar Busca"
                : "🔍 Buscar Adaptador OBD"}
            </Text>
          </Pressable>

          {status === "SCANNING" && (
            <ActivityIndicator
              size="small"
              color="#00ffff"
              style={{ marginTop: 10 }}
            />
          )}

          {errorMessage && (
            <Text style={{ color: "#ff6666", fontSize: 12, marginTop: 8 }}>
              {errorMessage}
            </Text>
          )}

          {scannedDevices.length > 0 && (
            <View style={[styles.selectContainer, { marginTop: 10 }]}>
              {scannedDevices.map((device) => (
                <Pressable
                  key={device.id}
                  style={styles.selectButton}
                  onPress={() => connect(device.id)}
                  disabled={status === "CONNECTING"}
                >
                  <Text style={styles.selectButtonText}>
                    {device.name || device.id}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveObd}
          >
            <Text style={styles.buttonText}>✓ Salvar Conexão</Text>
          </Pressable>

          {status === "CONNECTED" && (
            <Pressable
              style={[styles.actionButton, styles.connectButton]}
              onPress={disconnect}
            >
              <Text style={styles.buttonText}>✓ Conectado — Desconectar</Text>
            </Pressable>
          )}
        </View>
      </ExpandablePanel>

      {/* Configuração Dispositivo LED */}
      <ExpandablePanel
        title="Configurar Dispositivo LED"
        icon="💡"
        status={isLedConnected ? "🟢 Conectado" : ledSettings.name}
      >
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Nome do Dispositivo BLE</Text>
          <TextInput
            style={styles.textInput}
            value={ledSettings.name}
            onChangeText={(text) =>
              updateLedSettings({ ...ledSettings, name: text })
            }
            placeholder="LEDDMX-000101"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>UUID da Característica</Text>
          <TextInput
            style={styles.textInput}
            value={ledSettings.uuid}
            onChangeText={(text) =>
              updateLedSettings({ ...ledSettings, uuid: text })
            }
            placeholder="0000ffe1-0000-1000-8000-00805f9b34fb"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.twoColumnRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>RPM do Shift Light</Text>
            <TextInput
              style={styles.textInput}
              value={String(ledSettings.redlineRpm ?? "")}
              onChangeText={(text) => {
                const numericValue =
                  text === "" ? 0 : Number(text.replace(/[^0-9]/g, ""));
                updateLedSettings({ ...ledSettings, redlineRpm: numericValue });
              }}
              placeholder="3000"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />
          </View>

          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Velocidade do Pisca (ms)</Text>
            <TextInput
              style={styles.textInput}
              value={String(ledSettings.blinkSpeed ?? "")}
              onChangeText={(text) => {
                const numericValue =
                  text === "" ? 0 : Number(text.replace(/[^0-9]/g, ""));
                updateLedSettings({ ...ledSettings, blinkSpeed: numericValue });
              }}
              placeholder="70"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Cor Normal</Text>
            <View style={styles.colorPickerWrapper}>
              <TextInput
                style={[styles.textInput, styles.colorInput]}
                value={ledSettings.colorNormal}
                editable={false}
                placeholder="#0084ff"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />
              <Pressable
                style={[
                  styles.colorPreview,
                  { backgroundColor: ledSettings.colorNormal || "#0084ff" },
                ]}
                onPress={() =>
                  openColorPicker("normal", ledSettings.colorNormal)
                }
              />
            </View>
          </View>

          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Cor Redline</Text>
            <View style={styles.colorPickerWrapper}>
              <TextInput
                style={[styles.textInput, styles.colorInput]}
                value={ledSettings.colorRedline}
                editable={false}
                placeholder="#ff0000"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
              />
              <Pressable
                style={[
                  styles.colorPreview,
                  { backgroundColor: ledSettings.colorRedline || "#ff0000" },
                ]}
                onPress={() =>
                  openColorPicker("redline", ledSettings.colorRedline)
                }
              />
            </View>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <View style={styles.toggleRow}>
            <Text style={styles.fieldLabel}>Shift Light Auto</Text>
            <Switch
              value={ledSettings.autoShift}
              onValueChange={(value) =>
                updateLedSettings({ ...ledSettings, autoShift: value })
              }
              trackColor={{ false: "#333", true: "#00ff66" }}
              thumbColor={ledSettings.autoShift ? "#00ff99" : "#999"}
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveLed}
          >
            <Text style={styles.buttonText}>✓ Salvar LED</Text>
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              isLedConnected ? styles.connectButton : {},
            ]}
            onPress={() => (isLedConnected ? disconnectLed() : connectToLed())}
            disabled={isLedScanning}
          >
            <Text style={styles.buttonText}>
              {isLedScanning
                ? "Buscando..."
                : isLedConnected
                  ? "✓ Conectado"
                  : "Conectar LED"}
            </Text>
          </Pressable>
        </View>
      </ExpandablePanel>

      {/* Calibração de Marchas */}
      <ExpandablePanel
        title="Calibrar Rel. Marcha"
        icon="🚗"
        status="5 marchas"
      >
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Relação de Marchas (separadas por vírgula)
          </Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={gearSettings.ratios}
            onChangeText={(text) =>
              setGearSettings({ ...gearSettings, ratios: text })
            }
            placeholder="3.58,1.93,1.41,1.11,0.88"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            multiline
          />
        </View>

        <View style={styles.twoColumnRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Relação Diferencial</Text>
            <TextInput
              style={styles.textInput}
              value={gearSettings.differential}
              onChangeText={(text) =>
                setGearSettings({ ...gearSettings, differential: text })
              }
              placeholder="4.25"
              keyboardType="decimal-pad"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Perímetro do Pneu (m)</Text>
            <TextInput
              style={styles.textInput}
              value={gearSettings.tirePerimeter}
              onChangeText={(text) =>
                setGearSettings({ ...gearSettings, tirePerimeter: text })
              }
              placeholder="1.83"
              keyboardType="decimal-pad"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveGear}
          >
            <Text style={styles.buttonText}>✓ Salvar Rel. Marcha</Text>
          </Pressable>
        </View>
      </ExpandablePanel>

      <ColorPickerModal
        visible={colorModalVisible}
        initialColor={selectedColor}
        onSelectColor={(hex) => handleSelectColor({ hex })}
        onClose={() => setColorModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(2, 8, 16, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 255, 255, 0.12)",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "rgba(2, 8, 16, 0.96)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  accountText: {
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#8be8ff",
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 255, 255, 0.15)",
    marginVertical: 16,
  },
  textInput: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.2)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "monospace",
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  halfField: {
    flex: 1,
  },
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectContainerCompact: {
    flexDirection: "column",
  },
  selectButton: {
    flex: 1,
    minHeight: 42,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.2)",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
  },
  selectButtonCompact: {
    flex: 0,
    minHeight: 38,
  },
  selectButtonActive: {
    borderColor: "rgba(0, 255, 255, 0.6)",
    backgroundColor: "rgba(0, 255, 255, 0.1)",
  },
  selectButtonText: {
    color: "#8be8ff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  selectButtonTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  protocolGrid: {
    flexDirection: "column",
  },
  protocolButton: {
    flex: 0,
    minHeight: 44,
  },
  inlineFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineFieldFlex: {
    flex: 1,
  },
  smallActionButton: {
    minWidth: 110,
    paddingVertical: 10,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "rgba(0, 200, 150, 0.2)",
    borderColor: "rgba(0, 255, 200, 0.4)",
  },
  connectButton: {
    backgroundColor: "rgba(0, 255, 100, 0.15)",
    borderColor: "rgba(0, 255, 100, 0.5)",
  },
  leaveButton: {
    backgroundColor: "rgba(255, 50, 50, 0.15)",
    borderColor: "rgba(255, 80, 80, 0.5)",
  },
  buttonText: {
    color: "#00ffaa",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  leaveButtonText: {
    color: "#ff6666",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  colorPickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorInput: {
    flex: 1,
    textTransform: "uppercase",
    opacity: 0.85,
  },
  colorPreview: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  nativeColorInput: {
    position: "absolute",
    top: -10,
    left: -10,
    width: 60,
    height: 60,
    opacity: 0,
    cursor: "pointer",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
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
    alignItems: "center",
  },
  modalTitle: {
    color: "#8be8ff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textTransform: "uppercase",
  },
  closeModalButton: {
    marginTop: 20,
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "rgba(0, 200, 150, 0.2)",
    borderColor: "rgba(0, 255, 200, 0.4)",
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
  },
});
