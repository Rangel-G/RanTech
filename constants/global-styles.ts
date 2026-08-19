/**
 * globals.ts — Design System Unificado RanTech Mobile
 * Fusão de: global-styles.ts + theme.ts + tokens CSS (style.css)
 */

import { Platform } from 'react-native';

// ===== FONTS (theme.ts) =====
export const FONTS = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// ===== COLORS =====
export const COLORS = {
  // Brand / Accent principal (CSS: --cor-pista, nav-btn.active, config-save-btn)
  brand: {
    red: '#ff3b30',
    redHover: '#ff453a',
    redDark: '#cc2e20',
    yellow: '#ffcc00',      // gear display, panel-title
    green: '#34c759',       // success/connected (Apple green)
    greenDark: '#28a745',
  },

  // Neon/Cybernético
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

  // Tab Bar
  tabBar: {
    active: '#ef3b2d',
    background: '#0d0f12',
    text: '#ffffff',
    inactiveText: '#dfe3ea',
  },

  // Backgrounds (existente + CSS)
  background: {
    root: '#0c0c0e',          // CSS body
    main: '#050505',          // CSS --bg-main, ecu-screen
    darkBase: 'rgba(2, 8, 16, 0.96)',
    darkMedium: 'rgba(2, 8, 16, 0.8)',
    darkLight: 'rgba(2, 8, 16, 0.6)',
    darkVeryLight: 'rgba(5, 7, 10, 1)',
    channel: '#141416',       // .channel-box gradient start
    channelDark: '#0a0a0c',   // .channel-box gradient end / gauge bg
    setting: '#141418',       // .setting-item
    datalogger: '#09090b',    // .datalogger-view
    configPanel: '#141418',   // .config-panel
    configInput: '#0a0a0e',   // .config-select / .config-input
    navBtn: '#18181b',        // .nav-btn
    topStatus: '#111111',     // .top-status
  },

  // Borders
  border: {
    default: '#282830',       // CSS --cor-borda
    channel: '#222226',       // .channel-box
    setting: '#22222a',       // .setting-item
    configPanel: '#22222a',
    configInput: '#2a2a34',
    mapDefault: '#2a2a35',
    navBtn: '#27272a',
    topStatus: '#222222',
  },

  // Overlays transparentes (existente + CSS)
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
    redBrand: {
      medium: 'rgba(255, 59, 48, 0.2)',  // map-active box-shadow
    },
    white: {
      low: 'rgba(255, 255, 255, 0.3)',
    },
  },

  // Texto (existente + CSS)
  text: {
    primary: '#ffffff',
    secondary: '#8be8ff',
    tertiary: '#cccccc',
    muted: '#dfe3ea',
    label: '#ffffff',
    dimmed: '#aaaaaa',   // control-label, color-label
    faded: '#888888',    // log-info, config-field label
    subtle: '#777777',   // channel-label, gauge-label, map-desc
    ghost: '#555555',    // channel-unit, ecu-footer
    disabled: '#666666', // config-arrow, gauge-tick
    yellow: '#ffcc00',   // gear values, panel-title
    cyan: '#00fffa',     // speed values
  },

  // Status
  status: {
    connected: '#00ff66',
    connectedAlt: '#34c759',  // CSS .status-left, .led-active-green
    receiving: '#00ffff',
    warning: '#ff9500',
    alert: '#ff0000',
    error: '#ff3b30',
    searching: '#ff9500',
  },

  // LED
  led: {
    default: '#444444',
    green: '#34c759',
    red: '#ff3b30',
  },

  // TC (Tração)
  tc: {
    active: { bg: '#0f2619', bgDark: '#050d08', border: '#155734', text: '#34c759' },
    disabled: { bg: '#2d1212', bgDark: '#140707', border: '#721c24', text: '#ff3b30' },
  },

  // Mapas
  map: {
    default: { bg: '#16161c', bgDark: '#0d0d12', border: '#2a2a35' },
    hover: { bg: '#1b1b22', border: '#444455' },
    active: { bg: '#220d0d', bgDark: '#0a0404', border: '#ff3b30' },
    tag: { default: '#252530', text: '#999999' },
  },

  // Legado (hooks existentes de tema)
  light: {
    text: '#11181C', background: '#fff', tint: '#0c89b3',
    icon: '#687076', tabIconDefault: '#687076', tabIconSelected: '#0c89b3',
  },
  dark: {
    text: '#ECEDEE', background: '#151718', tint: '#fff',
    icon: '#9BA1A6', tabIconDefault: '#9BA1A6', tabIconSelected: '#fff',
  },
};

