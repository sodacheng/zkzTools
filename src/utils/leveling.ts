import type { LevelLimits, Station, Reading, KConfig } from '../types';

// Level limits configuration
export const LEVEL_LIMITS: Record<'third' | 'fourth', LevelLimits> = {
  third: {
    maxSightDistance: 75, // meters
    maxDistanceDiff: 3, // meters
    maxAccumulatedDistanceDiff: 6, // meters
    maxBlackRedDiff: 2, // mm
    maxHeightDiffDiff: 3, // mm
    minSightHeight: 300, // mm (reading should not exceed this)
  },
  fourth: {
    maxSightDistance: 100, // meters
    maxDistanceDiff: 5, // meters
    maxAccumulatedDistanceDiff: 10, // meters
    maxBlackRedDiff: 3, // mm
    maxHeightDiffDiff: 5, // mm
    minSightHeight: 200, // mm (reading should not exceed this)
  },
};

// Default K configurations
export const K_CONFIGS: Record<string, KConfig> = {
  optionA: { k1: 4.687, k2: 4.787 },
  optionB: { k1: 4.787, k2: 4.687 },
};

// Get reading labels for each level
export const getReadingLabels = (level: 'third' | 'fourth'): string[] => {
  if (level === 'third') {
    return [
      '后视黑面 - 上丝',
      '后视黑面 - 下丝',
      '后视黑面 - 中丝',
      '前视黑面 - 上丝',
      '前视黑面 - 下丝',
      '前视黑面 - 中丝',
      '前视红面 - 中丝',
      '后视红面 - 中丝',
    ];
  } else {
    return [
      '后视黑面 - 上丝',
      '后视黑面 - 下丝',
      '后视黑面 - 中丝',
      '后视红面 - 中丝',
      '前视黑面 - 上丝',
      '前视黑面 - 下丝',
      '前视黑面 - 中丝',
      '前视红面 - 中丝',
    ];
  }
};

// Format value to 4 digits with leading zeros
export const formatToFourDigits = (value: string): string => {
  const num = parseInt(value.replace(/\D/g, ''), 10);
  if (isNaN(num)) return '';
  return num.toString().padStart(4, '0');
};

// Parse reading value to number (mm)
export const parseReading = (value: string): number => {
  return parseInt(value, 10) || 0;
};

// Calculate sight distance from upper and lower readings
// Note: In leveling, larger reading means lower position on the rod
// So distance = (lower - upper) * 100, but since we store readings where 
// upper < lower numerically represents the physical reality,
// we calculate as Math.abs(upper - lower) * 100
export const calculateSightDistance = (upper: string, lower: string): number => {
  const upperVal = parseReading(upper);
  const lowerVal = parseReading(lower);
  // The difference multiplied by 100 gives distance in meters
  // Since upper reading should be smaller than lower reading physically,
  // we take absolute value to handle any input order
  return Math.abs(upperVal - lowerVal) * 100 / 1000; // Convert to meters (readings are in mm, *100 then /1000)
};

// Actually, based on the spec: (上丝 - 下丝) × 100, and 上丝 < 下丝 means (下丝 - 上丝) × 100
// Readings are in mm, so (lower - upper) * 100 / 1000 = meters
export const calculateSightDistanceCorrect = (upper: string, lower: string): number => {
  const upperVal = parseReading(upper);
  const lowerVal = parseReading(lower);
  // Distance in meters = |upper - lower| * 100 / 1000 (since readings are mm)
  return Math.abs(lowerVal - upperVal) * 0.1;
};

