import { useRouteArrival } from "@/hooks/useRouteArrival";
import {
    GroupMember,
    RouteCoordinate,
    RouteData,
} from "@/services/firebase/group-service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

interface RealTimeMapProps {
  latitude: number;
  longitude: number;
  heading: number;
  userColor?: string;
  members?: GroupMember[];
  routes?: RouteData[];
  latitudeDelta?: number;
  longitudeDelta?: number;
  temporaryDestination?: RouteCoordinate | null;
  onLongPressMap?: (coordinate: RouteCoordinate) => void;
}

export function RealTimeMap({
  latitude,
  longitude,
  heading,
  userColor = "#00ffff",
  members = [],
  routes = [],
  latitudeDelta = 0.01,
  longitudeDelta = 0.01,
  temporaryDestination,
  onLongPressMap,
}: RealTimeMapProps) {
  const mapRef = useRef<MapView>(null);

  const timeoutRef = useRef<NodeJS.Timeout | number | null>(null);
  const isFollowing = useRef(true);
  const isProgrammaticMove = useRef(false);

  const latestCoords = useRef({ latitude, longitude });
  const currentZoom = useRef({ latitudeDelta, longitudeDelta });

  useRouteArrival(latitude, longitude);

  useEffect(() => {
    latestCoords.current = { latitude, longitude };

    if (isFollowing.current && mapRef.current) {
      isProgrammaticMove.current = true;
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: currentZoom.current.latitudeDelta,
          longitudeDelta: currentZoom.current.longitudeDelta,
        },
        500,
      );
    }
  }, [latitude, longitude]);

  const handleUserTouch = () => {
    isFollowing.current = false;
    isProgrammaticMove.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
      }}
      onTouchStart={handleUserTouch}
      onPanDrag={handleUserTouch}
      onRegionChange={(region, details) => {
        if (!isProgrammaticMove.current || details?.isGesture) {
          isFollowing.current = false;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
      }}
      onRegionChangeComplete={(region, details) => {
        currentZoom.current = {
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        };

        if (isProgrammaticMove.current && !details?.isGesture) {
          isProgrammaticMove.current = false;
        } else {
          isFollowing.current = false;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);

          timeoutRef.current = setTimeout(() => {
            isFollowing.current = true;
            isProgrammaticMove.current = true;

            mapRef.current?.animateToRegion(
              {
                latitude: latestCoords.current.latitude,
                longitude: latestCoords.current.longitude,
                latitudeDelta: currentZoom.current.latitudeDelta,
                longitudeDelta: currentZoom.current.longitudeDelta,
              },
              1000,
            );
          }, 3000);
        }
      }}
      onLongPress={(e) => {
        if (onLongPressMap) {
          onLongPressMap(e.nativeEvent.coordinate);
        }
      }}
    >
      {/* Renderização de Todas as Rotas (Públicas e Privadas) */}
      {routes.map((route) => (
        <React.Fragment key={route.routeId}>
          <Polyline
            coordinates={route.coordinates}
            strokeColor={route.isPrivate ? "#ffaa00" : route.color || "#00ffff"}
            strokeWidth={4}
            lineDashPattern={route.isPrivate ? [10, 5] : undefined} // Tracejada se for privada
          />
          {route.destination && (
            <Marker coordinate={route.destination}>
              <View
                style={[
                  styles.destMarkerContainer,
                  route.isPrivate && { borderColor: "#ffaa00" },
                ]}
              >
                <MaterialCommunityIcons
                  name={route.isPrivate ? "lock-check" : "flag-checkered"}
                  size={20}
                  color={route.isPrivate ? "#ffaa00" : "#ffcc00"}
                />
              </View>
            </Marker>
          )}
        </React.Fragment>
      ))}

      {/* Marcador Provisório de Destino Selecionado */}
      {temporaryDestination && (
        <Marker coordinate={temporaryDestination}>
          <View style={styles.destMarkerContainer}>
            <MaterialCommunityIcons
              name="flag-checkered"
              size={24}
              color="#ffcc00"
            />
          </View>
        </Marker>
      )}

      <Marker
        coordinate={{ latitude, longitude }}
        flat
        rotation={heading}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={styles.memberMarkerContainer}>
          <View style={[styles.markerPointer, { borderColor: userColor }]} />
          <View style={styles.memberNameTag}>
            <Text style={styles.memberNameText}>Você</Text>
          </View>
        </View>
      </Marker>

      {members.map((member) => (
        <Marker
          key={member.userId}
          coordinate={{
            latitude: member.latitude,
            longitude: member.longitude,
          }}
          flat
          rotation={member.heading ?? 0}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.memberMarkerContainer}>
            <View
              style={[
                styles.markerPointer,
                { borderColor: member.pointerColor || "#00ffff" },
              ]}
            />
            <View style={styles.memberNameTag}>
              <Text style={styles.memberNameText}>{member.name}</Text>
            </View>
          </View>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  memberMarkerContainer: { alignItems: "center", justifyContent: "center" },
  markerPointer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#000",
    borderWidth: 3,
  },
  memberNameTag: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  memberNameText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  destMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#ffcc00",
  },
});
