/**
 * Centralized color configuration for the application.
 * All entity colors and color picker options should be imported from here.
 * 
 * The hex values are used for database storage and inline styles,
 * while CSS variables provide theme-aware colors for Tailwind classes.
 */

// Entity accent colors - used for color pickers across the app
export const ENTITY_COLORS = {
  emerald: { 
    hex: "#5cb78a", 
    label: "Emerald",
    cssVar: "var(--accent-emerald)"
  },
  blue: { 
    hex: "#3b82f6", 
    label: "Blue",
    cssVar: "var(--accent-blue)"
  },
  violet: { 
    hex: "#8b5cf6", 
    label: "Violet",
    cssVar: "var(--accent-violet)"
  },
  amber: { 
    hex: "#f59e0b", 
    label: "Amber",
    cssVar: "var(--accent-amber)"
  },
  red: { 
    hex: "#ef4444", 
    label: "Red",
    cssVar: "var(--accent-red)"
  },
  pink: { 
    hex: "#ec4899", 
    label: "Pink",
    cssVar: "var(--accent-pink)"
  },
  cyan: { 
    hex: "#06b6d4", 
    label: "Cyan",
    cssVar: "var(--accent-cyan)"
  },
  indigo: { 
    hex: "#6366f1", 
    label: "Indigo",
    cssVar: "var(--accent-indigo)"
  },
  gray: { 
    hex: "#6b7280", 
    label: "Gray",
    cssVar: "var(--accent-gray)"
  },
  orange: {
    hex: "#f97316",
    label: "Orange",
    cssVar: "var(--warning)"
  },
} as const;

// Default colors for different entity types
export const DEFAULT_COLORS = {
  account: ENTITY_COLORS.blue.hex,
  asset: ENTITY_COLORS.emerald.hex,
  liability: ENTITY_COLORS.red.hex,
  bill: ENTITY_COLORS.indigo.hex,
  tag: ENTITY_COLORS.gray.hex,
} as const;

// Color picker options for accounts
export const ACCOUNT_COLOR_OPTIONS = [
  { value: ENTITY_COLORS.emerald.hex, label: ENTITY_COLORS.emerald.label },
  { value: ENTITY_COLORS.blue.hex, label: ENTITY_COLORS.blue.label },
  { value: ENTITY_COLORS.violet.hex, label: ENTITY_COLORS.violet.label },
  { value: ENTITY_COLORS.amber.hex, label: ENTITY_COLORS.amber.label },
  { value: ENTITY_COLORS.red.hex, label: ENTITY_COLORS.red.label },
  { value: ENTITY_COLORS.pink.hex, label: ENTITY_COLORS.pink.label },
  { value: ENTITY_COLORS.cyan.hex, label: ENTITY_COLORS.cyan.label },
] as const;

// Color picker options for assets
export const ASSET_COLOR_OPTIONS = [
  { value: ENTITY_COLORS.emerald.hex, label: ENTITY_COLORS.emerald.label },
  { value: ENTITY_COLORS.blue.hex, label: ENTITY_COLORS.blue.label },
  { value: ENTITY_COLORS.violet.hex, label: ENTITY_COLORS.violet.label },
  { value: ENTITY_COLORS.amber.hex, label: ENTITY_COLORS.amber.label },
  { value: ENTITY_COLORS.cyan.hex, label: ENTITY_COLORS.cyan.label },
  { value: ENTITY_COLORS.pink.hex, label: ENTITY_COLORS.pink.label },
] as const;

// Color picker options for liabilities
export const LIABILITY_COLOR_OPTIONS = [
  { value: ENTITY_COLORS.red.hex, label: ENTITY_COLORS.red.label },
  { value: ENTITY_COLORS.orange.hex, label: ENTITY_COLORS.orange.label },
  { value: ENTITY_COLORS.amber.hex, label: ENTITY_COLORS.amber.label },
  { value: ENTITY_COLORS.pink.hex, label: ENTITY_COLORS.pink.label },
  { value: ENTITY_COLORS.violet.hex, label: ENTITY_COLORS.violet.label },
] as const;

// Type for color option
export type ColorOption = {
  value: string;
  label: string;
};

// Helper function to get a color option by hex value
export function getColorByHex(hex: string): typeof ENTITY_COLORS[keyof typeof ENTITY_COLORS] | undefined {
  return Object.values(ENTITY_COLORS).find(color => color.hex === hex);
}

