import { RouteCoordinate } from "@/services/firebase/group-service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RouteSearchBarProps {
  onDestinationSelected: (
    coordinate: RouteCoordinate,
    address?: string,
  ) => void;
}

const screenWidth = Dimensions.get("window").width;

export function RouteSearchBar({ onDestinationSelected }: RouteSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const animation = useRef(new Animated.Value(0)).current;

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const toggleSearch = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      useNativeDriver: false, // Largura não suporta native driver nativamente em algumas versões
      friction: 7,
    }).start();

    if (isOpen) {
      Keyboard.dismiss();
      setSearchQuery("");
      setPredictions([]);
    }
    setIsOpen(!isOpen);
  };

  // Animação da largura da barra (de 50px para quase a largura da tela)
  const barWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, screenWidth - 40],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  // Busca de endereços via Google Places Autocomplete API
  const handleSearchChange = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            text,
          )}&key=${apiKey}&language=pt-BR`,
        );
        const data = await response.json();
        if (data.predictions) {
          setPredictions(data.predictions);
        }
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
      }
    } else {
      setPredictions([]);
    }
  };

  const handleSelectPrediction = async (
    placeId: string,
    description: string,
  ) => {
    Keyboard.dismiss();
    setSearchQuery(description);
    setPredictions([]);
    toggleSearch(); // Fecha a barra após selecionar

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&language=pt-BR`,
      );
      const data = await response.json();
      if (data.result && data.result.geometry) {
        const { lat, lng } = data.result.geometry.location;
        onDestinationSelected({ latitude: lat, longitude: lng }, description);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do local:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchContainer, { width: barWidth }]}>
        {/* Botão / Ícone de Lupa */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleSearch}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isOpen ? "close" : "magnify"}
            size={24}
            color={isOpen ? "#ff4444" : "#00ffff"}
          />
        </TouchableOpacity>

        {/* Campo de Texto (Visível apenas quando expandido) */}
        {isOpen && (
          <Animated.View style={[styles.inputWrapper, { opacity }]}>
            <TextInput
              style={styles.input}
              placeholder="Pesquisar destino..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus
            />
          </Animated.View>
        )}
      </Animated.View>

      {/* Lista de Sugestões */}
      {isOpen && predictions.length > 0 && (
        <View style={styles.predictionsContainer}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.predictionItem}
                onPress={() =>
                  handleSelectPrediction(item.place_id, item.description)
                }
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={18}
                  color="#00ffff"
                />
                <Text style={styles.predictionText} numberOfLines={1}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 100,
  },
  searchContainer: {
    height: 50,
    backgroundColor: "rgba(2, 8, 16, 0.95)",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.4)",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    paddingRight: 15,
  },
  input: {
    color: "#fff",
    fontSize: 14,
    height: "100%",
  },
  predictionsContainer: {
    marginTop: 8,
    width: screenWidth - 40,
    backgroundColor: "rgba(2, 8, 16, 0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.2)",
    maxHeight: 200,
    overflow: "hidden",
    elevation: 4,
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  predictionText: {
    color: "#ddd",
    fontSize: 13,
    flex: 1,
  },
});
