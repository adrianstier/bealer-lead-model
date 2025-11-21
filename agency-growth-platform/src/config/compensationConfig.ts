/**
 * Compensation Configuration Manager
 *
 * This file manages which year's compensation structure is active.
 * To switch to 2026:
 * 1. Create compensation2026.ts with updated values
 * 2. Import it here
 * 3. Change ACTIVE_YEAR to 2026
 */

import { compensation2025 } from './compensation2025';
import type { CompensationConfig } from './compensation2025';
// import { compensation2026 } from './compensation2026'; // Uncomment when 2026 is ready

// Set the active compensation year
export const ACTIVE_YEAR = 2025;

// Map of available compensation configurations
const compensationConfigs: Record<number, CompensationConfig> = {
  2025: compensation2025,
  // 2026: compensation2026, // Uncomment when 2026 is ready
};

// Get the active compensation configuration
export function getActiveCompensation(): CompensationConfig {
  const config = compensationConfigs[ACTIVE_YEAR];
  if (!config) {
    throw new Error(`Compensation configuration for year ${ACTIVE_YEAR} not found`);
  }
  return config;
}

// Get compensation for a specific year
export function getCompensationForYear(year: number): CompensationConfig | null {
  return compensationConfigs[year] || null;
}

// Get all available years
export function getAvailableYears(): number[] {
  return Object.keys(compensationConfigs).map(Number).sort();
}

// Export the active configuration as default
export const activeCompensation = getActiveCompensation();

export default activeCompensation;