// Calculate station data
export const calculateStation = (
  readings: Reading[],
  k1: number,
  k2: number,
  accumulatedDistanceDiff: number,
  level: 'third' | 'fourth'
): Partial<Station> & { errors: string[] } => {
  const errors: string[] = [];
  const limits = LEVEL_LIMITS[level];

  const result: Partial<Station> = {
    backSightDistance: 0,
    frontSightDistance: 0,
    distanceDiff: 0,
    accumulatedDistanceDiff: 0,
    blackRedDiffBack: 0,
    blackRedDiffFront: 0,
    heightDiffBlack: 0,
    heightDiffRed: 0,
    heightDiffDiff: 0,
    meanHeightDiff: 0,
  };

  // Helper to get reading value by label pattern
  const getReading = (pattern: string): string => {
    const reading = readings.find(r => r.label.includes(pattern));
    return reading?.value || '';
  };

  // Get all readings
  const backBlackUpper = getReading('后视黑面 - 上丝');
  const backBlackLower = getReading('后视黑面 - 下丝');
  const backBlackMiddle = getReading('后视黑面 - 中丝');
  const backRedMiddle = getReading('后视红面 - 中丝');
  const frontBlackUpper = getReading('前视黑面 - 上丝');
  const frontBlackLower = getReading('前视黑面 - 下丝');
  const frontBlackMiddle = getReading('前视黑面 - 中丝');
  const frontRedMiddle = getReading('前视红面 - 中丝');

  // Calculate sight distances (in meters)
  if (backBlackUpper && backBlackLower) {
    result.backSightDistance = calculateSightDistanceCorrect(backBlackUpper, backBlackLower);
  }
  if (frontBlackUpper && frontBlackLower) {
    result.frontSightDistance = calculateSightDistanceCorrect(frontBlackUpper, frontBlackLower);
  }

  // Calculate distance difference
  if (result.backSightDistance && result.frontSightDistance) {
    result.distanceDiff = result.backSightDistance - result.frontSightDistance;
    result.accumulatedDistanceDiff = accumulatedDistanceDiff + result.distanceDiff;
  }

  // Calculate black-red differences for middle readings
  // Back: |backBlackMiddle - (backRedMiddle - k1 * 1000)|
  if (backBlackMiddle && backRedMiddle) {
    const backBlackVal = parseReading(backBlackMiddle);
    const backRedVal = parseReading(backRedMiddle);
    const k1Mm = k1 * 1000; // Convert k1 to mm
    result.blackRedDiffBack = Math.abs(backBlackVal - (backRedVal - k1Mm));
  }

  // Front: |frontBlackMiddle - (frontRedMiddle - k2 * 1000)|
  if (frontBlackMiddle && frontRedMiddle) {
    const frontBlackVal = parseReading(frontBlackMiddle);
    const frontRedVal = parseReading(frontRedMiddle);
    const k2Mm = k2 * 1000; // Convert k2 to mm
    result.blackRedDiffFront = Math.abs(frontBlackVal - (frontRedVal - k2Mm));
  }

  // Calculate height differences
  if (backBlackMiddle && frontBlackMiddle) {
    const backBlackVal = parseReading(backBlackMiddle);
    const frontBlackVal = parseReading(frontBlackMiddle);
    result.heightDiffBlack = backBlackVal - frontBlackVal; // mm
  }

  if (backRedMiddle && frontRedMiddle) {
    const backRedVal = parseReading(backRedMiddle);
    const frontRedVal = parseReading(frontRedMiddle);
    result.heightDiffRed = backRedVal - frontRedVal; // mm
  }

  // Calculate height difference difference
  // |blackHeightDiff - redHeightDiff|, theoretically should be ±100mm due to k1-k2 difference
  if (result.heightDiffBlack !== 0 && result.heightDiffRed !== 0) {
    // The theoretical difference is (k1 - k2) * 1000
    const kDiff = (k1 - k2) * 1000; // in mm
    // Black face height diff vs Red face height diff (adjusted for K difference)
    result.heightDiffDiff = Math.abs((result.heightDiffBlack || 0) - ((result.heightDiffRed || 0) + kDiff));
    
    // Mean height difference: use black face as standard per specification
    // Or average of both after adjustment
    result.meanHeightDiff = ((result.heightDiffBlack || 0) + ((result.heightDiffRed || 0) + kDiff)) / 2;
  }

  // Validation checks
  const validate = () => {
    // Check sight distances
    if ((result.backSightDistance || 0) > limits.maxSightDistance) {
      errors.push(`后视距超限：${(result.backSightDistance || 0).toFixed(1)}米，限差${limits.maxSightDistance}米`);
    }
    if ((result.frontSightDistance || 0) > limits.maxSightDistance) {
      errors.push(`前视距超限：${(result.frontSightDistance || 0).toFixed(1)}米，限差${limits.maxSightDistance}米`);
    }

    // Check distance difference
    if (Math.abs(result.distanceDiff || 0) > limits.maxDistanceDiff) {
      errors.push(`前后视距差超限：${(result.distanceDiff || 0).toFixed(1)}米，限差${limits.maxDistanceDiff}米`);
    }

    // Check accumulated distance difference
    if (Math.abs(result.accumulatedDistanceDiff || 0) > limits.maxAccumulatedDistanceDiff) {
      errors.push(`累积视距差超限：${(result.accumulatedDistanceDiff || 0).toFixed(1)}米，限差${limits.maxAccumulatedDistanceDiff}米`);
    }

    // Check black-red differences
    if ((result.blackRedDiffBack || 0) > limits.maxBlackRedDiff) {
      errors.push(`后视黑红面中丝读数之差超限：${(result.blackRedDiffBack || 0).toFixed(1)}毫米，限差${limits.maxBlackRedDiff}毫米`);
    }
    if ((result.blackRedDiffFront || 0) > limits.maxBlackRedDiff) {
      errors.push(`前视黑红面中丝读数之差超限：${(result.blackRedDiffFront || 0).toFixed(1)}毫米，限差${limits.maxBlackRedDiff}毫米`);
    }

    // Check height difference difference
    if ((result.heightDiffDiff || 0) > limits.maxHeightDiffDiff) {
      errors.push(`黑红面高差之差超限：${(result.heightDiffDiff || 0).toFixed(1)}毫米，限差${limits.maxHeightDiffDiff}毫米`);
    }

    // Check sight height (black face middle reading should not exceed limit)
    if (backBlackMiddle) {
      const backBlackVal = parseReading(backBlackMiddle);
      if (backBlackVal > limits.minSightHeight) {
        errors.push(`后视视线高度超限：${backBlackVal}毫米，限差${limits.minSightHeight}毫米`);
      }
    }
    if (frontBlackMiddle) {
      const frontBlackVal = parseReading(frontBlackMiddle);
      if (frontBlackVal > limits.minSightHeight) {
        errors.push(`前视视线高度超限：${frontBlackVal}毫米，限差${limits.minSightHeight}毫米`);
      }
    }
  };

  validate();

  return { ...result, errors };
};

// Swap K values for next station
export const swapKValues = (k1: number, k2: number): KConfig => {
  return { k1: k2, k2: k1 };
};
