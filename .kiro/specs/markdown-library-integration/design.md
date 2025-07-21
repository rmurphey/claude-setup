# Markdown Library Integration - Design Document

## Architecture Overview

### Current State Analysis

The existing `kiro-spec-scanner.ts` implementation:
```typescript
// Current fragile approach
const taskMatch = line.match(/^- \[([ x])\] (\d+)\. (.+)$/);
if (taskMatch) {
  // Manual parsing logic
}
```

**Problems:**
- Regex brittleness
- No structural understanding
- Manual metadata extraction
- Difficult error handling

### Target Architecture

```typescript
// New AST-based approach
class MarkdownSpecScanner {
  private processor: unified.Processor;
  private validator: SpecValidator;
  private metadataExtractor: MetadataExtractor;
}
```

## Library Selection: Remark

**Chosen Solution:** `remark` from the unified ecosystem

**Rationale:**
- AST-based processing (not just HTML conversion)
- Extensive plugin ecosystem
- TypeScript support with proper types
- Active maintenance and community
- Designed for programmatic markdown processing

**Alternative Considered:**
- `marked`: Good but primarily HTML-focused
- `markdown-it`: Excellent but more complex plugin API

## Core Design Components

### 1. Unified Processing Pipeline

```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { remarkKiroTasks } from './plugins/remark-kiro-tasks';
import { remarkKiroMetadata } from './plugins/remark-kiro-metadata';

class MarkdownSpecScanner {
  private processor = unified()
    .use(remarkParse)           // Parse markdown to AST
    .use(remarkGfm)             // GitHub Flavored Markdown
    .use(remarkKiroTasks)       // Custom task parsing
    .use(remarkKiroMetadata);   // Custom metadata extraction
}
```

### 2. Custom Plugin Architecture

#### Task Detection Plugin
```typescript
// plugins/remark-kiro-tasks.ts
export function remarkKiroTasks(): Plugin {
  return (tree: Root) => {
    visit(tree, 'list', (node: List, index, parent) => {
      // Enhanced task detection with full context
      const tasks = extractTasksFromList(node);
      // Attach parsed tasks to AST node
      (node as any).kiroTasks = tasks;
    });
  };
}
```

#### Metadata Extraction Plugin
```typescript
// plugins/remark-kiro-metadata.ts
export function remarkKiroMetadata(): Plugin {
  return (tree: Root) => {
    // Extract YAML frontmatter
    visit(tree, 'yaml', processYamlFrontmatter);
    
    // Extract HTML comments with metadata
    visit(tree, 'html', processMetadataComments);
    
    // Extract inline metadata patterns
    visit(tree, 'text', processInlineMetadata);
  };
}
```

### 3. Enhanced Data Structures

```typescript
interface SpecAST extends Root {
  kiroMetadata?: {
    title: string;
    version: string;
    lastModified: Date;
    phases: PhaseMetadata[];
  };
  kiroSections?: {
    requirements?: Section;
    phases?: Section[];
    tasks?: Section[];
  };
}

interface KiroTaskNode extends ListItem {
  kiroTask?: {
    id: string;
    number: number;
    title: string;
    completed: boolean;
    metadata: TaskMetadata;
    dependencies: string[];
    children: KiroTaskNode[];
  };
}
```

### 4. Validation Engine

```typescript
class SpecValidator {
  validateStructure(ast: SpecAST): ValidationResult {
    return {
      isValid: boolean;
      errors: ValidationError[];
      warnings: ValidationWarning[];
    };
  }
  
  validateTasks(tasks: KiroTask[]): TaskValidationResult {
    // Check numbering sequence
    // Validate dependencies
    // Verify required metadata
  }
}
```

## Implementation Strategy

### Phase 1: Foundation (Week 1-2)

**Goals:**
- Integrate remark library
- Implement basic AST parsing
- Maintain API compatibility

**Tasks:**
1. Add remark dependencies to package.json
2. Create new `MarkdownSpecScanner` class
3. Implement basic spec file parsing
4. Ensure all existing tests pass
5. Performance benchmarking

**Risk Mitigation:**
- Keep old implementation as fallback
- Comprehensive test coverage
- Performance monitoring

### Phase 2: Enhanced Parsing (Week 3-4)

**Goals:**
- Custom task detection
- Metadata extraction
- Improved error handling

**Tasks:**
1. Develop `remarkKiroTasks` plugin
2. Implement metadata extraction patterns
3. Add structured error reporting
4. Update test suite with new capabilities
5. Documentation updates

### Phase 3: Advanced Features (Week 5-6)

**Goals:**
- Validation capabilities
- Rich querying
- Plugin architecture

**Tasks:**
1. Implement spec validation engine
2. Add semantic querying methods
3. Create plugin system for extensions
4. Migration utilities for legacy specs
5. Performance optimization

## Detailed Component Design

### Task Detection Enhancement

**Current Limitation:**
```typescript
// Only handles basic pattern
/^- \[([ x])\] (\d+)\. (.+)$/
```

