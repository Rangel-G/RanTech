import React, { createContext, useContext, useMemo, useState } from 'react';

export type DashboardType = 'daily' | 'street' | 'track' | 'drift' | 'sport';

interface DashboardProfileContextValue {
  selectedProfile: DashboardType;
  setSelectedProfile: (profile: DashboardType) => void;
}

const DashboardProfileContext = createContext<DashboardProfileContextValue | undefined>(undefined);

export function DashboardProfileProvider({ children }: { children: React.ReactNode }) {
  const [selectedProfile, setSelectedProfile] = useState<DashboardType>('daily');

  const value = useMemo(
    () => ({
      selectedProfile,
      setSelectedProfile,
    }),
    [selectedProfile]
  );

  return (
    <DashboardProfileContext.Provider value={value}>{children}</DashboardProfileContext.Provider>
  );
}

export function useDashboardProfile() {
  const context = useContext(DashboardProfileContext);

  if (!context) {
    throw new Error('useDashboardProfile must be used within a DashboardProfileProvider');
  }

  return context;
}
