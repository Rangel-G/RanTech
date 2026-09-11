import { useRouteArrival } from "@/hooks/useRouteArrival";
import {
  GroupMember,
  RouteCoordinate,
  RouteData,
} from "@/services/firebase/group-service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

interface RealTimeMapProps {
  latitude: number;
  longitude: number;
  heading: number;
  isNavigating?: boolean;
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
  isNavigating = false,
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

      if (isNavigating) {
        mapRef.current.animateCamera(
          {
            center: { latitude, longitude },
            pitch: 50,
            heading: heading,
            zoom: 18,
          },
          { duration: 500 },
        );
      } else {
        mapRef.current.animateCamera(
          {
            center: { latitude, longitude },
            pitch: 0,
            heading: 0,
          },
          { duration: 500 },
        );
      }
    }
  }, [latitude, longitude, heading, isNavigating]);

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

            if (isNavigating) {
              mapRef.current?.animateCamera(
                {
                  center: {
                    latitude: latestCoords.current.latitude,
                    longitude: latestCoords.current.longitude,
                  },
                  pitch: 60,
                  heading: heading || 0,
                  zoom: 18,
                },
                { duration: 1000 },
              );
            } else {
              mapRef.current?.animateToRegion(
                {
                  latitude: latestCoords.current.latitude,
                  longitude: latestCoords.current.longitude,
                  latitudeDelta: currentZoom.current.latitudeDelta,
                  longitudeDelta: currentZoom.current.longitudeDelta,
                },
                1000,
              );
            }
          }, 3000);
        }
      }}
      onLongPress={(e) => {
        if (onLongPressMap) {
          onLongPressMap(e.nativeEvent.coordinate);
        }
      }}
    >
      {routes.map((route) => (
        <React.Fragment key={route.routeId}>
          <Polyline
            key={route.routeId}
            coordinates={route.coordinates}
            strokeColor={route.color || "#00ffff"}
            strokeWidth={16}
            lineCap="round"
            lineJoin="round"
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

      {/* Marcador do Próprio Usuário */}
      <Marker
        coordinate={{ latitude, longitude }}
        flat
        rotation={heading}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={[styles.markerPointer, { backgroundColor: userColor }]} />
      </Marker>

      {/* Marcadores dos Membros do Comboio */}
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
          <View
            style={[
              styles.markerPointer,
              { backgroundColor: member.pointerColor || "#00ffff" },
            ]}
          />
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerPointer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderColor: "#ffffff",
    borderWidth: 3,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
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