// ===== BORDERS =====
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
    panel: { medium: COLORS.overlay.panel.medium },
  },
};

// ===== SPACING =====
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
    // CSS channel value sizes
    channelDefault: 40,      // .channel-value
    channelSpeed: 64,        // .layout-default #box-speed
    channelSpeedDaily: 66,   // .layout-diario #box-speed
    channelGear: 52,         // gear box
    rpmOverlay: 64,          // .rpm-text-overlay
    rpmUnit: 20,             // .rpm-unit-mini
    rpmScale: 13,            // .rpm-scale
    gaugeValue: 24,          // .gauge-value
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
    panelTitle: 2,   // .panel-title (CSS)
    brand: 4,        // .ecu-brand (CSS)
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
  cyan: { color: '#00ffff', opacity: 0.5, radius: 4, elevation: 5 },
  default: { color: '#000000', opacity: 0.3, radius: 2, elevation: 2 },
  // CSS additions
  red: { color: '#ff3b30', opacity: 0.2, radius: 10, elevation: 4 },   // map-active
  ledGreen: { color: '#34c759', opacity: 0.8, radius: 12, elevation: 4 },
  ledRed: { color: '#ff3b30', opacity: 0.8, radius: 12, elevation: 4 },
  controlPanel: { color: '#000000', opacity: 0.6, radius: 35, elevation: 8 },
};

