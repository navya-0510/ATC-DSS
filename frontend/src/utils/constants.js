export const RADAR_CONFIG = {
  WIDTH: 1400,
  HEIGHT: 900,
  CENTER_X: 700,
  CENTER_Y: 450,
  RANGE: 400,
  GRID_SIZE: 50,
  UPDATE_INTERVAL: 100,
};

export const CONFLICT_CONFIG = {
  DISTANCE_THRESHOLD: 50,
  ALTITUDE_THRESHOLD: 1000,
  PREDICTION_SECONDS: 60,
  PREDICTION_STEPS: 30,
};

export const CONFIG = {
  DISTANCE_THRESHOLD: 50,
  ALTITUDE_THRESHOLD: 1000,
  PREDICTION_SECONDS: 60,
  PREDICTION_STEPS: 30,
};

export const AIRCRAFT_TYPES = {
  COMMERCIAL: { speedRange: [300, 500], altitudeRange: [25000, 40000] },
  PRIVATE: { speedRange: [150, 300], altitudeRange: [8000, 20000] },
  CARGO: { speedRange: [250, 450], altitudeRange: [20000, 35000] },
  EMERGENCY: { speedRange: [200, 400], altitudeRange: [5000, 30000] },
};

export const SUGGESTION_TYPES = {
  ALTITUDE: 'altitude',
  HEADING: 'heading',
  SPEED: 'speed',
};

export const SEVERITY = {
  CRITICAL: { level: 3, color: '#ff3366', label: 'CRITICAL' },
  HIGH: { level: 2, color: '#ff9933', label: 'HIGH' },
  MEDIUM: { level: 1, color: '#ffcc00', label: 'MEDIUM' },
  LOW: { level: 0, color: '#00ff9d', label: 'LOW' },
};

// Theme configuration
export const THEMES = {
  dark: {
    background: '#0a0e1a',
    surface: '#060810',
    radar: '#0a1a2e',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    border: '#00ff9d',
    cardBg: 'rgba(6, 8, 16, 0.9)',
  },
  light: {
    background: '#f0f4f8',
    surface: '#ffffff',
    radar: '#e8f0fe',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#3b82f6',
    cardBg: 'rgba(255, 255, 255, 0.95)',
  }
};