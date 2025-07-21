/**
 * remarkKiroTasks - Custom remark plugin for enhanced Kiro task detection
 * 
 * Extends standard remark-gfm checkbox parsing to handle:
 * - Hierarchical task structures (phases → tasks → subtasks)
 * - Multiple checkbox formats ([x], [X], [✓], etc.)
 * - Task numbering and metadata extraction
 * - Line number tracking and structural context
 */


/**
 * Configuration options for remarkKiroTasks plugin
 */
const DEFAULT_OPTIONS = {
  // Checkbox patterns to recognize
  checkboxPatterns: [
    /^\[([ xX✓])\]\s+/,  // Extended: [ ], [x], [X], [✓]
    /^-\s*\[([ xX✓])\]\s+/, // With dash: - [ ], - [x]
    /^\*\s*\[([ xX✓])\]\s+/, // With asterisk: * [ ], * [x]
    /^\+\s*\[([ xX✓])\]\s+/, // With plus: + [ ], + [x]
  ],
  
  // Task number patterns (support hierarchical numbering like 1.1.1)
  taskNumberPattern: /^(\d+(?:\.\d+)*)\.\s+(.+)$/,
  
  // Hierarchical depth detection
  enableHierarchy: true,
  maxDepth: 3,
  
  // Enhanced metadata extraction
  extractMetadata: true,
};

/**
 * remarkKiroTasks plugin factory
 */
function remarkKiroTasks(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  return (tree, file) => {
    const tasks = [];
    const hierarchyStack = [];
    const errors = [];
    
    // Use a custom traversal to track depth properly
    traverseWithDepth(tree, 0, (node, depth, parent) => {
      if (node.type === 'listItem') {
        try {
          const taskInfo = analyzeTaskNode(node, config);
          
          if (taskInfo) {
            // Validate task data before processing
            const validationError = validateTaskInfo(taskInfo, depth, config);
            if (validationError) {
              errors.push({
                type: 'validation_error',
                line: taskInfo.lineNumber,
                message: validationError,
                taskText: taskInfo.raw
              });
              return; // Skip invalid tasks
            }
            
            // Create enhanced task object
            const enhancedTask = {
              ...taskInfo,
              depth,
              hierarchy: buildHierarchy(depth, hierarchyStack, taskInfo),
              parent: getParentTask(hierarchyStack, depth),
              children: [],
              metadata: {
                ...taskInfo.metadata,
                listType: parent?.ordered ? 'ordered' : 'unordered',
                listStart: parent?.start || 1,
              }
            };
            
            // Update hierarchy stack
            updateHierarchyStack(hierarchyStack, enhancedTask);
            
            // Attach to parent if exists
            attachToParent(hierarchyStack, enhancedTask);
            
            // Store enhanced task data in node
            node.kiroTask = enhancedTask;
            tasks.push(enhancedTask);
          }
        } catch (error) {
          errors.push({
            type: 'parse_error',
            line: node.position?.start?.line || 0,
            message: error.message,
            taskText: 'Failed to extract text'
          });
        }
      }
    });
    
    // Attach collected tasks and errors to file data
    if (!file.data) file.data = {};
    file.data.kiroTasks = tasks;
    file.data.kiroTaskErrors = errors;
    
    return tree;
  };
}

/**
 * Custom tree traversal that tracks depth properly
 */
function traverseWithDepth(node, currentDepth, callback, parent = null) {
  callback(node, currentDepth, parent);
  
  if (node.children) {
    const nextDepth = node.type === 'list' ? currentDepth + 1 : currentDepth;
    
    for (const child of node.children) {
      traverseWithDepth(child, nextDepth, callback, node);
    }
  }
}

/**
 * Validate task information for common issues
 */
function validateTaskInfo(taskInfo, depth, config) {
  // Check for empty or invalid task numbers
  if (!taskInfo.number || taskInfo.number.toString().trim() === '') {
    return 'Task number is missing or empty';
  }
  
  // Check for empty task title
  if (!taskInfo.title || taskInfo.title.trim() === '') {
    return 'Task title is missing or empty';
  }
  
  // Check depth limits if configured
  if (config.maxDepth && depth > config.maxDepth) {
    return `Task depth (${depth}) exceeds maximum allowed depth (${config.maxDepth})`;
  }
  
  // Check for reasonable task number format
  const numberStr = taskInfo.number.toString();
  if (!/^\d+(\.\d+)*$/.test(numberStr)) {
    return `Invalid task number format: "${numberStr}"`;
  }
  
  return null; // No validation errors
}

/**
 * Analyze a list item node to extract task information
 */
function analyzeTaskNode(node, config) {
  if (!node.children || node.children.length === 0) {
    return null;
  }
  
  // Check if this is a checkbox item (already parsed by remark-gfm)
  if (node.checked === null || node.checked === undefined) {
    return null; // Not a checkbox item
  }
  
  const firstChild = node.children[0];
  if (firstChild.type !== 'paragraph') {
    return null;
  }
  
  // Extract text content
  const text = extractTextFromNode(firstChild);
  if (!text) return null;
  
  // Extract task number and title from the text (no checkbox detection needed)
  const taskInfo = parseTaskContent(text, config.taskNumberPattern);
  if (!taskInfo) return null;
  
  // Extract metadata from subsequent children and inline text
  const metadata = config.extractMetadata ? 
    extractTaskMetadata(node.children) : {};
  
  return {
    raw: text,
    checkbox: node.checked ? 'x' : ' ',
    completed: node.checked === true,
    number: taskInfo.number,
    title: taskInfo.title,
    lineNumber: node.position?.start?.line || 0,
    metadata: {
      requirements: [],
      dependencies: [],
      tags: [],
      ...metadata
    }
  };
}


