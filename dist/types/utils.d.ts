/**
 * Utility types and helper interfaces for Claude Project Setup
 *
 * Contains common utility types, result patterns, and helper interfaces
 * used throughout the application for consistent type handling.
 */
import type { CLIError } from './errors.js';
/**
 * Standard Result type for operations that can succeed or fail
 */
export type Result<T, E extends Error = CLIError> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
/**
 * Async version of Result type
 */
export type AsyncResult<T, E extends Error = CLIError> = Promise<Result<T, E>>;
/**
 * Optional Result type for operations that might not return data
 */
export type OptionalResult<T, E extends Error = CLIError> = {
    success: true;
    data?: T;
} | {
    success: false;
    error: E;
};
/**
 * Void Result type for operations that don't return data
 */
export type VoidResult<E extends Error = CLIError> = {
    success: true;
} | {
    success: false;
    error: E;
};
/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
/**
 * Make specific properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/**
 * Extract non-function properties from a type
 */
export type NonFunctionProperties<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
/**
 * Extract function properties from a type
 */
export type FunctionProperties<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
/**
 * Create a type with only non-function properties
 */
export type DataOnly<T> = Pick<T, NonFunctionProperties<T>>;
/**
 * Create a type with only function properties
 */
export type MethodsOnly<T> = Pick<T, FunctionProperties<T>>;
/**
 * Branded type for type safety
 */
export type Brand<T, B> = T & {
    __brand: B;
};
/**
 * Nominal type for stronger type checking
 */
export type Nominal<T, N extends string> = T & {
    readonly __nominal: N;
};
/**
 * String literal type for file paths
 */
export type FilePath = Brand<string, 'FilePath'>;
/**
 * String literal type for directory paths
 */
export type DirectoryPath = Brand<string, 'DirectoryPath'>;
/**
 * String literal type for URLs
 */
export type URL = Brand<string, 'URL'>;
/**
 * String literal type for email addresses
 */
export type Email = Brand<string, 'Email'>;
/**
 * String literal type for semantic versions
 */
export type SemVer = Brand<string, 'SemVer'>;
/**
 * String literal type for ISO date strings
 */
export type ISODateString = Brand<string, 'ISODateString'>;
/**
 * String literal type for GitHub repository names (owner/repo)
 */
export type GitHubRepo = Brand<string, 'GitHubRepo'>;
/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]];
/**
 * Readonly non-empty array type
 */
export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]];
/**
 * Array with at least N elements
 */
export type ArrayWithMinLength<T, N extends number> = T[] & {
    length: N;
} & T[];
/**
 * Tuple with specific length
 */
export type Tuple<T, N extends number> = T[] & {
    length: N;
};
/**
 * Object with at least one property
 */
export type NonEmptyObject<T> = T & {
    [K in keyof T]: T[K];
};
/**
 * Flatten nested object types
 */
export type Flatten<T> = T extends object ? {
    [K in keyof T]: Flatten<T[K]>;
} : T;
/**
 * Deep readonly type
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
/**
 * Mutable version of readonly type
 */
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
/**
 * Deep mutable version of readonly type
 */
export type DeepMutable<T> = {
    -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};
/**
 * Extract parameters from a function type
 */
export type Parameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;
/**
 * Extract return type from a function type
 */
export type ReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : any;
/**
 * Make function parameters optional
 */
export type OptionalParameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => infer R ? (...args: Partial<P>) => R : never;
/**
 * Async version of a function type
 */
export type AsyncFunction<T extends (...args: any[]) => any> = T extends (...args: infer P) => infer R ? (...args: P) => Promise<R> : never;
/**
 * Function that returns a Result
 */
export type ResultFunction<T extends (...args: any[]) => any, E extends Error = CLIError> = T extends (...args: infer P) => infer R ? (...args: P) => Result<R, E> : never;
/**
 * Async function that returns a Result
 */
export type AsyncResultFunction<T extends (...args: any[]) => any, E extends Error = CLIError> = T extends (...args: infer P) => infer R ? (...args: P) => AsyncResult<R, E> : never;
/**
 * Check if type is never
 */
export type IsNever<T> = [T] extends [never] ? true : false;
/**
 * Check if type is any
 */
export type IsAny<T> = 0 extends (1 & T) ? true : false;
/**
 * Check if type is unknown
 */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;
/**
 * Check if type is exactly equal to another type
 */
