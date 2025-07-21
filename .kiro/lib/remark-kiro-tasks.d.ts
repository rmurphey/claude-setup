/**
 * TypeScript definitions for remarkKiroTasks plugin
 */

export interface KiroTaskHierarchy {
  number: number;
  title: string;
  depth: number;
}

export interface KiroTaskParent {
  number: number;
  title: string;
}

export interface KiroTaskChild {
  number: number;
  title: string;
  completed: boolean;
}

export interface KiroTaskMetadata {
  requirements: string[];
  dependencies: string[];
  tags: string[];
  priority?: string;
  assignee?: string;
  effort?: string;
  listType?: 'ordered' | 'unordered';
  listStart?: number;
}

export interface EnhancedKiroTask {
  raw: string;
  checkbox: string;
  completed: boolean;
  number: number;
  title: string;
  lineNumber: number;
  depth: number;
  hierarchy: KiroTaskHierarchy[];
  parent: KiroTaskParent | null;
  children: KiroTaskChild[];
  metadata: KiroTaskMetadata;
}

export interface RemarkKiroTasksOptions {
  checkboxPatterns?: RegExp[];
  taskNumberPattern?: RegExp;
  enableHierarchy?: boolean;
  maxDepth?: number;
  extractMetadata?: boolean;
}

export declare function remarkKiroTasks(options?: RemarkKiroTasksOptions): (tree: any, file: any) => any;
export default remarkKiroTasks;