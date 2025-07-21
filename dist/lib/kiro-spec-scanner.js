/**
 * Kiro Spec File Scanner
 *
 * Discovers and parses .kiro/specs directory structure to extract tasks,
 * requirements, and other project metadata.
 */
import path from 'path';
import fs from 'fs-extra';
import { MarkdownSpecScanner } from '../../.kiro/lib/markdown-spec-scanner.js';
export class KiroSpecScanner {
    baseDir;
    specsDir;
    markdownScanner;
    constructor(baseDir = process.cwd()) {
        this.baseDir = baseDir;
        this.specsDir = path.join(baseDir, '.kiro', 'specs');
        this.markdownScanner = new MarkdownSpecScanner();
    }
    /**
     * Scan all specs and return comprehensive results
     */
    async scanAllSpecs() {
        const result = {
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
                }
                catch (error) {
                    result.errors.push({
                        type: 'parse_error',
                        filePath: path.join(this.specsDir, specName),
                        message: error instanceof Error ? error.message : 'Unknown error scanning spec'
                    });
                }
            }
        }
        catch (error) {
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
    async discoverSpecDirectories() {
        try {
            const entries = await fs.readdir(this.specsDir, { withFileTypes: true });
            return entries
                .filter(entry => entry.isDirectory())
                .map(entry => entry.name)
                .sort();
        }
        catch (error) {
            throw new Error(`Failed to read specs directory: ${error instanceof Error ? error.message : error}`);
        }
    }
    /**
     * Scan a specific spec directory for metadata
     */
    async scanSpecDirectory(specName) {
        const specDir = path.join(this.specsDir, specName);
        const metadata = {
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
    async extractTitleFromRequirements(filePath) {
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
        }
        catch {
            return path.basename(path.dirname(filePath));
        }
    }
    /**
     * Extract all tasks from a spec directory
     */
    async extractTasksFromSpec(specName) {
        const tasksFile = path.join(this.specsDir, specName, 'tasks.md');
        if (!await fs.pathExists(tasksFile)) {
            return [];
        }
        const parsedTasks = await this.parseTasksFile(tasksFile);
        return parsedTasks.map(parsed => this.convertToKiroTask(parsed, specName));
    }
    /**
     * Parse tasks.md file and extract task items using AST-based parsing
     */
    async parseTasksFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            // Use the new markdown scanner for AST-based parsing
            const ast = await this.markdownScanner.parseFile(content);
            const astTasks = this.markdownScanner.extractTasks(ast);
            // Convert AST tasks to ParsedTaskItem format for backward compatibility
            return astTasks.map(task => this.convertAstTaskToParseTask(task));
        }
        catch (error) {
            throw new Error(`Failed to parse tasks file ${filePath}: ${error instanceof Error ? error.message : error}`);
        }
    }
    /**
     * Convert AST task to ParsedTaskItem format for backward compatibility
     */
    convertAstTaskToParseTask(astTask) {
        return {
            raw: astTask.raw,
            number: astTask.number,
            title: astTask.title,
            description: astTask.description || [],
            completed: astTask.completed,
            lineNumber: astTask.lineNumber,
            metadata: {
                requirements: astTask.metadata?.requirements || [],
                dependencies: astTask.metadata?.dependencies || [],
                tags: astTask.metadata?.tags || [],
                ...(astTask.metadata?.priority && { priority: astTask.metadata.priority }),
                ...(astTask.metadata?.assignee && { assignee: astTask.metadata.assignee })
            }
        };
    }
    /**
     * Convert parsed task item to KiroTask
     */
    convertToKiroTask(parsed, specName) {
        const now = new Date();
        // Generate task ID
        const taskId = `${specName}-${parsed.number}`;
        // Determine priority
        const priority = this.normalizePriority(parsed.metadata.priority);
        // Determine category based on task content
        const category = this.categorizeTask(parsed.title, parsed.description);
        // Create task metadata
        const metadata = {
            requirementRefs: parsed.metadata.requirements,
            crossSpecDeps: parsed.metadata.dependencies.filter(dep => dep.includes('-')),
            originalTaskNumber: parsed.number,
            tags: parsed.metadata.tags
        };
        const task = {
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
    normalizePriority(priority) {
        if (!priority)
            return 'medium';
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
    categorizeTask(title, description) {
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
    estimateEffort(description) {
        const totalLines = description.length;
        const totalChars = description.join('').length;
        // Simple heuristic based on description length
        if (totalLines <= 1 && totalChars < 50)
            return 'xs';
        if (totalLines <= 2 && totalChars < 150)
            return 's';
        if (totalLines <= 4 && totalChars < 300)
            return 'm';
        if (totalLines <= 6 && totalChars < 500)
            return 'l';
        return 'xl';
    }
}
export default KiroSpecScanner;
//# sourceMappingURL=kiro-spec-scanner.js.map