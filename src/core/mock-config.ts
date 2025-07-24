/**
 * Typesafe configuration for GraphQL auto-mocker
 */

/**
 * Per-field config for scalars and arrays
 */
export interface MockFieldConfig {
  /** For numbers: minimum value */
  min?: number;
  /** For numbers: maximum value */
  max?: number;
  /** For dates: minimum ISO date string */
  minDate?: string;
  /** For dates: maximum ISO date string */
  maxDate?: string;
  /** For arrays: min length */
  arrayMin?: number;
  /** For arrays: max length */
  arrayMax?: number;
  /** Override value or function to generate value */
  value?: any | (() => any);
}

/**
 * Per-type config (fields, nested types)
 */
export interface MockTypeConfig {
  /** Per-field config */
  fields?: Record<string, MockFieldConfig>;
}

/**
 * Per-operation config (enable/disable mocking)
 */
export interface MockOperationConfig {
  enabled?: boolean;
}

/**
 * Main config object for the mocker
 */
export interface MockConfig {
  /** Enable/disable mocking globally */
  enabled?: boolean;
  /** Per-operation config */
  operations?: Record<string, MockOperationConfig>;
  /** Per-type config */
  types?: Record<string, MockTypeConfig>;
} 