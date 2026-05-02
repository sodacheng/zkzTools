// User interface
export interface User {
  username: string;
  password: string;
}

// Project interface
export interface Project {
  id: string;
  name: string;
  createdAt: string; // ISO format
  unit: string; // Creator's username
  level: 'third' | 'fourth'; // Third or Fourth level
  stations: Station[];
}

// Station interface
export interface Station {
  stationNo: number; // Starting from 1
  backPoint: string;
  frontPoint: string;
  readings: Reading[]; // Stored in input order
  k1: number;
  k2: number;
  // Calculation results
  backSightDistance: number; // Back sight distance (meters)
  frontSightDistance: number; // Front sight distance (meters)
  distanceDiff: number; // Difference between back and front sight distances
  accumulatedDistanceDiff: number; // Accumulated distance difference
  blackRedDiffBack: number; // Back sight black-red difference
  blackRedDiffFront: number; // Front sight black-red difference
  heightDiffBlack: number; // Black face height difference
  heightDiffRed: number; // Red face height difference
  heightDiffDiff: number; // Difference between black and red face height differences
  meanHeightDiff: number; // Mean height difference
  isValid?: boolean; // Whether the station passes all checks
  errors?: string[]; // Error messages if any
}

// Reading interface
export interface Reading {
  label: string; // e.g., "后视黑面上丝"
  value: string; // 4-digit string, e.g., "0123"
}

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
  currentValue: number | string;
  limit: number | string;
}

// K value configuration
export interface KConfig {
  k1: number;
  k2: number;
}

// Level type for limits
export type LevelType = 'third' | 'fourth';

// Limits for each level
export interface LevelLimits {
  maxSightDistance: number; // Maximum sight distance (meters)
  maxDistanceDiff: number; // Maximum distance difference (meters)
  maxAccumulatedDistanceDiff: number; // Maximum accumulated distance difference (meters)
  maxBlackRedDiff: number; // Maximum black-red difference (mm)
  maxHeightDiffDiff: number; // Maximum height difference difference (mm)
  minSightHeight: number; // Minimum sight height (mm)
}