**New Approach:**
```typescript
function extractTasksFromList(listNode: List): KiroTask[] {
  const tasks: KiroTask[] = [];
  
  visit(listNode, 'listItem', (item: ListItem) => {
    const checkbox = findCheckbox(item);
    const taskNumber = extractTaskNumber(item);
    const title = extractTitle(item);
    const metadata = extractMetadata(item);
    const subtasks = extractSubtasks(item);
    
    if (taskNumber && title) {
      tasks.push({
        id: generateTaskId(taskNumber),
        number: taskNumber,
        title,
        completed: checkbox?.checked || false,
        metadata,
        subtasks,
        lineNumber: getLineNumber(item)
      });
    }
  });
  
  return tasks;
}
```

### Metadata Pattern Support

**Enhanced Syntax Support:**
```markdown
## Phase 1: Setup
<!-- kiro:phase priority=high assignee=@dev -->

- [x] 1. Initialize project
  _Requirements: Node.js 18+, Git_
  _Effort: 2 hours_
  _Dependencies: #setup-environment_
  _Tags: setup, infrastructure_
  
- [ ] 2. Configure linting
  <!-- kiro:task priority=medium blocked-by=#1 -->
  _Assignee: @developer_
  _Estimated: 1 hour_
```

**Extraction Logic:**
```typescript
function extractMetadata(node: ListItem): TaskMetadata {
  const metadata: TaskMetadata = {
    requirements: [],
    dependencies: [],
    tags: [],
    priority: 'medium'
  };
  
  // Extract from HTML comments
  visit(node, 'html', (htmlNode) => {
    const commentMatch = htmlNode.value.match(/<!-- kiro:task (.+) -->/);
    if (commentMatch) {
      parseKiroAttributes(commentMatch[1], metadata);
    }
  });
  
  // Extract from text patterns
  visit(node, 'text', (textNode) => {
    const patterns = [
      /_Requirements:\s*([^_]+)_/,
      /_Dependencies:\s*([^_]+)_/,
      /_Priority:\s*([^_]+)_/,
      /_Tags:\s*([^_]+)_/
    ];
    
    patterns.forEach(pattern => {
      const match = textNode.value.match(pattern);
      if (match) {
        applyMetadataMatch(pattern, match[1], metadata);
      }
    });
  });
  
  return metadata;
}
```


## Migration Strategy

### Backward Compatibility

**API Preservation:**
```typescript
// Existing API must continue to work
class KiroSpecScanner {
  // Keep existing methods
  async scanSpec(specPath: string): Promise<SpecScanResult> {
    // New implementation using remark
    return this.markdownScanner.scan(specPath);
  }
  
  // Enhanced methods (optional)
  async scanSpecEnhanced(specPath: string): Promise<EnhancedSpecResult> {
    // New capabilities
  }
}
```

**Gradual Rollout:**
1. **Week 1-2**: Parallel implementation, feature flag controlled
2. **Week 3-4**: Default to new implementation, fallback available
3. **Week 5-6**: Remove old implementation, update documentation

### Testing Strategy

**Test Categories:**

1. **Compatibility Tests**: Ensure all existing specs parse correctly
2. **Performance Tests**: Benchmark against current implementation
3. **Feature Tests**: Validate new capabilities work as designed
4. **Edge Case Tests**: Handle malformed markdown gracefully

**Test Data:**
- All existing specs in `.kiro/specs/`
- Synthetic test cases for edge conditions
- Performance test with large spec files
- Malformed markdown test cases

## Performance Considerations

### Optimization Strategies

1. **Incremental Parsing**: Only re-parse changed sections
2. **Caching**: Cache AST for unchanged files
3. **Lazy Loading**: Parse sections on demand
4. **Streaming**: Support large files without memory issues

### Benchmarking Plan

```typescript
// Performance test suite
describe('Markdown Parser Performance', () => {
  it('should parse specs faster than current implementation', async () => {
    const largeSpec = generateLargeSpec(1000); // 1000 tasks
    
    const oldTime = await benchmark(() => oldParser.parse(largeSpec));
    const newTime = await benchmark(() => newParser.parse(largeSpec));
    
    expect(newTime).toBeLessThanOrEqual(oldTime * 1.1); // Allow 10% regression
  });
});
```

## Future Extensibility

### Plugin System Design

```typescript
interface KiroPlugin {
  name: string;
  version: string;
  remarkPlugins?: Plugin[];
  validators?: Validator[];
  queryExtensions?: QueryExtension[];
}

class SpecProcessor {
  registerPlugin(plugin: KiroPlugin): void {
    this.processor.use(plugin.remarkPlugins);
    this.validator.addValidators(plugin.validators);
    this.queryEngine.addExtensions(plugin.queryExtensions);
  }
}
```

### AI Integration Points

```typescript
// Future AI capabilities
interface AIExtensions {
  suggestTaskBreakdown(description: string): Task[];
  estimateEffort(task: Task): EffortEstimate;
  detectAnomalies(spec: Spec): Anomaly[];
  generateProgressReport(spec: Spec): ProgressReport;
}
```

This design provides a robust foundation for markdown parsing while maintaining compatibility and enabling future enhancements.