// ===== COMPONENT PRESET STYLES =====
export const COMPONENT_STYLES = {
  // Dashboard Containers (existente)
  dashboard: {
    container: {
      backgroundColor: COLORS.background.darkBase,
      borderTopWidth: BORDERS.thin,
      borderTopColor: COLORS.overlay.cyan.veryLow,
    },
    contentContainer: { padding: SPACING.md },
  },

  // Gauge Cards (existente)
  gaugeCard: {
    defaultColor: '#00f0ff',
    borderColor: COLORS.overlay.cyan.veryLow,
  },

  // Channel Box — versão cyberpunk (existente)
  channelBox: {
    small: { backgroundColor: COLORS.overlay.cyan.medium, borderColor: COLORS.overlay.cyan.medium, borderRadius: BORDER_RADIUS.md },
    medium: { backgroundColor: COLORS.overlay.cyan.medium, borderColor: COLORS.overlay.cyan.medium, borderRadius: BORDER_RADIUS.md },
    large: { backgroundColor: COLORS.overlay.cyan.medium, borderColor: COLORS.overlay.cyan.medium, borderRadius: BORDER_RADIUS.md },
  },

  // Channel Box — versão CSS (dark theme notebook)
  channelBoxDark: {
    container: {
      backgroundColor: COLORS.background.channel,
      borderWidth: BORDERS.thin,
      borderColor: COLORS.border.channel,
      borderRadius: BORDER_RADIUS.sm,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
    },
    label: {
      fontSize: TYPOGRAPHY.sizes.xs,
      color: COLORS.text.subtle,
      fontWeight: TYPOGRAPHY.weights.bold,
      letterSpacing: 0.5,
    },
    value: {
      fontSize: TYPOGRAPHY.sizes.channelDefault,
      fontWeight: TYPOGRAPHY.weights.bold,
      color: COLORS.text.primary,
    },
    unit: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.ghost },
    speedValue: { fontSize: TYPOGRAPHY.sizes.channelSpeed, color: COLORS.text.cyan },
    speedValueDaily: { fontSize: TYPOGRAPHY.sizes.channelSpeedDaily, color: COLORS.text.cyan },
    gearValue: { fontSize: TYPOGRAPHY.sizes.channelGear, color: COLORS.text.yellow },
    powerValue: { color: COLORS.neon.orange },
    // Alert state
    alertContainer: { borderColor: COLORS.brand.red, backgroundColor: '#260a0a' },
    alertValue: { color: '#ff453a' },
  },

  // Expandable Panel (existente)
  expandablePanel: {
    border: BORDERS.medium,
    borderColor: COLORS.overlay.cyan.low,
    backgroundColor: COLORS.overlay.cyan.veryLow,
    borderRadius: BORDER_RADIUS.md,
  },

  // Digital Display (existente)
  digitalDisplay: {
    backgroundColor: COLORS.overlay.panel.medium,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.overlay.cyan.low,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },

  // Shift Light (existente)
  shiftLight: {
    backgroundColor: COLORS.overlay.red.medium,
    borderColor: COLORS.overlay.red.medium,
    borderWidth: BORDERS.medium,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },

  // Status Bar (existente)
  statusBar: {
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.overlay.cyan.low,
    paddingVertical: SPACING.md,
  },

  // LED Indicator (existente + estados CSS)
  ledIndicator: { width: 12, height: 12, borderRadius: 6 },
  ledIndicatorStates: {
    default: { backgroundColor: COLORS.led.default },
    green: { backgroundColor: COLORS.led.green },
    red: { backgroundColor: COLORS.led.red },
  },

  // Input (existente)
  input: {
    placeholderTextColor: COLORS.overlay.white.low,
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.sm,
  },

  // Color Preview (existente)
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.overlay.cyan.low,
  },

  // Navigation Button (CSS .nav-btn)
  navBtn: {
    container: {
      flex: 1,
      backgroundColor: COLORS.background.navBtn,
      borderWidth: BORDERS.thin,
      borderColor: COLORS.border.navBtn,
      height: 40,
      borderRadius: BORDER_RADIUS.sm,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    label: { fontSize: 13, color: '#efefef', fontWeight: TYPOGRAPHY.weights.bold },
    activeContainer: { backgroundColor: COLORS.brand.red, borderColor: COLORS.brand.redHover },
    activeLabel: { color: COLORS.text.primary },
  },

  // Config Panel (CSS .config-panel)
  configPanel: {
    container: {
      backgroundColor: COLORS.background.configPanel,
      borderWidth: BORDERS.thin,
      borderColor: COLORS.border.configPanel,
      borderRadius: BORDER_RADIUS.sm,
      overflow: 'hidden' as const,
    },
    containerOpen: { borderColor: COLORS.brand.red },
    header: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
    title: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
    statusBadge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 3,
      borderRadius: 3,
      fontSize: TYPOGRAPHY.sizes.xs,
      fontWeight: TYPOGRAPHY.weights.bold,
      backgroundColor: '#1c2a1c',
      color: COLORS.status.connectedAlt,
    },
    statusBadgeOff: { backgroundColor: '#2e1a1a', color: COLORS.brand.red },
    fieldLabel: {
      fontSize: TYPOGRAPHY.sizes.xs,
      color: COLORS.text.faded,
      fontWeight: TYPOGRAPHY.weights.bold,
      letterSpacing: 0.3,
    },
    input: {
      backgroundColor: COLORS.background.configInput,
      borderWidth: BORDERS.thin,
      borderColor: COLORS.border.configInput,
      borderRadius: BORDER_RADIUS.sm,
      color: COLORS.text.primary,
      fontSize: TYPOGRAPHY.sizes.sm,
      paddingVertical: SPACING.sm - 2,
      paddingHorizontal: SPACING.md - 2,
    },
    inputFocused: { borderColor: COLORS.brand.red },
  },

  // Map Selection Box (CSS .map-select-box)
  mapSelectBox: {
    container: {
      backgroundColor: COLORS.map.default.bg,
      borderWidth: BORDERS.thin,
      borderColor: COLORS.map.default.border,
      borderRadius: BORDER_RADIUS.sm,
      paddingVertical: SPACING.md - 2,
      paddingHorizontal: SPACING.md,
    },
    containerActive: { backgroundColor: COLORS.map.active.bg, borderColor: COLORS.map.active.border },
    title: { fontSize: 16, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
    titleActive: { color: '#ff453a' },
    desc: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.subtle, lineHeight: 13 * 1.3 },
    tag: {
      backgroundColor: COLORS.map.tag.default,
      color: COLORS.map.tag.text,
      fontSize: 9,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      fontWeight: TYPOGRAPHY.weights.bold,
    },
    tagActive: { backgroundColor: COLORS.brand.red, color: COLORS.text.primary },
  },

  // LED Buttons ON/OFF (CSS .led-btn)
  ledBtn: {
    on: {
      backgroundColor: '#1a2e1a',
      borderColor: '#2a4a2a',
      color: COLORS.status.connectedAlt,
      paddingVertical: 5,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.sm,
      borderWidth: BORDERS.thin,
    },
    off: {
      backgroundColor: '#2e1a1a',
      borderColor: '#4a2a2a',
      color: COLORS.brand.red,
    },
  },

  // Save Button (CSS .config-save-btn)
  saveBtn: {
    container: {
      backgroundColor: COLORS.brand.red,
      borderWidth: BORDERS.thin,
      borderColor: '#ff5a4a',
      borderRadius: BORDER_RADIUS.sm,
      paddingVertical: SPACING.sm,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    label: {
      color: COLORS.text.primary,
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: TYPOGRAPHY.weights.bold,
      letterSpacing: 1,
    },
    saved: {
      backgroundColor: COLORS.status.connectedAlt,
      borderColor: COLORS.status.connectedAlt,
    },
  },

  // Datalogger (CSS .datalogger-view, .log-bar-*)
  datalogger: {
    container: {
      backgroundColor: COLORS.background.datalogger,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.sm,
      borderWidth: BORDERS.thin,
      borderColor: '#1c1c22',
    },
    rowInfo: { fontSize: 11, color: COLORS.text.faded },
    barBg: {
      height: 14,
      backgroundColor: '#141418',
      borderRadius: 3,
      borderWidth: BORDERS.thin,
      borderColor: '#222222',
      overflow: 'hidden' as const,
    },
  },

  // Gauge (CSS .gauge-*)
  gauge: {
    arcBg: { stroke: '#2a2a34', strokeWidth: 8 },
    needle: { stroke: COLORS.brand.red, strokeWidth: 4 },
    hub: { fill: COLORS.brand.red },
    label: { fontSize: 11, color: COLORS.text.subtle, letterSpacing: 1 },
    value: { fontSize: TYPOGRAPHY.sizes.gaugeValue, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
    scaleFill: '#666666',
    tick: { stroke: '#666666', strokeWidth: 2 },
    led: {
      backgroundColor: '#000000',
      borderColor: '#333333',
      borderWidth: BORDERS.medium,
      width: 20,
      height: 20,
      borderRadius: 10,
    },
  },

  // Top Status Bar (CSS .top-status, .status-left)
  topStatus: {
    container: {
      backgroundColor: COLORS.background.topStatus,
      paddingHorizontal: 14,
      borderRadius: BORDER_RADIUS.sm,
      borderWidth: BORDERS.thin,
      borderColor: '#222222',
      height: 28,
    },
    textConnected: {
      color: COLORS.status.connectedAlt,
      fontWeight: TYPOGRAPHY.weights.bold,
      fontSize: 13,
    },
    textSearching: { color: COLORS.status.searching },
    dot: { width: 8, height: 8, borderRadius: 4 },
  },

  // Setting Item (CSS .setting-item)
  settingItem: {
    container: {
      backgroundColor: COLORS.background.setting,
      borderWidth: BORDERS.thin,
      borderColor: COLORS.border.setting,
      borderRadius: BORDER_RADIUS.sm,
      padding: SPACING.md,
    },
    icon: {
      width: 24,
      height: 24,
      backgroundColor: COLORS.brand.red,
      borderRadius: BORDER_RADIUS.sm,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
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
export const createShadow = (
  color: string,
  opacity: number,
  radius: number,
  elevation: number,
) => ({ shadowColor: color, shadowOpacity: opacity, shadowRadius: radius, elevation });

export const createTextStyle = (
  size: keyof typeof TYPOGRAPHY.sizes,
  weight: keyof typeof TYPOGRAPHY.weights = 'normal',
) => ({ fontSize: TYPOGRAPHY.sizes[size], fontWeight: TYPOGRAPHY.weights[weight] });

// Legado — compatibilidade com hooks existentes (use-theme-color.ts, etc.)
export { COLORS as Colors };
export default COLORS;