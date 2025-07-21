/**
 * TypeScript definitions for MarkdownSpecScanner
 */

export interface MarkdownTask {
  raw: string;
  number: number;
  title: string;
  completed: boolean;
  lineNumber: number;
  description: string[];
  metadata: {
    requirements: string[];
    dependencies: string[];
    tags: string[];
    priority?: string;
    assignee?: string;
  };
}

export interface SpecMetadata {
  title: string;
  description: string;
  version: string;
  lastModified: Date;
}

export declare class MarkdownSpecScanner {
  constructor();
  parseFile(content: string): Promise<any>;
  extractTasks(ast: any): MarkdownTask[];
  extractSpecMetadata(ast: any): SpecMetadata;
}