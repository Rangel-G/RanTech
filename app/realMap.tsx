import { RealTimeMap } from "@/components/realTimeMaps";
import { RouteDecisionModal } from "@/components/routeDecisionModal";
import { RouteSearchBar } from "@/components/RouteSearchBar";
import { useGroup } from "@/contexts/group-context";
import { useReception } from "@/hooks/useReception";
import {
  GroupMember,
  GroupService,
  RouteCoordinate,
} from "@/services/firebase/group-service";
import { UserService } from "@/services/firebase/user-service";
import { DirectionsService } from "@/services/google/directionService";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function RealMapScreen() {
  const { data } = useReception();
  const { activeGroup, userId, userName, pointerColor, routes, saveRoute } =
    useGroup();

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

      if (mode === "nextStop" && routes.length > 0) {
        const lastRoute = routes[routes.length - 1];
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
    bottom: "2%", // Posicionado abaixo da searchbar para evitar sobreposição
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(2, 8, 16, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.3)",
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
});
