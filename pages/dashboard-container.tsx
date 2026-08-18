import { COLORS } from '@/constants/global-styles';
import { DailyDashboard } from '@/pages/daily-dashboard';
import { DriftDashboard } from '@/pages/drift-dashboard';
import { SportDashboard } from '@/pages/sport-dashboard';
import { StreetDashboard } from '@/pages/street-dashboard';
import { TrackDashboard } from '@/pages/track-dashboard';
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