export type IsEqual<T, U> = (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2) ? true : false;
/**
 * Check if type extends another type
 */
export type Extends<T, U> = T extends U ? true : false;
/**
 * Get the difference between two types
 */
export type Diff<T, U> = T extends U ? never : T;
/**
 * Get the intersection of two types
 */
export type Intersection<T, U> = T extends U ? T : never;
/**
 * JSON primitive types
 */
export type JSONPrimitive = string | number | boolean | null;
/**
 * JSON value type
 */
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
/**
 * JSON object type
 */
export interface JSONObject {
    [key: string]: JSONValue;
}
/**
 * JSON array type
 */
export interface JSONArray extends Array<JSONValue> {
}
/**
 * Serializable type (can be converted to JSON)
 */
export type Serializable<T> = T extends JSONValue ? T : never;
/**
 * Convert type to JSON-serializable version
 */
export type ToJSON<T> = T extends JSONValue ? T : T extends {
    toJSON(): infer R;
} ? R : T extends object ? {
    [K in keyof T]: ToJSON<T[K]>;
} : never;
/**
 * Timestamp type for performance measurements
 */
export type Timestamp = Brand<number, 'Timestamp'>;
/**
 * Duration type for time measurements
 */
export type Duration = Brand<number, 'Duration'>;
/**
 * Performance measurement interface
 */
export interface PerformanceMeasurement {
    name: string;
    startTime: Timestamp;
    endTime?: Timestamp;
    duration?: Duration;
    metadata?: JSONObject;
}
/**
 * Benchmark result interface
 */
export interface BenchmarkResult {
    operation: string;
    iterations: number;
    totalTime: Duration;
    averageTime: Duration;
    minTime: Duration;
    maxTime: Duration;
    standardDeviation?: number;
    metadata?: JSONObject;
}
/**
 * Validation result type
 */
export type ValidationResult<T> = {
    valid: true;
    data: T;
} | {
    valid: false;
    errors: ValidationError[];
};
/**
 * Validation error interface
 */
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    value?: unknown;
}
/**
 * Validator function type
 */
export type Validator<T> = (value: unknown) => ValidationResult<T>;
/**
 * Schema validation type
 */
export interface Schema<T> {
    validate: Validator<T>;
    optional?: boolean;
    default?: T;
}
/**
 * Event listener function type
 */
export type EventListener<T = any> = (event: T) => void | Promise<void>;
/**
 * Event emitter interface
 */
export interface EventEmitter<T extends Record<string, any> = Record<string, any>> {
    on<K extends keyof T>(event: K, listener: EventListener<T[K]>): void;
    off<K extends keyof T>(event: K, listener: EventListener<T[K]>): void;
    emit<K extends keyof T>(event: K, data: T[K]): void;
}
/**
 * Disposable interface for cleanup
 */
export interface Disposable {
    dispose(): void | Promise<void>;
}
/**
 * Configuration provider interface
 */
export interface ConfigProvider<T> {
    get(): Promise<T>;
    set(config: T): Promise<void>;
    reset(): Promise<void>;
    validate(config: unknown): ValidationResult<T>;
}
/**
 * Configuration with metadata
 */
export interface ConfigWithMetadata<T> {
    data: T;
    metadata: {
        version: string;
        lastModified: ISODateString;
        source: string;
    };
}
/**
 * Type guard for checking if value is defined
 */
export declare function isDefined<T>(value: T | undefined | null): value is T;
/**
 * Type guard for checking if value is a string
 */
export declare function isString(value: unknown): value is string;
/**
 * Type guard for checking if value is a number
 */
export declare function isNumber(value: unknown): value is number;
/**
 * Type guard for checking if value is a boolean
 */
export declare function isBoolean(value: unknown): value is boolean;
/**
 * Type guard for checking if value is an object
 */
export declare function isObject(value: unknown): value is object;
/**
 * Type guard for checking if value is an array
 */
export declare function isArray<T>(value: unknown): value is T[];
/**
 * Type guard for checking if value is a function
 */
export declare function isFunction(value: unknown): value is Function;
/**
 * Type guard for checking if value is a Result success
 */
export declare function isResultSuccess<T, E extends Error>(result: Result<T, E>): result is {
    success: true;
    data: T;
};
/**
 * Type guard for checking if value is a Result failure
 */
export declare function isResultFailure<T, E extends Error>(result: Result<T, E>): result is {
    success: false;
    error: E;
};
//# sourceMappingURL=utils.d.ts.map