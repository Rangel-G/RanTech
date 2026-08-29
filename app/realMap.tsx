import { RealTimeMap } from "@/components/realTimeMaps";
import { RouteDecisionModal } from "@/components/routeDecisionModal";
import { RouteSearchBar } from "@/components/RouteSearchBar";
import { StartRouteModal } from "@/components/startRouteModal";
import { useGroup } from "@/contexts/group-context";
import { useReception } from "@/hooks/useReception";
import {
  GroupMember,
  GroupService,
  RouteCoordinate,
} from "@/services/firebase/group-service";
import { UserService } from "@/services/firebase/user-service";
import { DirectionsService } from "@/services/google/directionService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

  // Estados para controle de Navegação 3D
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationScope, setNavigationScope] = useState<
    "public" | "private" | null
  >(null);
  const [startModalVisible, setStartModalVisible] = useState(false);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [members, setMembers] = useState<GroupMember[]>([]);

  // Estados locais de controle de fluxo de rota
  const [temporaryDestination, setTemporaryDestination] =
    useState<RouteCoordinate | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<RouteCoordinate | null>(
    null,
  );

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // Filtra e ordena as rotas do escopo selecionado
  const activeNavigationRoutes = useMemo(() => {
    if (!navigationScope) return [];
    return routes
      .filter((r) =>
        navigationScope === "private" ? r.isPrivate : !r.isPrivate,
      )
      .sort((a, b) => a.updatedAt - b.updatedAt);
  }, [routes, navigationScope]);

  // Encerra a navegação 3D automaticamente quando não houver mais rotas restantes no escopo
  useEffect(() => {
    if (isNavigating && activeNavigationRoutes.length === 0) {
      setIsNavigating(false);
      setNavigationScope(null);
      Alert.alert("Chegada", "Você chegou ao seu destino final!");
    }
  }, [activeNavigationRoutes.length, isNavigating]);

  const handleNavigationActionButton = () => {
    if (isNavigating) {
      setIsNavigating(false);
      setNavigationScope(null);
    } else {
      if (routes.length === 0) {
        Alert.alert(
          "Nenhuma Rota",
          "Crie ou selecione um destino no mapa antes de iniciar.",
        );
        return;
      }
      setStartModalVisible(true);
    }
  };

  // Confirma a escolha do modal
  const handleSelectScope = (scope: "public" | "private") => {
    setNavigationScope(scope);
    setIsNavigating(true);
    setStartModalVisible(false);
  };

  // 1. Escuta membros do grupo em tempo real
  useEffect(() => {
    if (!activeGroup || !userId) {
      setMembers([]);
      return;
    }

    const unsubscribe = GroupService.subscribeToMembers(
      activeGroup,
      (updatedMembers) => {
        const otherMembers = updatedMembers.filter((m) => m.userId !== userId);
        setMembers(otherMembers);
      },
    );

    return () => unsubscribe();
  }, [activeGroup, userId]);

  // 2. Rastreia e transmite a posição no grupo
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (location) => {
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setUserLocation(coords);

          if (activeGroup && userId) {
            GroupService.updateLocation(activeGroup, userId, {
              latitude: coords.latitude,
              longitude: coords.longitude,
              heading: data.heading ?? 0,
              pointerColor,
              name: userName,
            });
          }
        },
      );
    }

    startTracking();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [activeGroup, userId, userName, pointerColor, data.heading]);

  // 3. Acionado quando o usuário busca um endereço ou pressiona longamente o mapa
  const handleSelectDestination = (
    coordinate: RouteCoordinate,
    address?: string,
  ) => {
    setTemporaryDestination(coordinate);
    setDestinationAddress(address || "Destino no Mapa");
    setPendingCoords(coordinate);

    if (routes.length > 0) {
      setModalVisible(true);
    } else {
      processAndSaveRoute(coordinate, "replace");
    }
  };

  // Processa o cálculo na Directions API e salva (Pública ou Privada)
  const processAndSaveRoute = async (
    destination: RouteCoordinate,
    mode: "replace" | "nextStop",
    isPrivate: boolean = false,
  ) => {
    if (!userLocation) return;

    try {
      let origin: RouteCoordinate;

      // Filtra apenas as rotas do mesmo tipo (Pública ou Privada) para determinar a origem da próxima parada
      const relevantRoutes = routes.filter((r) => !!r.isPrivate === isPrivate);

      if (mode === "nextStop" && relevantRoutes.length > 0) {
        const lastRoute = relevantRoutes[relevantRoutes.length - 1];
        origin = lastRoute.destination;
      } else {
        // Limpeza antes de substituir
        if (mode === "replace") {
          if (isPrivate && userId) {
            // Limpa as rotas particulares do usuário no Firebase
            await UserService.clearPrivateRoutes(userId);
          } else if (activeGroup) {
            // Limpa as rotas públicas do grupo no Firebase
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
          address: destinationAddress,
        },
        coordinates: routeResult.coordinates,
        isPrivate,
      };

      await saveRoute(routeId, payload, isPrivate);

      setTemporaryDestination(null);
      setModalVisible(false);
      setPendingCoords(null);
    } catch (error: any) {
      console.error("Erro ao gerar rota:", error);
      alert(error.message || "Não foi possível traçar a rota.");
    }
  };

  if (!userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#34b9f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de Pesquisa Flutuante */}
      <RouteSearchBar
        onDestinationSelected={(loc, addr) =>
          handleSelectDestination(loc, addr)
        }
      />

      {/* Botão de Voltar Flutuante */}
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

      {/* Botão Flutuante Inferior Direito */}
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
});
