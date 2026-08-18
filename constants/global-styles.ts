/**
 * Global Styles and Color Variants
 * Centralized color palette and style constants used across the entire app
 */

// ===== PRIMARY COLORS =====
export const COLORS = {
  // Neon/Cybernetic Colors
  neon: {
    cyan: '#00ffff',
    lightCyan: '#00fffa',
    brightCyan: '#8be8ff',
    green: '#00ff66',
    brightGreen: '#00ff99',
    orange: '#ff9500',
    red: '#ff0000',
    brightRed: '#ff4444',
    blue: '#0084ff',
  },

  // Tab Bar & Active States
  tabBar: {
    active: '#ef3b2d',
    background: '#0d0f12',
    text: '#ffffff',
    inactiveText: '#dfe3ea',
  },

  // Background Variants
  background: {
    darkBase: 'rgba(2, 8, 16, 0.96)',
    darkMedium: 'rgba(2, 8, 16, 0.8)',
    darkLight: 'rgba(2, 8, 16, 0.6)',
    darkVeryLight: 'rgba(5, 7, 10, 1)',
  },

  // Transparent Overlays
  overlay: {
    cyan: {
      high: 'rgba(0, 255, 255, 0.3)',
      medium: 'rgba(0, 255, 255, 0.2)',
      low: 'rgba(0, 255, 255, 0.12)',
      veryLow: 'rgba(0, 255, 255, 0.1)',
    },
    panel: {
      medium: 'rgba(0, 100, 150, 0.2)',
      low: 'rgba(0, 50, 100, 0.1)',
    },
    red: {
      medium: 'rgba(255, 0, 0, 0.3)',
      low: 'rgba(255, 0, 0, 0.1)',
    },
    white: {
      low: 'rgba(255, 255, 255, 0.3)',
    },
  },

  // Text Colors
  text: {
    primary: '#ffffff',
    secondary: '#8be8ff',
    tertiary: '#cccccc',
    muted: '#dfe3ea',
    label: '#ffffff',
  },

  // Status Indicators
  status: {
    connected: '#00ff66',
    receiving: '#00ffff',
    warning: '#ff9500',
    alert: '#ff0000',
  },

  // Legacy Theme Support
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0c89b3',
    icon: '#687076',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
  },
};

// ===== BORDER STYLES =====
export const BORDERS = {
  thin: 1,
  medium: 2,
  thick: 3,

  colors: {
    cyan: {
      high: COLORS.overlay.cyan.high,
      medium: COLORS.overlay.cyan.medium,
      low: COLORS.overlay.cyan.low,
      veryLow: COLORS.overlay.cyan.veryLow,
    },
    panel: {
      medium: COLORS.overlay.panel.medium,
    },
  },
};

// ===== SPACING / PADDING / MARGINS =====
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ===== TYPOGRAPHY =====
export const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  weights: {
    normal: '400' as const,
    medium: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
    black: '900' as const,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.3,
    wider: 0.5,
    widest: 1.2,
  },
};

// ===== BORDER RADIUS =====
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 18,
  full: 999,
};

// ===== SHADOWS =====
export const SHADOWS = {
  cyan: {
    color: '#00ffff',
    opacity: 0.5,
    radius: 4,
    elevation: 5,
  },
  default: {
    color: '#000000',
    opacity: 0.3,
    radius: 2,
    elevation: 2,
  },
};

// ===== COMPONENT PRESET STYLES =====
export const COMPONENT_STYLES = {
  // Dashboard Containers
  dashboard: {
    container: {
      backgroundColor: COLORS.background.darkBase,
      borderTopWidth: BORDERS.thin,
      borderTopColor: COLORS.overlay.cyan.veryLow,
    },
    contentContainer: {
      padding: SPACING.md,
    },
  },

  // Gauge Cards
  gaugeCard: {
    defaultColor: '#00f0ff',
    borderColor: COLORS.overlay.cyan.veryLow,
  },

  // Channel/Info Box
  channelBox: {
    small: {
      backgroundColor: COLORS.overlay.cyan.medium,
      borderColor: COLORS.overlay.cyan.medium,
      borderRadius: BORDER_RADIUS.md,
    },
    medium: {
      backgroundColor: COLORS.overlay.cyan.medium,
      borderColor: COLORS.overlay.cyan.medium,
      borderRadius: BORDER_RADIUS.md,
    },
    large: {
      backgroundColor: COLORS.overlay.cyan.medium,
      borderColor: COLORS.overlay.cyan.medium,
      borderRadius: BORDER_RADIUS.md,
    },
  },

  // Expandable Panel
  expandablePanel: {
    border: BORDERS.medium,
    borderColor: COLORS.overlay.cyan.low,
    backgroundColor: COLORS.overlay.cyan.veryLow,
    borderRadius: BORDER_RADIUS.md,
  },

  // Digital Display
  digitalDisplay: {
    backgroundColor: COLORS.overlay.panel.medium,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.overlay.cyan.low,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },

  // Shift Light
  shiftLight: {
    backgroundColor: COLORS.overlay.red.medium,
    borderColor: COLORS.overlay.red.medium,
    borderWidth: BORDERS.medium,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },

  // Status Bar
  statusBar: {
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.overlay.cyan.low,
    paddingVertical: SPACING.md,
  },

  // Status Indicator LED
  ledIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Input Fields
  input: {
    placeholderTextColor: COLORS.overlay.white.low,
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.sm,
  },

  // Color Preview
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.overlay.cyan.low,
  },
};

// ===== THEME VARIANT PRESETS =====
export const THEME_PRESETS = {
  dark: {
    colors: COLORS,
    background: COLORS.background.darkBase,
    text: COLORS.text.primary,
    border: COLORS.overlay.cyan.medium,
  },
  cyberpunk: {
    colors: COLORS,
    background: COLORS.background.darkBase,
    accent: COLORS.neon.cyan,
    text: COLORS.text.primary,
  },
};

// ===== UTILITY FUNCTIONS =====

/**
 * Create a shadow style object for React Native
 */
export const createShadow = (color: string, opacity: number, radius: number, elevation: number) => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation,
});

/**
 * Create a text style with consistent typography
 */
export const createTextStyle = (size: keyof typeof TYPOGRAPHY.sizes, weight: keyof typeof TYPOGRAPHY.weights = 'normal') => ({
  fontSize: TYPOGRAPHY.sizes[size],
  fontWeight: TYPOGRAPHY.weights[weight],
});

export default COLORS;
