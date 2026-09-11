import { ClearRoutesModal } from "@/components/Modals/clearRouteModal";
import { MeetingInviteModal } from "@/components/Modals/meetingInviteModal";
import { RouteDecisionModal } from "@/components/Modals/routeDecisionModal";
import { StartRouteModal } from "@/components/Modals/startRouteModal";
import { TripSummaryModal } from "@/components/Modals/tripSumarryModal";
import { RealTimeMap } from "@/components/realTimeMaps";
import { RouteSearchBar } from "@/components/RouteSearchBar";
import { SpeedDialMenu } from "@/components/speedDialMenu";
import { RpmGaugeCard } from "@/components/ui/rpmGauge";
import { useGroup } from "@/contexts/group-context";
import { useCarData } from "@/hooks/useCarData";
import { useReception } from "@/hooks/useReception";
import {
  GroupMember,
  GroupService,
  MeetingData,
  RouteCoordinate,
} from "@/services/firebase/group-service";
import { UserService } from "@/services/firebase/user-service";
import { DirectionsService } from "@/services/google/directionService";
import { LoggerService } from "@/services/loggerService";
import { PushService } from "@/services/pushService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { getDistance, getDistanceFromLine } from "geolib";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RealMapScreen() {
  const { data } = useReception();
  const { activeGroup, userId, userName, pointerColor, routes, saveRoute } =
    useGroup();

  // ==========================================
  // LOGS DE CICLO DE VIDA
  // ==========================================
  useEffect(() => {
    LoggerService.log("INFO", "[RealMap] Tela montada e inicializada.");
    return () => {
      LoggerService.log("INFO", "[RealMap] Tela desmontada.");
    };
  }, []);

  const insets = useSafeAreaInsets();
  const carData = useCarData();
  const lastFirebaseUpdate = useRef<number>(0);
  const isRecalculating = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationScope, setNavigationScope] = useState<
    "public" | "private" | null
  >(null);
  const [startModalVisible, setStartModalVisible] = useState(false);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: -22.7394,
    longitude: -47.3316,
  });

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [temporaryDestination, setTemporaryDestination] =
    useState<RouteCoordinate | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<RouteCoordinate | null>(
    null
  );
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [isSelectingMeetingMode, setIsSelectingMeetingMode] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [activeMeeting, setActiveMeeting] = useState<MeetingData | null>(null);
  const [showMeetingInvite, setShowMeetingInvite] = useState(false);

  const tripStartTime = useRef<number>(0);
  const lastCoords = useRef<{ latitude: number; longitude: number } | null>(
    null
  );
  const accumulatedDistance = useRef<number>(0);
  const speedRecords = useRef<number[]>([]);

  const [tripSummaryData, setTripSummaryData] = useState<any | null>(null);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const currentHeading = useRef(data.heading);
  useEffect(() => {
    currentHeading.current = data.heading;
  }, [data.heading]);

  const activeNavigationRoutes = useMemo(() => {
    if (!navigationScope) return [];
    return routes
      .filter((r) =>
        navigationScope === "private" ? r.isPrivate : !r.isPrivate
      )
      .sort((a, b) => a.updatedAt - b.updatedAt);
  }, [routes, navigationScope]);

  const handleSelectScope = (scope: "public" | "private") => {
    LoggerService.log("INFO", `[RealMap] Iniciando rota no modo (${scope}).`);
    setNavigationScope(scope);
    setIsNavigating(true);
    setStartModalVisible(false);

    tripStartTime.current = Date.now();
    accumulatedDistance.current = 0;
    speedRecords.current = [];
    lastCoords.current = userLocation;
  };

  useEffect(() => {
    if (isNavigating && activeNavigationRoutes.length === 0) {
      LoggerService.log("INFO", "[RealMap] Todas as rotas concluídas.");
      setIsNavigating(false);
      setNavigationScope(null);
      Alert.alert("Chegada", "Você chegou ao seu destino final!");
    }
  }, [activeNavigationRoutes.length, isNavigating]);

  // Escuta Encontros no Grupo
  useEffect(() => {
    if (!activeGroup || !userId) return;

    LoggerService.log("INFO", `[RealMap] Escutando encontros do grupo: ${activeGroup}`);
    const unsubscribe = GroupService.subscribeToActiveMeeting(
      activeGroup,
      (meeting) => {
        setActiveMeeting(meeting);
        if (meeting) {
          const isCreator = meeting.creatorId === userId;
          const hasResponded = meeting.responses && meeting.responses[userId];
          setShowMeetingInvite(!isCreator && !hasResponded);
        } else {
          setShowMeetingInvite(false);
        }
      }
    );

    return () => {
      LoggerService.log("INFO", "[RealMap] Removendo escuta de encontros.");
      unsubscribe();
    };
  }, [activeGroup, userId]);

  // Escuta Membros do Grupo
  useEffect(() => {
    if (!activeGroup || !userId) {
      setMembers([]);
      return;
    }

    LoggerService.log("INFO", `[RealMap] Escutando membros do grupo: ${activeGroup}`);
    const unsubscribe = GroupService.subscribeToMembers(
      activeGroup,
      (updatedMembers) => {
        const otherMembers = updatedMembers.filter((m) => m.userId !== userId);
        setMembers(otherMembers);
      }
    );

    return () => {
      LoggerService.log("INFO", "[RealMap] Removendo escuta de membros.");
      unsubscribe();
    };
  }, [activeGroup, userId]);

  // 1. Referências para evitar reinicialização do GPS
  const speedRef = useRef(data.speed);
  const activeGroupRef = useRef(activeGroup);
  const userIdRef = useRef(userId);
  const userNameRef = useRef(userName);
  const pointerColorRef = useRef(pointerColor);
  const isNavigatingRef = useRef(isNavigating);
  const activeNavigationRoutesRef = useRef(activeNavigationRoutes);

  // Sincroniza as referências em cada render sem recriar hooks
  useEffect(() => {
    speedRef.current = data.speed;
    activeGroupRef.current = activeGroup;
    userIdRef.current = userId;
    userNameRef.current = userName;
    pointerColorRef.current = pointerColor;
    isNavigatingRef.current = isNavigating;
    activeNavigationRoutesRef.current = activeNavigationRoutes;
  });

  // 2. Rastreamento Estável do GPS (Inicia apenas UMA VEZ na montagem da tela)
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let localToken = expoPushToken;

    async function startTracking() {
      try {
        LoggerService.log("INFO", "[RealMap] Solicitando permissões de localização...");

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          LoggerService.log("WARN", "[RealMap] Permissão de GPS negada.");
          return;
        }

        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          setUserLocation({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          });
        }

        if (!localToken) {
          localToken = await PushService.registerForPushNotificationsAsync();
          if (localToken) setExpoPushToken(localToken);
        }

        LoggerService.log("INFO", "[RealMap] Ativando watchPositionAsync estável.");
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          async (location) => {
            LoggerService.log("INFO", `[GPS] Lat: ${location.coords.latitude}, Lng: ${location.coords.longitude}, Vel: ${location.coords.speed}`);
            try {
              const coords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };
              setUserLocation(coords);

              const now = Date.now();

              const currentNavigating = isNavigatingRef.current;
              const currentRoutes = activeNavigationRoutesRef.current;

              if (
                currentNavigating &&
                location.coords.speed !== null &&
                location.coords.speed > 1.5 &&
                location.coords.heading !== null &&
                location.coords.heading >= 0
              ) {
                currentHeading.current = location.coords.heading;
              } else if (!currentNavigating) {
                currentHeading.current = data.heading ?? currentHeading.current;
              }

              const activeRoute =
                currentRoutes.length > 0 ? currentRoutes[0] : null;

              if (currentNavigating && activeRoute && !isRecalculating.current) {
                let minDistance = Infinity;

                for (let i = 0; i < activeRoute.coordinates.length - 1; i++) {
                  const start = activeRoute.coordinates[i];
                  const end = activeRoute.coordinates[i + 1];

                  try {
                    const dist = getDistanceFromLine(coords, start, end);
                    if (dist < minDistance) minDistance = dist;
                  } catch (e) {
                    continue;
                  }
                }

                if (lastCoords.current) {
                  const distMeters = getDistance(lastCoords.current, coords);
                  if (distMeters > 2 && distMeters < 200) {
                    accumulatedDistance.current += distMeters;
                  }
                }
                lastCoords.current = coords;

                if (
                  location.coords.speed !== null &&
                  location.coords.speed >= 0
                ) {
                  const speedKmH = location.coords.speed * 3.6;
                  speedRecords.current.push(speedKmH);
                }

                if (minDistance > 50) {
                  isRecalculating.current = true;
                  LoggerService.log(
                    "WARN",
                    `[RealMap] Fora da rota (${Math.round(minDistance)}m). Recalculando...`
                  );

                  try {
                    const routeResult = await DirectionsService.getRoute(
                      coords,
                      activeRoute.destination,
                      apiKey
                    );

                    const routeId =
                      (activeRoute as any).id ||
                      (activeRoute as any).routeId ||
                      `rota_${Date.now()}`;

                    const updatedPayload = {
                      ...activeRoute,
                      origin: coords,
                      coordinates: routeResult.coordinates,
                    };

                    await saveRoute(
                      routeId,
                      updatedPayload,
                      activeRoute.isPrivate
                    );
                  } catch (error: any) {
                    LoggerService.log("ERROR", "[RealMap] Erro ao recalcular rota:", error?.message || error);
                  } finally {
                    isRecalculating.current = false;
                  }
                }
              }

              if (
                activeGroupRef.current &&
                userIdRef.current &&
                now - lastFirebaseUpdate.current >= 2000
              ) {
                lastFirebaseUpdate.current = now;

                GroupService.updateLocation(activeGroupRef.current, userIdRef.current, {
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  heading: currentHeading.current ?? 0,
                  pointerColor: pointerColorRef.current,
                  name: userNameRef.current,
                  pushToken: localToken,
                  speed: speedRef.current,
                });
              }
            } catch (innerError: any) {
              LoggerService.log("ERROR", "[RealMap] Erro no callback do GPS:", innerError?.message || innerError);
            }
          }
        );
      } catch (err: any) {
        LoggerService.log("ERROR", "[RealMap] Falha ao iniciar rastreamento:", err?.message || err);
      }
    }

    startTracking();

    return () => {
      if (subscription) {
        LoggerService.log("INFO", "[RealMap] Desmontando tela. Parando watchPositionAsync definitivo.");
        subscription.remove();
      }
    };
  }, []);

  const handleGenerateRoute = async (isPrivate: boolean, isReplace: boolean = false) => {
    if (!pendingCoords) return;

    try {
      LoggerService.log(
        "INFO",
        `[RealMap] Solicitando rota no Google Directions... (Privada: ${isPrivate})`
      );

      if (isReplace && userId) {
        if (isPrivate) {
          await UserService.clearPrivateRoutes(userId);
        } else if (activeGroup) {
          await GroupService.clearMyGroupRoutes(activeGroup, userId);
        }
      }

      const routeResult = await DirectionsService.getRoute(
        userLocation,
        pendingCoords,
        apiKey
      );

      const routeId = `rota_${Date.now()}`;
      const routePayload = {
        creatorId: userId || "user_local",
        creatorName: userName || "Piloto",
        color: pointerColor || "#00ffff",
        origin: userLocation,
        destination: {
          ...pendingCoords,
          address: destinationAddress || "Ponto Selecionado",
        },
        coordinates: routeResult.coordinates,
        isPrivate,
      };

      await saveRoute(routeId, routePayload, isPrivate);
      LoggerService.log("INFO", "[RealMap] Rota gerada e exibida com sucesso.");

      setModalVisible(false);
      setTemporaryDestination(null);
      setPendingCoords(null);
    } catch (error: any) {
      LoggerService.log("ERROR", "[RealMap] Falha ao traçar rota:", error?.message || error);
      Alert.alert(
        "Erro de Rota",
        error?.message || "Não foi possível calcular o trajeto para este destino."
      );
    }
  };

  const handleClearRoutes = async (type: "public" | "private" | "all") => {
    try {
      LoggerService.log("INFO", `[RealMap] Executando remoção de rotas do tipo: ${type}`);

      if ((type === "public" || type === "all") && activeGroup && userId) {
        await GroupService.clearMyGroupRoutes(activeGroup, userId);
      }

      if ((type === "private" || type === "all") && userId) {
        await UserService.clearPrivateRoutes(userId);
      }

      if (type === "all") {
        setIsNavigating(false);
        setNavigationScope(null);
      }

      setClearModalVisible(false);
      LoggerService.log("INFO", "[RealMap] Remoção de rotas concluída.");
    } catch (error: any) {
      LoggerService.log("ERROR", "[RealMap] Falha ao apagar rotas:", error?.message || error);
      Alert.alert("Erro", "Não foi possível remover as rotas solicitadas.");
    }
  };

  return (
    <View style={styles.container}>
      <RouteSearchBar
        onDestinationSelected={(loc, addr) => {
          LoggerService.log("INFO", `[RealMap] Destino pesquisado: ${addr}`);
          setTemporaryDestination(loc);
          setDestinationAddress(addr || "Destino Pesquisado");
          setPendingCoords(loc);
          setModalVisible(true);
        }}
      />

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </Pressable>

      <RealTimeMap
        latitude={userLocation.latitude}
        longitude={userLocation.longitude}
        heading={data.heading ?? 0}
        isNavigating={isNavigating}
        userColor={pointerColor}
        members={members}
        routes={routes}
        temporaryDestination={temporaryDestination}
        onLongPressMap={(coord) => {
          LoggerService.log("INFO", "[RealMap] Ponto marcado com toque longo no mapa.");
          setTemporaryDestination(coord);
          setDestinationAddress("Ponto no Mapa");
          setPendingCoords(coord);
          setModalVisible(true);
        }}
      />

      <RouteDecisionModal
        visible={modalVisible}
        hasExistingRoute={routes.length > 0}
        destinationName={destinationAddress}
        onReplace={async (isPrivate) => {
          LoggerService.log("INFO", "[RealMap] Ação: Substituir rota atual.");
          await handleGenerateRoute(isPrivate, true);
        }}
        onNextStop={async (isPrivate) => {
          LoggerService.log("INFO", "[RealMap] Ação: Adicionar próxima parada.");
          await handleGenerateRoute(isPrivate, false);
        }}
        onCreateSingle={async (isPrivate) => {
          LoggerService.log("INFO", "[RealMap] Ação: Iniciar rota única.");
          await handleGenerateRoute(isPrivate, true);
        }}
        onCancel={() => {
          setModalVisible(false);
          setTemporaryDestination(null);
          setPendingCoords(null);
        }}
      />

      <SpeedDialMenu
        onMeetingPress={() => setIsSelectingMeetingMode(true)}
        onClearPress={() => setClearModalVisible(true)}
      />

      <ClearRoutesModal
        visible={clearModalVisible}
        onClear={handleClearRoutes}
        onCancel={() => setClearModalVisible(false)}
      />

      <MeetingInviteModal
        meeting={activeMeeting}
        visible={showMeetingInvite}
        onAccept={() => setShowMeetingInvite(false)}
        onDecline={() => setShowMeetingInvite(false)}
      />

      <TripSummaryModal
        visible={summaryModalVisible}
        data={tripSummaryData}
        onClose={() => setSummaryModalVisible(false)}
      />

      <TouchableOpacity
        style={[
          styles.navActionButton,
          isNavigating ? styles.navActionStop : styles.navActionStart,
        ]}
        onPress={() => {
          if (isNavigating) {
            LoggerService.log("INFO", "[RealMap] Navegação encerrada pelo usuário.");
            setIsNavigating(false);
            setNavigationScope(null);
          } else {
            setStartModalVisible(true);
          }
        }}
      >
        <MaterialCommunityIcons
          name={isNavigating ? "stop-circle-outline" : "navigation"}
          size={24}
          color={isNavigating ? "#ff4444" : "#000000"}
        />
        <Text
          style={[
            styles.navActionText,
            isNavigating ? styles.navTextStop : styles.navTextStart,
          ]}
        >
          {isNavigating ? "Encerrar Trajeto" : "Iniciar Rota"}
        </Text>
      </TouchableOpacity>

      {/* HUD DE NAVEGAÇÃO: Exibido APENAS quando a navegação estiver ativa */}
      {isNavigating && (
        <View 
          style={[styles.hudContainer, { top: insets.top + 16 }]} 
          pointerEvents="none"
        >
          <View style={styles.gaugeWrapper}>
            <RpmGaugeCard
              rpm={carData.rpm}
              speed={carData.speed}
            />
          </View>
        </View>
      )}

      <StartRouteModal
        visible={startModalVisible}
        routes={routes}
        onSelectScope={handleSelectScope}
        onCancel={() => setStartModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020810",
  },
  backButton: {
    position: "absolute",
    bottom: "6%",
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(2, 8, 16, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.3)",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 6,
  },
  backButtonText: {
    color: "#8be8ff",
    fontSize: 14,
    fontWeight: "bold",
  },
  navActionButton: {
    position: "absolute",
    bottom: "6%",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 30,
    gap: 8,
    elevation: 6,
  },
  navActionStart: {
    backgroundColor: "#00ffff",
  },
  navActionStop: {
    backgroundColor: "#1a0505",
    borderWidth: 1.5,
    borderColor: "#ff4444",
  },
  navActionText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  navTextStart: {
    color: "#000000",
  },
  navTextStop: {
    color: "#ff4444",
  },
  hudContainer: {
    position: "absolute",
    right: 16,
    zIndex: 50,
    alignItems: "flex-end",
  },
  gaugeWrapper: {
    transform: [{ scale: 0.7 }],
    transformOrigin: "top right",
  },
});