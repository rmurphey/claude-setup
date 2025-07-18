/**
 * Utility types and helper interfaces for Claude Project Setup
 *
 * Contains common utility types, result patterns, and helper interfaces
 * used throughout the application for consistent type handling.
 */
// =============================================================================
// Type Guards
// =============================================================================
/**
 * Type guard for checking if value is defined
 */
export function isDefined(value) {
    return value !== undefined && value !== null;
}
/**
 * Type guard for checking if value is a string
 */
export function isString(value) {
    return typeof value === 'string';
}
/**
 * Type guard for checking if value is a number
 */
export function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
/**
 * Type guard for checking if value is a boolean
 */
export function isBoolean(value) {
    return typeof value === 'boolean';
}
/**
 * Type guard for checking if value is an object
 */
export function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * Type guard for checking if value is an array
 */
export function isArray(value) {
    return Array.isArray(value);
}
/**
 * Type guard for checking if value is a function
 */
export function isFunction(value) {
    return typeof value === 'function';
}
/**
 * Type guard for checking if value is a Result success
 */
export function isResultSuccess(result) {
    return result.success === true;
}
/**
 * Type guard for checking if value is a Result failure
 */
export function isResultFailure(result) {
    return result.success === false;
}
//# sourceMappingURL=utils.js.map