/**
 * Parse task content to extract number and title
 */
function parseTaskContent(text, numberPattern) {
  const lines = text.split('\n');
  const firstLine = lines[0].trim();
  
  const match = firstLine.match(numberPattern);
  if (!match) return null;
  
  return {
    number: match[1], // Keep as string to preserve hierarchical format (e.g., "1.1.1")
    title: match[2].trim(),
    hasMultilineContent: lines.length > 1
  };
}

/**
 * Extract text content from an AST node recursively
 */
function extractTextFromNode(node) {
  if (node.type === 'text') {
    return node.value;
  }
  
  if (node.type === 'emphasis' && node.children) {
    // For emphasis nodes, extract the text and treat as potential metadata
    const emphasisText = node.children
      .map(child => extractTextFromNode(child))
      .join('');
    return `_${emphasisText}_`; // Restore the underscore format
  }
  
  if (node.children) {
    return node.children
      .map(child => extractTextFromNode(child))
      .join('');
  }
  
  return '';
}

/**
 * Extract metadata from task description nodes
 */
function extractTaskMetadata(descriptionNodes) {
  const metadata = {
    requirements: [],
    dependencies: [],
    tags: [],
    priority: null,
    assignee: null,
    effort: null
  };
  
  for (const node of descriptionNodes) {
    if (node.type === 'paragraph') {
      const text = extractTextFromNode(node);
      parseMetadataLine(text, metadata);
    }
  }
  
  return metadata;
}

/**
 * Parse metadata from a text line using Kiro patterns
 */
function parseMetadataLine(line, metadata) {
  const trimmed = line.trim();
  
  // Requirements pattern: _Requirements: FR1, FR2_
  if (trimmed.includes('_Requirements:')) {
    const match = trimmed.match(/_Requirements:\s*([^_]+)_/);
    if (match?.[1]) {
      metadata.requirements = match[1]
        .split(',')
        .map(r => r.trim())
        .filter(r => r);
    }
  }
  
  // Dependencies pattern: _Dependencies: #1, #2_
  if (trimmed.includes('_Dependencies:')) {
    const match = trimmed.match(/_Dependencies:\s*([^_]+)_/);
    if (match?.[1]) {
      metadata.dependencies = match[1]
        .split(',')
        .map(d => d.trim())
        .filter(d => d);
    }
  }
  
  // Priority pattern: _Priority: high_
  if (trimmed.includes('_Priority:')) {
    const match = trimmed.match(/_Priority:\s*([^_]+)_/);
    if (match?.[1]) {
      metadata.priority = match[1].trim();
    }
  }
  
  // Effort pattern: _Effort: 4 hours_
  if (trimmed.includes('_Effort:')) {
    const match = trimmed.match(/_Effort:\s*([^_]+)_/);
    if (match?.[1]) {
      metadata.effort = match[1].trim();
    }
  }
  
  // Assignee pattern: _Assignee: username_
  if (trimmed.includes('_Assignee:')) {
    const match = trimmed.match(/_Assignee:\s*([^_]+)_/);
    if (match?.[1]) {
      metadata.assignee = match[1].trim();
    }
  }
  
  // Tags pattern: _Tags: tag1, tag2_
  if (trimmed.includes('_Tags:')) {
    const match = trimmed.match(/_Tags:\s*([^_]+)_/);
    if (match?.[1]) {
      metadata.tags = match[1]
        .split(',')
        .map(t => t.trim())
        .filter(t => t);
    }
  }
}


/**
 * Build hierarchy path for a task
 */
function buildHierarchy(depth, hierarchyStack, _taskInfo) {
  const hierarchy = [];
  
  for (let i = 0; i < Math.min(depth, hierarchyStack.length); i++) {
    if (hierarchyStack[i]) {
      hierarchy.push({
        number: hierarchyStack[i].number,
        title: hierarchyStack[i].title,
        depth: hierarchyStack[i].depth
      });
    }
  }
  
  return hierarchy;
}

/**
 * Get the parent task at the appropriate level
 */
function getParentTask(hierarchyStack, depth) {
  if (depth > 0 && hierarchyStack[depth - 1]) {
    return {
      number: hierarchyStack[depth - 1].number,
      title: hierarchyStack[depth - 1].title
    };
  }
  return null;
}

/**
 * Update the hierarchy stack with the current task
 */
function updateHierarchyStack(hierarchyStack, task) {
  const depth = task.depth;
  
  // Trim stack to current depth
  hierarchyStack.length = depth;
  
  // Add current task at its depth
  hierarchyStack[depth] = task;
}

/**
 * Attach current task to its parent in the hierarchy
 */
function attachToParent(hierarchyStack, task) {
  const depth = task.depth;
  
  if (depth > 0 && hierarchyStack[depth - 1]) {
    const parent = hierarchyStack[depth - 1];
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push({
      number: task.number,
      title: task.title,
      completed: task.completed
    });
  }
}

export { remarkKiroTasks };
export default remarkKiroTasks;