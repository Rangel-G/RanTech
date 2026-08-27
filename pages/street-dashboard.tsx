import { ChannelBox } from '@/components/ui/channel-box';
import { RpmRamp } from '@/components/ui/rpmRamp';
import { useCalculatedGear } from '@/hooks/useCalculateGear';
import { useCarData } from '@/hooks/useCarData';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function StreetDashboard() {

  const { rpm, speed, engineLoad, rpmMax,  } = useCarData();
  const currentGear = useCalculatedGear(rpm, speed);

  return (
    <View style={styles.container}>
      <View style={styles.rpmContainer}>
        <RpmRamp rpm={rpm} rpmMax={rpmMax} />
      </View>
      <View style={styles.gridContainer}>
        {/* Esquerda: Velocidade */}
        <View style={styles.leftColumn}>
          <ChannelBox
            label="Velocidade"
            value={Math.round(speed)}
            unit="KM/H"
            size="large"
            theme="default"
          />
        </View>

        {/* Direita: Grid 2x2 */}
        <View style={styles.rightSection}>
          <View style={styles.row}>
            <View style={styles.cell}>
              <ChannelBox
                label="Marcha"
                value={currentGear}
                unit="GEAR"
                size="small"
                theme="default"
              />
            </View>
            <View style={styles.cell}>
              <ChannelBox
                label="Carga Motor"
                value={Math.round(engineLoad)}
                unit="%"
                size="small"
                theme="default"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070a',
    padding: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  leftColumn: {
    flex: 1.2,
  },
  rightSection: {
    flex: 2,
    flexDirection: 'column',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  cell: {
    flex: 1,
  },
  rpmContainer: {
    width: '100%',
    marginBottom: 16,
  },
});