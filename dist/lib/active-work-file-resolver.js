import fs from 'fs-extra';
import { generateActiveWorkTemplate } from './cli/setup.js';
/**
 * ActiveWorkFileResolver - Handles finding existing ACTIVE_WORK.md files or creating new ones
 *
 * This class implements a simple file resolution strategy:
 * 1. Check for internal/ACTIVE_WORK.md first (preferred location)
 * 2. Check for ACTIVE_WORK.md in root as fallback
 * 3. Create new file if neither exists, preferring internal/ if directory exists
 */
export class ActiveWorkFileResolver {
    searchPaths = [
        'internal/ACTIVE_WORK.md', // Preferred location
        'ACTIVE_WORK.md' // Fallback location
    ];
    /**
     * Find existing ACTIVE_WORK.md file in search paths
     * @returns Path to existing file or null if none found
     */
    async findExistingFile() {
        for (const filePath of this.searchPaths) {
            if (await fs.pathExists(filePath)) {
                console.log(`📄 Using existing ACTIVE_WORK.md at ${filePath}`);
                return filePath;
            }
        }
        return null;
    }
    /**
     * Create new ACTIVE_WORK.md file using existing template generation
     * @returns Path to created file
     */
    async createActiveWorkFile() {
        const preferredPath = this.getPreferredPath();
        // Create default config for template generation
        const defaultConfig = {
            projectType: 'js', // Default to JavaScript
            qualityLevel: 'standard',
            teamSize: 'solo',
            cicd: false
        };
        // Generate template content
        const templateContent = generateActiveWorkTemplate(defaultConfig);
        // Ensure directory exists if creating in internal/
        if (preferredPath.includes('internal/')) {
            await fs.ensureDir('internal');
        }
        // Write the file
        await fs.writeFile(preferredPath, templateContent);
        console.log(`✅ Created ACTIVE_WORK.md at ${preferredPath}`);
        return preferredPath;
    }
    /**
     * Get preferred path for creating new ACTIVE_WORK.md file
     * @returns Preferred file path based on project structure
     */
    getPreferredPath() {
        // Check if internal/ directory exists or if we should create it
        if (fs.pathExistsSync('internal') || fs.pathExistsSync('.kiro')) {
            return 'internal/ACTIVE_WORK.md';
        }
        return 'ACTIVE_WORK.md';
    }
    /**
     * Resolve ACTIVE_WORK.md file path - find existing or create new
     * This is the main public method that handles the complete resolution logic
     * @returns Path to ACTIVE_WORK.md file (existing or newly created)
     */
    async resolveActiveWorkFile() {
        // First try to find existing file
        const existingFile = await this.findExistingFile();
        if (existingFile) {
            return existingFile;
        }
        // No existing file found, create new one
        return await this.createActiveWorkFile();
    }
}
//# sourceMappingURL=active-work-file-resolver.js.map