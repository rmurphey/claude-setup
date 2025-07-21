/**
 * Types for Kiro task management system
 */

export interface KiroTask {
  /** Unique identifier following spec-name-number format */
  id: string;
  /** Task title/description */
  title: string;
  /** Full task description with sub-items */
  description: string;
  /** Source spec name (directory name) */
  specName: string;
  /** Source file path relative to spec directory */
  sourceFile: string;
  /** Line number in source file */
  lineNumber: number;
  /** Task completion status */
  status: 'pending' | 'in_progress' | 'completed';
  /** Task priority level */
  priority: 'critical' | 'high' | 'medium' | 'low';
  /** Task category */
  category: 'implementation' | 'testing' | 'documentation' | 'analysis' | 'design';
  /** Referenced requirement IDs */
  requirements: string[];
  /** Task dependencies (other task IDs) */
  dependencies: string[];
  /** Estimated effort size */
  estimatedEffort: 'xs' | 's' | 'm' | 'l' | 'xl';
  /** Task assignee */
  assignee?: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Completion timestamp */
  completedAt?: Date;
  /** Additional notes with timestamps */
  notes: TaskNote[];
  /** Additional metadata */
  metadata: TaskMetadata;
}

export interface TaskNote {
  /** Note content */
  content: string;
  /** When the note was added */
  timestamp: Date;
  /** Who added the note */
  author?: string;
}

export interface TaskMetadata {
  /** Requirement references extracted from _Requirements: pattern */
  requirementRefs: string[];
  /** Cross-spec dependencies */
  crossSpecDeps: string[];
  /** Related design context */
  designContext?: string;
  /** Original task number from source file */
  originalTaskNumber?: number;
  /** Custom tags */
  tags: string[];
}

export interface SpecMetadata {
  /** Spec directory name */
  name: string;
  /** Spec title from requirements.md */
  title: string;
  /** Path to tasks.md file */
  tasksFile?: string;
  /** Path to requirements.md file */
  requirementsFile?: string;
  /** Path to design.md file */
  designFile?: string;
  /** Total number of tasks */
  totalTasks: number;
  /** Number of completed tasks */
  completedTasks: number;
  /** Progress percentage (0-100) */
  progress: number;
  /** Last modification time */
  lastUpdated: Date;
  /** Other specs this depends on */
  dependencies: string[];
  /** Other specs that depend on this */
  dependents: string[];
}

export interface ParsedTaskItem {
  /** Raw task line from markdown */
  raw: string;
  /** Task number */
  number: number;
  /** Task title */
  title: string;
  /** Task description lines */
  description: string[];
  /** Completion status */
  completed: boolean;
  /** Line number in source file */
  lineNumber: number;
  /** Extracted metadata */
  metadata: {
    requirements: string[];
    dependencies: string[];
    priority?: string;
    assignee?: string;
    tags: string[];
  };
}

export interface TodoConfig {
  /** Path to .kiro/specs directory */
  specDirectory: string;
  /** Task ID format template */
  taskIdFormat: string;
  /** Default priority for new tasks */
  defaultPriority: KiroTask['priority'];
  /** Available display formats */
  displayFormats: ('table' | 'list' | 'json' | 'markdown')[];
  /** Whether to sync files on task updates */
  syncOnUpdate: boolean;
  /** Whether to track completion velocity */
  trackVelocity: boolean;
  /** Whether to enable effort estimation */
  estimationEnabled: boolean;
  /** Whether to analyze cross-spec relationships */
  crossSpecAnalysis: boolean;
  /** Whether to enable interactive mode */
  interactiveMode: boolean;
}

export interface TodoDatabase {
  /** All tasks indexed by ID */
  tasks: Record<string, KiroTask>;
  /** Spec metadata indexed by name */
  specs: Record<string, SpecMetadata>;
  /** Last database update */
  lastUpdated: Date;
  /** Database version for migrations */
  version: number;
}

export interface ScanResult {
  /** All discovered specs */
  specs: SpecMetadata[];
  /** All extracted tasks */
  tasks: KiroTask[];
  /** Scan timestamp */
  scannedAt: Date;
  /** Any errors encountered during scan */
  errors: ScanError[];
}

export interface ScanError {
  /** Error type */
  type: 'parse_error' | 'file_not_found' | 'permission_denied' | 'invalid_format';
  /** File path where error occurred */
  filePath: string;
  /** Error message */
  message: string;
  /** Line number if applicable */
  lineNumber?: number;
}