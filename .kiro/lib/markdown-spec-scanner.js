/**
 * Enhanced Markdown Spec Scanner using remark AST processing
 * 
 * Internal tool for .kiro/ spec management system.
 * Replaces regex-based parsing with proper AST traversal for robust
 * markdown spec file analysis and task extraction.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';

import { remarkKiroTasks } from './remark-kiro-tasks.js';

export class MarkdownSpecScanner {
  constructor() {
    this.processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkKiroTasks)
      .use(remarkStringify);
  }

  /**
   * Parse a markdown file and return AST with enhanced task processing
   */
  async parseFile(content) {
    const ast = this.processor.parse(content);
    const processedResult = await this.processor.process(content);
    
    // Store the processed file data for enhanced task extraction
    this.lastProcessedFile = processedResult;
    
    return ast;
  }

  /**
   * Extract tasks from markdown AST using enhanced processing
   */
  extractTasks(ast) {
    // Try enhanced task extraction first
    if (this.lastProcessedFile && this.lastProcessedFile.data && this.lastProcessedFile.data.kiroTasks) {
      return this.convertEnhancedTasks(this.lastProcessedFile.data.kiroTasks);
    }
    
    // Fallback to basic AST parsing
    return this.extractBasicTasks(ast);
  }

  /**
   * Extract enhanced tasks and convert to compatible format
   */
  convertEnhancedTasks(enhancedTasks) {
    return enhancedTasks.map(task => ({
      raw: task.raw,
      number: task.number,
      title: task.title,
      completed: task.completed,
      lineNumber: task.lineNumber,
      description: [], // Enhanced tasks don't currently populate this
      metadata: {
        requirements: task.metadata.requirements || [],
        dependencies: task.metadata.dependencies || [],
        tags: task.metadata.tags || [],
        priority: task.metadata.priority,
        assignee: task.metadata.assignee,
        effort: task.metadata.effort
      },
      // Enhanced fields
      depth: task.depth,
      hierarchy: task.hierarchy,
      parent: task.parent,
      children: task.children
    }));
  }

  /**
   * Basic task extraction for fallback compatibility
   */
  extractBasicTasks(ast) {
    const tasks = [];

    visit(ast, 'listItem', (item) => {
      // Only process checkbox list items
      if (item.checked !== null && item.checked !== undefined) {
        const task = this.parseTaskFromListItem(item);
        if (task) {
          tasks.push(task);
        }
      }
    });

    return tasks;
  }

  /**
   * Parse a single list item as a task
   */
  parseTaskFromListItem(item) {
    if (!item.children || item.children.length === 0) {
      return null;
    }

    const firstChild = item.children[0];
    if (firstChild.type !== 'paragraph') {
      return null;
    }

    const text = this.extractTextFromNode(firstChild);
    
    // Extract task number and title from first line only
    const firstLine = text.split('\n')[0];
    const taskMatch = firstLine.match(/^(\d+)\.\s+(.+)$/);
    if (!taskMatch) {
      return null; // Not a numbered task
    }

    const [, numberStr, title] = taskMatch;
    const number = parseInt(numberStr, 10);
    const completed = item.checked === true;

    // Extract metadata from subsequent children
    const metadata = this.extractTaskMetadata(item);

    return {
      raw: text,
      number,
      title: title.trim(),
      completed,
      lineNumber: item.position?.start?.line || 0,
      description: [], // TODO: Extract description lines
      metadata
    };
  }

  /**
   * Extract text content from a node
   */
  extractTextFromNode(node) {
    if (node.type === 'text') {
      return node.value;
    }
    
    if (node.children) {
      return node.children
        .map((child) => this.extractTextFromNode(child))
        .join('');
    }
    
    return '';
  }

  /**
   * Extract metadata from task item children
   */
  extractTaskMetadata(item) {
    const metadata = {
      requirements: [],
      dependencies: [],
      tags: []
    };

    // Look for metadata in subsequent paragraphs
    for (let i = 1; i < item.children.length; i++) {
      const child = item.children[i];
      if (child.type === 'paragraph') {
        const text = this.extractTextFromNode(child);
        this.parseMetadataLine(text, metadata);
      }
    }

    return metadata;
  }

  /**
   * Parse metadata from a text line
   */
  parseMetadataLine(line, metadata) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('_Requirements:')) {
      const reqMatch = trimmed.match(/_Requirements:\s*([^_]+)_/);
      if (reqMatch?.[1]) {
        metadata.requirements = reqMatch[1]
          .split(',')
          .map(r => r.trim())
          .filter(r => r);
      }
    } else if (trimmed.startsWith('_Dependencies:')) {
      const depMatch = trimmed.match(/_Dependencies:\s*([^_]+)_/);
      if (depMatch?.[1]) {
        metadata.dependencies = depMatch[1]
          .split(',')
          .map(d => d.trim())
          .filter(d => d);
      }
    } else if (trimmed.startsWith('_Priority:')) {
      const priMatch = trimmed.match(/_Priority:\s*([^_]+)_/);
      if (priMatch?.[1]) {
        metadata.priority = priMatch[1].trim();
      }
    } else if (trimmed.startsWith('_Tags:')) {
      const tagMatch = trimmed.match(/_Tags:\s*([^_]+)_/);
      if (tagMatch?.[1]) {
        metadata.tags = tagMatch[1]
          .split(',')
          .map(t => t.trim())
          .filter(t => t);
      }
    }
  }

  /**
   * Extract spec metadata from AST
   */
  extractSpecMetadata(ast) {
    const metadata = {
      title: 'Untitled Spec',
      description: '',
      version: '1.0',
      lastModified: new Date()
    };

    // Find the first heading as title
    visit(ast, 'heading', (node) => {
      if (node.depth === 1) {
        metadata.title = this.extractTextFromNode(node);
        return 'exit'; // Stop after first h1
      }
    });

    return metadata;
  }
}