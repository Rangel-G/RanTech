import { COLORS } from '@/constants/global-styles';
import { DailyDashboard } from '@/screens/daily-dashboard';
import { DriftDashboard } from '@/screens/drift-dashboard';
import { SportDashboard } from '@/screens/sport-dashboard';
import { StreetDashboard } from '@/screens/street-dashboard';
import { TrackDashboard } from '@/screens/track-dashboard';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useDashboardProfile } from '@/contexts/dashboard-profile-context';

export function DashboardContainer() {
  const { selectedProfile } = useDashboardProfile();

  const renderDashboard = () => {
    switch (selectedProfile) {
      case 'daily':
        return <DailyDashboard />;
      case 'street':
        return <StreetDashboard />;
      case 'track':
        return <TrackDashboard />;
      case 'drift':
        return <DriftDashboard />;
      case 'sport':
        return <SportDashboard />;
      default:
        return <DailyDashboard />;
    }
  };

  return <View style={styles.container}>{renderDashboard()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.darkBase,
  },
});
