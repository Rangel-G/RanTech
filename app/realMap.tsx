import { ClearRoutesModal } from "@/components/Modals/clearRouteModal";
import { MeetingInviteModal } from "@/components/Modals/meetingInviteModal";
import { RouteDecisionModal } from "@/components/Modals/routeDecisionModal";
import { StartRouteModal } from "@/components/Modals/startRouteModal";
import { StatusSelectionModal } from "@/components/Modals/statusSelectionModal";
import { TripSummaryModal } from "@/components/Modals/tripSumarryModal";
import { RealTimeMap } from "@/components/realTimeMaps";
import { RouteSearchBar } from "@/components/RouteSearchBar";
import { SpeedDialMenu } from "@/components/speedDialMenu";
import { useGroup } from "@/contexts/group-context";
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

export default function RealMapScreen() {
  const { data } = useReception();
  const { activeGroup, userId, userName, pointerColor, routes, saveRoute } =
    useGroup();

  // ==========================================
  // LOG DE MONTAGEM DA TELA
  // ==========================================
  useEffect(() => {
    LoggerService.log("INFO", "RealMapScreen: Componente montado.");
    return () => {
      LoggerService.log("INFO", "RealMapScreen: Componente desmontado.");
    };
  }, []);

  // ==========================================
  // TODOS OS HOOKS AGRUPADOS EXATAMENTE NO TOPO
  // ==========================================
  const isRecalculating = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationScope, setNavigationScope] = useState<
    "public" | "private" | null
  >(null);
  const [startModalVisible, setStartModalVisible] = useState(false);

  // Inicializado com coordenada padrão para abertura instantânea do mapa
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
    null,
  );
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [isSelectingMeetingMode, setIsSelectingMeetingMode] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [activeMeeting, setActiveMeeting] = useState<MeetingData | null>(null);
  const [showMeetingInvite, setShowMeetingInvite] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const tripStartTime = useRef<number>(0);
  const lastCoords = useRef<{ latitude: number; longitude: number } | null>(
    null,
  );
  const accumulatedDistance = useRef<number>(0);
  const speedRecords = useRef<number[]>([]);

  const [tripSummaryData, setTripSummaryData] = useState<any | null>(null);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);

  const currentStatus = useRef<
    "active" | "fuel" | "flat_tire" | "food" | "stopped"
  >("active");

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const currentHeading = useRef(data.heading);
  useEffect(() => {
    currentHeading.current = data.heading;
  }, [data.heading]);

  // Filtra e ordena as rotas do escopo selecionado
  const activeNavigationRoutes = useMemo(() => {
    if (!navigationScope) return [];
    return routes
      .filter((r) =>
        navigationScope === "private" ? r.isPrivate : !r.isPrivate,
      )
      .sort((a, b) => a.updatedAt - b.updatedAt);
  }, [routes, navigationScope]);

  const handleSelectScope = (scope: "public" | "private") => {
    LoggerService.log("INFO", `RealMapScreen: Escopo selecionado (${scope}). Iniciando navegação.`);
    setNavigationScope(scope);
    setIsNavigating(true);
    setStartModalVisible(false);

    // Reseta e inicia as métricas da viagem
    tripStartTime.current = Date.now();
    accumulatedDistance.current = 0;
    speedRecords.current = [];
    lastCoords.current = userLocation;
  };

  // Encerra a navegação 3D automaticamente
  useEffect(() => {
    if (isNavigating && activeNavigationRoutes.length === 0) {
      LoggerService.log("INFO", "RealMapScreen: Chegada ao destino final atingida.");
      setIsNavigating(false);
      setNavigationScope(null);
      Alert.alert("Chegada", "Você chegou ao seu destino final!");
    }
  }, [activeNavigationRoutes.length, isNavigating]);

  // Escuta os Encontros Ativos no Grupo
  useEffect(() => {
    if (!activeGroup || !userId) return;

    LoggerService.log("INFO", "RealMapScreen: Inscrevendo escuta de encontros ativos.", { activeGroup });
    const unsubscribe = GroupService.subscribeToActiveMeeting(
      activeGroup,
      (meeting) => {
        setActiveMeeting(meeting);

        if (meeting) {
          const isCreator = meeting.creatorId === userId;
          const hasResponded = meeting.responses && meeting.responses[userId];

          if (!isCreator && !hasResponded) {
            setShowMeetingInvite(true);
          } else {
            setShowMeetingInvite(false);
          }
        } else {
          setShowMeetingInvite(false);
        }
      },
    );

    return () => unsubscribe();
  }, [activeGroup, userId]);

  // 1. Escuta membros do grupo em tempo real
  useEffect(() => {
    if (!activeGroup || !userId) {
      setMembers([]);
      return;
    }

    LoggerService.log("INFO", "RealMapScreen: Inscrevendo escuta de membros do grupo.");
    const unsubscribe = GroupService.subscribeToMembers(
      activeGroup,
      (updatedMembers) => {
        const otherMembers = updatedMembers.filter((m) => m.userId !== userId);
        setMembers(otherMembers);
      },
    );

    return () => unsubscribe();
  }, [activeGroup, userId]);

  // 2. Rastreia e transmite a posição no grupo (Com Rerouting Inteligente)
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let localToken = expoPushToken;

    async function startTracking() {
      try {
        LoggerService.log("INFO", "RealMapScreen: Solicitando permissão de localização...");
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          LoggerService.log("WARN", "RealMapScreen: Permissão de localização negada pelo usuário.");
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

        LoggerService.log("INFO", "RealMapScreen: Iniciando rastreamento de localização contínuo.");
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 3,
          },
          async (location) => {
            const coords = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            setUserLocation(coords);

            // --- CÂMERA DE NAVEGAÇÃO SUAVE ---
            if (
              isNavigating &&
              location.coords.speed !== null &&
              location.coords.speed > 1.5 &&
              location.coords.heading !== null &&
              location.coords.heading >= 0
            ) {
              currentHeading.current = location.coords.heading;
            } else if (!isNavigating) {
              currentHeading.current = data.heading ?? currentHeading.current;
            }

            // --- RECÁLCULO AUTOMÁTICO DE ROTA ---
            const activeRoute =
              activeNavigationRoutes.length > 0
                ? activeNavigationRoutes[0]
                : null;

            if (isNavigating && activeRoute && !isRecalculating.current) {
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

              // --- COLETA DE MÉTRICAS DA VIAGEM ---
              if (isNavigating) {
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
              }

              if (minDistance > 50) {
                isRecalculating.current = true;
                LoggerService.log("WARN", "RealMapScreen: Veículo fora da rota (> 50m). Recalculando itinerário...", { minDistance });

                try {
                  const routeResult = await DirectionsService.getRoute(
                    coords,
                    activeRoute.destination,
                    apiKey,
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

                  await saveRoute(routeId, updatedPayload, activeRoute.isPrivate);
                  LoggerService.log("INFO", "RealMapScreen: Rota recalculada e atualizada com sucesso.");
                } catch (error: any) {
                  LoggerService.log("ERROR", "RealMapScreen: Erro ao tentar recalcular rota", error?.message || error);
                  console.error("Erro no recálculo:", error);
                } finally {
                  isRecalculating.current = false;
                }
              }
            }

            if (activeGroup && userId) {
              GroupService.updateLocation(activeGroup, userId, {
                latitude: coords.latitude,
                longitude: coords.longitude,
                heading: currentHeading.current ?? 0,
                pointerColor,
                name: userName,
                pushToken: localToken,
                statusBadge: currentStatus.current,
              });
            }
          },
        );
      } catch (err: any) {
        LoggerService.log("ERROR", "RealMapScreen: Erro crítico ao iniciar rastreamento de GPS", err?.message || err);
      }
    }

    startTracking();

    return () => {
      if (subscription) {
        LoggerService.log("INFO", "RealMapScreen: Removendo assinatura de rastreamento de posição.");
        subscription.remove();
      }
    };
  }, [
    activeGroup,
    userId,
    userName,
    pointerColor,
    isNavigating,
    activeNavigationRoutes,
  ]);

  // 5. Gatilho do Criador do Encontro: Monitora respostas e expiração
  useEffect(() => {
    if (!activeGroup || !userId || !activeMeeting) return;
    if (activeMeeting.creatorId !== userId) return;

    const evaluateMeeting = async () => {
      const responses = activeMeeting.responses || {};
      const hasAccepted = Object.values(responses).some(
        (r) => r === "accepted",
      );
      const isExpired = Date.now() > activeMeeting.expiresAt;

      if (hasAccepted) {
        LoggerService.log("INFO", "RealMapScreen: Convite de encontro aceito. Atualizando para concluído.");
        await GroupService.updateMeetingStatus(
          activeGroup,
          activeMeeting.meetingId,
          "completed",
        );
        Alert.alert(
          "Encontro Confirmado!",
          "Alguém aceitou o convite. Traçando rota pública para o comboio.",
        );

        const coords: RouteCoordinate = {
          latitude: activeMeeting.latitude,
          longitude: activeMeeting.longitude,
        };
        processAndSaveRoute(
          coords,
          "replace",
          false,
          activeMeeting.address || "Ponto de Encontro",
        );
      } else if (isExpired) {
        LoggerService.log("WARN", "RealMapScreen: Tempo de encontro esgotado.");
        await GroupService.updateMeetingStatus(
          activeGroup,
          activeMeeting.meetingId,
          "expired",
        );
        Alert.alert(
          "Tempo Esgotado",
          "Ninguém aceitou o encontro a tempo. Traçando rota particular apenas para você.",
        );

        const coords: RouteCoordinate = {
          latitude: activeMeeting.latitude,
          longitude: activeMeeting.longitude,
        };
        processAndSaveRoute(
          coords,
          "replace",
          true,
          activeMeeting.address || "Ponto de Encontro",
        );
      }
    };

    evaluateMeeting();

    const timeRemaining = activeMeeting.expiresAt - Date.now();
    if (timeRemaining > 0) {
      const timeout = setTimeout(() => {
        evaluateMeeting();
      }, timeRemaining);

      return () => clearTimeout(timeout);
    }
  }, [activeMeeting, activeGroup, userId]);

  // ==========================================
  // FUNÇÕES AUXILIARES COM LOGGING
  // ==========================================
  const handleUpdateStatus = async (
    status: "active" | "fuel" | "flat_tire" | "food" | "stopped",
  ) => {
    LoggerService.log("INFO", `RealMapScreen: Alterando status do piloto para "${status}"`);
    currentStatus.current = status;
    setStatusModalVisible(false);

    if (activeGroup && userId) {
      await GroupService.updateUserStatus(activeGroup, userId, status);
    }
  };

  const handleClearRoutes = async (type: "public" | "private" | "all") => {
    try {
      LoggerService.log("INFO", `RealMapScreen: Solicitando limpeza de rotas (${type})`);
      if (type === "public" || type === "all") {
        if (activeGroup && userId) {
          await GroupService.clearMyGroupRoutes(activeGroup, userId);
        }
      }
      if (type === "private" || type === "all") {
        if (userId) {
          await UserService.clearPrivateRoutes(userId);
        }
      }
      setClearModalVisible(false);
    } catch (error: any) {
      LoggerService.log("ERROR", "RealMapScreen: Erro ao limpar rotas", error?.message || error);
      console.error("Erro ao limpar rotas:", error);
      Alert.alert("Erro", "Não foi possível apagar as rotas.");
    }
  };

  const handleNavigationActionButton = () => {
    if (isNavigating) {
      LoggerService.log("INFO", "RealMapScreen: Finalizando navegação e gerando resumo.");
      const totalTimeMs = Date.now() - tripStartTime.current;
      const totalMinutes = Math.floor(totalTimeMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const durationFormatted =
        hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      const distanceKm = Number(
        (accumulatedDistance.current / 1000).toFixed(2),
      );
      const maxSpeedKmH =
        speedRecords.current.length > 0 ? Math.max(...speedRecords.current) : 0;
      const avgSpeedKmH =
        speedRecords.current.length > 0
          ? Math.round(
            speedRecords.current.reduce((a, b) => a + b, 0) /
            speedRecords.current.length,
          )
          : 0;

      const finalAddress = destinationAddress || "Destino Final";

      const tripReport = {
        tripId: `trip_${Date.now()}`,
        userId: userId || "",
        userName: userName || "Motorista",
        distanceKm,
        durationFormatted,
        maxSpeedKmH: Math.round(maxSpeedKmH),
        avgSpeedKmH,
        destinationAddress: finalAddress,
        timestamp: Date.now(),
      };

      if (activeGroup && userId) {
        GroupService.saveGroupTrip(activeGroup, tripReport);
      }

      setTripSummaryData(tripReport);
      setSummaryModalVisible(true);

      setIsNavigating(false);
      setNavigationScope(null);
    } else {
      if (routes.length === 0) {
        LoggerService.log("WARN", "RealMapScreen: Tentativa de iniciar rota sem itinerários ativos.");
        Alert.alert(
          "Nenhuma Rota",
          "Crie ou selecione um destino no mapa antes de iniciar.",
        );
        return;
      }
      setStartModalVisible(true);
    }
  };

  const handleSelectDestination = (
    coordinate: RouteCoordinate,
    address?: string,
  ) => {
    LoggerService.log("INFO", "RealMapScreen: Destino selecionado no mapa", { coordinate, address });
    if (isSelectingMeetingMode) {
      Alert.alert(
        "Confirmar Encontro",
        `Deseja chamar todos para: ${address || "Ponto selecionado"}?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => setIsSelectingMeetingMode(false),
          },
          {
            text: "Chamar Comboio",
            onPress: () => handleCreateMeeting(coordinate, address),
          },
        ],
      );
      return;
    }

    setTemporaryDestination(coordinate);
    setDestinationAddress(address || "Destino no Mapa");
    setPendingCoords(coordinate);

    if (routes.length > 0) {
      setModalVisible(true);
    } else {
      processAndSaveRoute(coordinate, "replace");
    }
  };

  const handleCreateMeeting = async (
    coordinate: RouteCoordinate,
    address?: string,
  ) => {
    setIsSelectingMeetingMode(false);
    if (!activeGroup || !userId) return;

    try {
      LoggerService.log("INFO", "RealMapScreen: Criando novo encontro de grupo.");
      const meetingId = `meeting_${Date.now()}`;
      const meetingPayload: MeetingData = {
        meetingId,
        creatorId: userId,
        creatorName: userName,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        address: address || "Ponto de Encontro Marcado",
        createdAt: Date.now(),
        expiresAt: Date.now() + 90 * 1000,
        status: "active",
        responses: {},
      };

      await GroupService.createMeeting(activeGroup, meetingPayload);
      Alert.alert(
        "Convite Enviado!",
        "Aguardando as respostas dos membros do grupo (1:30h).",
      );

      const tokensToNotify = members
        .map((m) => m.pushToken)
        .filter((token): token is string => !!token);

      if (tokensToNotify.length > 0) {
        await PushService.sendMeetingPushNotification(
          tokensToNotify,
          "📍 Novo Encontro!",
          `${userName} marcou um ponto de encontro. Toque para visualizar!`,
        );
      }
    } catch (error: any) {
      LoggerService.log("ERROR", "RealMapScreen: Erro ao criar encontro", error?.message || error);
      console.error("Erro ao criar encontro:", error);
      Alert.alert("Erro", "Não foi possível criar o encontro.");
    }
  };

  const processAndSaveRoute = async (
    destination: RouteCoordinate,
    mode: "replace" | "nextStop",
    isPrivate: boolean = false,
    addressOverride?: string,
  ) => {
    if (!userLocation) {
      LoggerService.log("WARN", "RealMapScreen: Posição do usuário ainda não carregada para gerar rota.");
      return;
    }

    try {
      LoggerService.log("INFO", "RealMapScreen: Solicitando traçado de rota ao Google Directions...", { mode, isPrivate });
      let origin: RouteCoordinate;
      const relevantRoutes = routes.filter((r) => !!r.isPrivate === isPrivate);

      if (mode === "nextStop" && relevantRoutes.length > 0) {
        const lastRoute = relevantRoutes[relevantRoutes.length - 1];
        origin = lastRoute.destination;
      } else {
        if (mode === "replace") {
          if (isPrivate && userId) {
            await UserService.clearPrivateRoutes(userId);
          } else if (activeGroup) {
            await GroupService.clearRoutes(activeGroup);
          }
        }
        origin = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        };
      }

      const routeResult = await DirectionsService.getRoute(
        origin,
        destination,
        apiKey,
      );

      const routeId = `rota_${Date.now()}`;
      const payload = {
        creatorId: userId || "unknown",
        creatorName: userName,
        color: isPrivate ? "#ffaa00" : pointerColor,
        origin,
        destination: {
          latitude: destination.latitude,
          longitude: destination.longitude,
          address: addressOverride || destinationAddress,
        },
        coordinates: routeResult.coordinates,
        isPrivate,
      };

      await saveRoute(routeId, payload, isPrivate);
      LoggerService.log("INFO", "RealMapScreen: Rota gerada e salva com sucesso.");

      setTemporaryDestination(null);
      setModalVisible(false);
      setPendingCoords(null);
    } catch (error: any) {
      LoggerService.log("ERROR", "RealMapScreen: Erro ao gerar/processar rota", error?.message || error);
      console.error("Erro ao gerar rota:", error);
      alert(error.message || "Não foi possível traçar a rota.");
    }
  };

  const handleDeclineMeeting = async () => {
    if (activeGroup && activeMeeting && userId) {
      setShowMeetingInvite(false);
      await GroupService.respondToMeeting(
        activeGroup,
        activeMeeting.meetingId,
        userId,
        "declined",
      );
    }
  };

  const handleAcceptMeeting = async () => {
    if (activeGroup && activeMeeting && userId) {
      setShowMeetingInvite(false);
      await GroupService.respondToMeeting(
        activeGroup,
        activeMeeting.meetingId,
        userId,
        "accepted",
      );

      const coords: RouteCoordinate = {
        latitude: activeMeeting.latitude,
        longitude: activeMeeting.longitude,
      };

      setTemporaryDestination(coords);
      setDestinationAddress(activeMeeting.address || "Ponto de Encontro");
      setPendingCoords(coords);

      if (routes.length > 0) {
        setModalVisible(true);
      } else {
        processAndSaveRoute(coords, "replace", false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <RouteSearchBar
        onDestinationSelected={(loc, addr) =>
          handleSelectDestination(loc, addr)
        }
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
        onLongPressMap={(coord) =>
          handleSelectDestination(coord, "Ponto Selecionado")
        }
      />

      <RouteDecisionModal
        visible={modalVisible}
        hasExistingRoute={routes.length > 0}
        destinationName={destinationAddress}
        onReplace={(isPrivate) => {
          if (pendingCoords)
            processAndSaveRoute(pendingCoords, "replace", isPrivate);
        }}
        onNextStop={(isPrivate) => {
          if (pendingCoords)
            processAndSaveRoute(pendingCoords, "nextStop", isPrivate);
        }}
        onCreateSingle={(isPrivate) => {
          if (pendingCoords)
            processAndSaveRoute(pendingCoords, "replace", isPrivate);
        }}
        onCancel={() => {
          setModalVisible(false);
          setTemporaryDestination(null);
          setPendingCoords(null);
        }}
      />

      <SpeedDialMenu
        onMeetingPress={() => {
          setIsSelectingMeetingMode(true);
        }}
        onClearPress={() => setClearModalVisible(true)}
        onStatusPress={() => setStatusModalVisible(true)}
      />

      <StatusSelectionModal
        visible={statusModalVisible}
        onSelectStatus={handleUpdateStatus}
        onCancel={() => setStatusModalVisible(false)}
      />

      <ClearRoutesModal
        visible={clearModalVisible}
        onClear={handleClearRoutes}
        onCancel={() => setClearModalVisible(false)}
      />

      <MeetingInviteModal
        meeting={activeMeeting}
        visible={showMeetingInvite}
        onAccept={handleAcceptMeeting}
        onDecline={handleDeclineMeeting}
      />

      <TripSummaryModal
        visible={summaryModalVisible}
        data={tripSummaryData}
        onClose={() => setSummaryModalVisible(false)}
      />

      {isSelectingMeetingMode && (
        <View style={styles.meetingBanner}>
          <Text style={styles.meetingBannerText}>
            Toque no mapa ou pesquise o local do encontro
          </Text>
          <TouchableOpacity onPress={() => setIsSelectingMeetingMode(false)}>
            <MaterialCommunityIcons
              name="close-circle"
              size={24}
              color="#ff4444"
            />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.navActionButton,
          isNavigating ? styles.navActionStop : styles.navActionStart,
        ]}
        onPress={handleNavigationActionButton}
        activeOpacity={0.8}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    gap: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
  },
  backButtonText: {
    color: "#8be8ff",
    fontSize: 14,
    fontWeight: "bold",
  },
  rpmGauge: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 20,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
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
  meetingBanner: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    backgroundColor: "#00ffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 20,
    elevation: 5,
  },
  meetingBannerText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 13,
  },
});