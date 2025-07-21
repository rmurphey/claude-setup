/**
 * Kiro Spec File Scanner
 * 
 * Discovers and parses .kiro/specs directory structure to extract tasks,
 * requirements, and other project metadata.
 */

import path from 'path';

import fs from 'fs-extra';

import type { 
  KiroTask, 
  SpecMetadata, 
  ParsedTaskItem, 
  ScanResult,
  TaskMetadata 
} from '../types/kiro-task.js';

export class KiroSpecScanner {
  private baseDir: string;
  private specsDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
    this.specsDir = path.join(baseDir, '.kiro', 'specs');
  }

  /**
   * Scan all specs and return comprehensive results
   */
  async scanAllSpecs(): Promise<ScanResult> {
    const result: ScanResult = {
      specs: [],
      tasks: [],
      scannedAt: new Date(),
      errors: []
    };

    try {
      // Check if .kiro/specs exists
      if (!await fs.pathExists(this.specsDir)) {
        result.errors.push({
          type: 'file_not_found',
          filePath: this.specsDir,
          message: 'Kiro specs directory not found. Run setup to initialize project.'
        });
        return result;
      }

      // Discover spec directories
      const specNames = await this.discoverSpecDirectories();
      
      // Process each spec
      for (const specName of specNames) {
        try {
          const specMetadata = await this.scanSpecDirectory(specName);
          const specTasks = await this.extractTasksFromSpec(specName);
          
          result.specs.push(specMetadata);
          result.tasks.push(...specTasks);
        } catch (error) {
          result.errors.push({
            type: 'parse_error',
            filePath: path.join(this.specsDir, specName),
            message: error instanceof Error ? error.message : 'Unknown error scanning spec'
          });
        }
      }

    } catch (error) {
      result.errors.push({
        type: 'parse_error',
        filePath: this.specsDir,
        message: error instanceof Error ? error.message : 'Unknown error during scan'
      });
    }

    return result;
  }

  /**
   * Discover all spec directories in .kiro/specs/
   */
  private async discoverSpecDirectories(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.specsDir, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();
    } catch (error) {
      throw new Error(`Failed to read specs directory: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Scan a specific spec directory for metadata
   */
  private async scanSpecDirectory(specName: string): Promise<SpecMetadata> {
    const specDir = path.join(this.specsDir, specName);
    
    const metadata: SpecMetadata = {
      name: specName,
      title: specName, // Will be updated from requirements.md if available
      totalTasks: 0,
      completedTasks: 0,
      progress: 0,
      lastUpdated: new Date(),
      dependencies: [],
      dependents: []
    };

    // Check for standard spec files
    const tasksFile = path.join(specDir, 'tasks.md');
    const requirementsFile = path.join(specDir, 'requirements.md');
    const designFile = path.join(specDir, 'design.md');

    if (await fs.pathExists(tasksFile)) {
      metadata.tasksFile = tasksFile;
      const stats = await fs.stat(tasksFile);
      metadata.lastUpdated = stats.mtime;
    }

    if (await fs.pathExists(requirementsFile)) {
      metadata.requirementsFile = requirementsFile;
      // Extract title from requirements.md
      metadata.title = await this.extractTitleFromRequirements(requirementsFile);
    }

    if (await fs.pathExists(designFile)) {
      metadata.designFile = designFile;
    }

    return metadata;
  }

  /**
   * Extract title from requirements.md file
   */
  private async extractTitleFromRequirements(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Look for first # heading or introduction section
      for (const line of lines) {
        if (line.startsWith('# ') && !line.includes('Requirements Document')) {
          return line.substring(2).trim();
        }
      }
      
      // Fallback to introduction content
      const introSection = content.match(/## Introduction\n\n([^\n]+)/);
      if (introSection?.[1]) {
        return introSection[1].trim();
      }
      
      return path.basename(path.dirname(filePath));
    } catch {
      return path.basename(path.dirname(filePath));
    }
  }

  /**
   * Extract all tasks from a spec directory
   */
  async extractTasksFromSpec(specName: string): Promise<KiroTask[]> {
    const tasksFile = path.join(this.specsDir, specName, 'tasks.md');
    
    if (!await fs.pathExists(tasksFile)) {
      return [];
    }

    const parsedTasks = await this.parseTasksFile(tasksFile);
    return parsedTasks.map(parsed => this.convertToKiroTask(parsed, specName));
  }

  /**
   * Parse tasks.md file and extract task items
   */
  async parseTasksFile(filePath: string): Promise<ParsedTaskItem[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const tasks: ParsedTaskItem[] = [];
      
      let currentTask: Partial<ParsedTaskItem> | null = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const lineNum = i + 1;
        
        // Check if this is a task line (starts with - [ ] or - [x])
        const taskMatch = line.match(/^- \[([ x])\] (\d+)\. (.+)$/);
        if (taskMatch) {
          // Save previous task if exists
          if (currentTask) {
            tasks.push(this.finalizeParseTask(currentTask));
          }
          
          // Start new task
          const checkbox = taskMatch[1];
          const numberStr = taskMatch[2];
          const title = taskMatch[3];
          
          if (checkbox !== undefined && numberStr !== undefined && title !== undefined) {
            currentTask = {
              raw: line,
              number: parseInt(numberStr, 10),
              title: title.trim(),
              completed: checkbox === 'x',
              lineNumber: lineNum,
              description: [],
              metadata: {
                requirements: [],
                dependencies: [],
                tags: []
              }
            };
          }
        } else if (currentTask && line.trim()) {
          // This is a continuation line for the current task
          if (line.startsWith('  ')) {
            // Task description or metadata
            const cleanLine = line.substring(2); // Remove indentation
            
            // Check for metadata patterns
            if (cleanLine.startsWith('_Requirements:')) {
              const reqMatch = cleanLine.match(/_Requirements:\s*([^_]+)_/);
              if (reqMatch?.[1]) {
                currentTask.metadata!.requirements = reqMatch[1]
                  .split(',')
                  .map(r => r.trim())
                  .filter(r => r);
              }
            } else if (cleanLine.startsWith('_Dependencies:')) {
              const depMatch = cleanLine.match(/_Dependencies:\s*([^_]+)_/);
              if (depMatch?.[1]) {
                currentTask.metadata!.dependencies = depMatch[1]
                  .split(',')
                  .map(d => d.trim())
                  .filter(d => d);
              }
            } else if (cleanLine.startsWith('_Priority:')) {
              const priMatch = cleanLine.match(/_Priority:\s*([^_]+)_/);
              if (priMatch?.[1]) {
                currentTask.metadata!.priority = priMatch[1].trim();
              }
            } else if (cleanLine.startsWith('_Assignee:')) {
              const assignMatch = cleanLine.match(/_Assignee:\s*([^_]+)_/);
              if (assignMatch?.[1]) {
                currentTask.metadata!.assignee = assignMatch[1].trim();
              }
            } else if (cleanLine.startsWith('_Tags:')) {
              const tagMatch = cleanLine.match(/_Tags:\s*([^_]+)_/);
              if (tagMatch?.[1]) {
                currentTask.metadata!.tags = tagMatch[1]
                  .split(',')
                  .map(t => t.trim())
                  .filter(t => t);
              }
            } else {
              // Regular description line
              currentTask.description!.push(cleanLine);
            }
          }
        } else if (currentTask && !line.trim()) {
          // Empty line - might be end of task, but continue for now
          continue;
        } else if (currentTask) {
          // Non-indented line that's not a task - end current task
          tasks.push(this.finalizeParseTask(currentTask));
          currentTask = null;
        }
      }
      
      // Don't forget the last task
      if (currentTask) {
        tasks.push(this.finalizeParseTask(currentTask));
      }
      
      return tasks;
    } catch (error) {
      throw new Error(`Failed to parse tasks file ${filePath}: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Finalize a parsed task by ensuring all required fields are present
   */
  private finalizeParseTask(partial: Partial<ParsedTaskItem>): ParsedTaskItem {
    return {
      raw: partial.raw || '',
      number: partial.number || 0,
      title: partial.title || 'Untitled Task',
      description: partial.description || [],
      completed: partial.completed || false,
      lineNumber: partial.lineNumber || 0,
      metadata: {
        requirements: partial.metadata?.requirements || [],
        dependencies: partial.metadata?.dependencies || [],
        tags: partial.metadata?.tags || [],
        ...(partial.metadata?.priority && { priority: partial.metadata.priority }),
        ...(partial.metadata?.assignee && { assignee: partial.metadata.assignee })
      }
    };
  }

  /**
   * Convert parsed task item to KiroTask
   */
  private convertToKiroTask(parsed: ParsedTaskItem, specName: string): KiroTask {
    const now = new Date();
    
    // Generate task ID
    const taskId = `${specName}-${parsed.number}`;
    
    // Determine priority
    const priority = this.normalizePriority(parsed.metadata.priority);
    
    // Determine category based on task content
    const category = this.categorizeTask(parsed.title, parsed.description);
    
    // Create task metadata
    const metadata: TaskMetadata = {
      requirementRefs: parsed.metadata.requirements,
      crossSpecDeps: parsed.metadata.dependencies.filter(dep => dep.includes('-')),
      originalTaskNumber: parsed.number,
      tags: parsed.metadata.tags
    };

    const task: KiroTask = {
      id: taskId,
      title: parsed.title,
      description: parsed.description.join('\n'),
      specName,
      sourceFile: 'tasks.md',
      lineNumber: parsed.lineNumber,
      status: parsed.completed ? 'completed' : 'pending',
      priority,
      category,
      requirements: parsed.metadata.requirements,
      dependencies: parsed.metadata.dependencies,
      estimatedEffort: this.estimateEffort(parsed.description),
      ...(parsed.metadata.assignee && { assignee: parsed.metadata.assignee }),
      createdAt: now,
      updatedAt: now,
      ...(parsed.completed && { completedAt: now }),
      notes: [],
      metadata
    };

    return task;
  }

  /**
   * Normalize priority string to valid priority level
   */
  private normalizePriority(priority?: string): KiroTask['priority'] {
    if (!priority) return 'medium';
    
    const normalized = priority.toLowerCase().trim();
    switch (normalized) {
      case 'critical':
      case 'urgent':
        return 'critical';
      case 'high':
      case 'important':
        return 'high';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Categorize task based on content
   */
  private categorizeTask(title: string, description: string[]): KiroTask['category'] {
    const content = (title + ' ' + description.join(' ')).toLowerCase();
    
    if (content.includes('test') || content.includes('spec') || content.includes('coverage')) {
      return 'testing';
    }
    
    if (content.includes('doc') || content.includes('readme') || content.includes('guide')) {
      return 'documentation';
    }
    
    if (content.includes('design') || content.includes('architecture') || content.includes('plan')) {
      return 'design';
    }
    
    if (content.includes('analyze') || content.includes('research') || content.includes('investigate')) {
      return 'analysis';
    }
    
    return 'implementation';
  }

  /**
   * Estimate effort based on task description complexity
   */
  private estimateEffort(description: string[]): KiroTask['estimatedEffort'] {
    const totalLines = description.length;
    const totalChars = description.join('').length;
    
    // Simple heuristic based on description length
    if (totalLines <= 1 && totalChars < 50) return 'xs';
    if (totalLines <= 2 && totalChars < 150) return 's';
    if (totalLines <= 4 && totalChars < 300) return 'm';
    if (totalLines <= 6 && totalChars < 500) return 'l';
    return 'xl';
  }
}

export default KiroSpecScanner;