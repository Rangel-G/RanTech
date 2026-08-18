import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useDashboardProfile } from '@/contexts/dashboard-profile-context';

interface MapSlot {
  id: string;
  slot: number;
  emoji: string;
  title: string;
  description: string;
}

const MAP_SLOTS: MapSlot[] = [
  {
    id: 'diario',
    slot: 1,
    emoji: '☀️',
    title: 'Diário',
    description: 'Layout focado em Velocidade, Marcha e Temperatura.',
  },
  {
    id: 'rua',
    slot: 2,
    emoji: '🏁',
    title: 'Rua',
    description: 'Layout com Vel, Marcha, Controle de Tração e Carga.',
  },
  {
    id: 'pista',
    slot: 3,
    emoji: '🔥',
    title: 'Pista',
    description: 'Layout completo clássico de telemetria de arrancada.',
  },
  {
    id: 'drift',
    slot: 4,
    emoji: '🔄',
    title: 'Drift',
    description: 'Layout padrão com foco em respostas dinâmicas.',
  },
  {
    id: 'sport',
    slot: 5,
    emoji: '🏎️',
    title: 'Sport',
    description: 'Painel com mostradores circulares (RPM, Velocidade, Turbo).',
  },
];

const PROFILE_MAP: Record<string, 'daily' | 'street' | 'track' | 'drift' | 'sport'> = {
  diario: 'daily',
  rua: 'street',
  pista: 'track',
  drift: 'drift',
  sport: 'sport',
};

export function MapsScreen() {
  const { selectedProfile, setSelectedProfile } = useDashboardProfile();

  const activeSlot =
    selectedProfile === 'daily'
      ? 'diario'
      : selectedProfile === 'street'
        ? 'rua'
        : selectedProfile === 'track'
          ? 'pista'
          : selectedProfile === 'drift'
            ? 'drift'
            : 'sport';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SELEÇÃO DE LAYOUTS</Text>
        <Text style={styles.headerSubtitle}>Escolha o perfil de telemetria</Text>
      </View>

      <View style={styles.slotsContainer}>
        {MAP_SLOTS.map((slot) => (
          <Pressable
            key={slot.id}
            style={[
              styles.mapSelectBox,
              activeSlot === slot.id && styles.mapSelectBoxActive,
            ]}
            onPress={() => setSelectedProfile(PROFILE_MAP[slot.id])}
          >
            <View style={styles.mapContentContainer}>
              <Text style={styles.mapEmoji}>{slot.emoji}</Text>
              <Text style={styles.mapTitle}>{slot.title}</Text>
            </View>

            <Text style={styles.mapDescription}>{slot.description}</Text>

            {activeSlot === slot.id && <View style={styles.activeIndicator} />}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(2, 8, 16, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 255, 0.12)',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.15)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8be8ff',
    letterSpacing: 0.5,
  },
  /* ------------------- GRID LAYOUT FIXES ------------------- */
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  mapSelectBox: {
    width: '48.5%', // Guarantees 2 items per row
    backgroundColor: 'rgba(0, 50, 100, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.15)',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  /* --------------------------------------------------------- */
  mapSelectBoxActive: {
    backgroundColor: 'rgba(0, 150, 200, 0.15)',
    borderColor: 'rgba(0, 255, 255, 0.5)',
    shadowColor: '#00ffff',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  mapContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  mapDescription: {
    fontSize: 12,
    color: '#aaddff',
    lineHeight: 16,
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#00ffaa',
    shadowColor: '#00ffaa',
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
});