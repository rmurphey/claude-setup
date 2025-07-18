import path from 'path';
import fs from 'fs-extra';

export interface DetectionPattern {
  language: string;
  name: string;
  files: string[];
  extensions: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface Evidence {
  foundFiles: string[];
  foundExtensions: string[];
  fileCount: number;
  score: number;
}

export interface DetectionResult extends DetectionPattern {
  evidence: Evidence;
  score: number;
}

export interface LanguageConfig {
  primary: string;
  name: string;
  confidence: string;
  detected: string;
  evidence: Evidence;
}

export interface DetectionConfig {
  skipDirectories: string[];
  maxDepth: number;
  maxFiles: number;
  timeout: number;
}

export interface SetupConfig {
  qualityLevel: string | null;
  teamSize: string | null;
  cicd: boolean;
  lastSetup: string | null;
}

export interface ProjectConfig {
  version: string;
  language: LanguageConfig;
  detection: DetectionConfig;
  setup: SetupConfig;
}

export interface SingleDetectionGuess {
  type: 'single';
  language: string;
  name: string;
  confidence: string;
  evidence: Evidence;
  source: 'config' | 'detection';
}

export interface MultipleDetectionGuess {
  type: 'multiple';
  candidates: Array<{
    language: string;
    name: string;
    score: number;
    evidence: Evidence;
  }>;
  source: 'detection';
}

export type DetectionGuess = SingleDetectionGuess | MultipleDetectionGuess | null;

export interface SourceFileResult {
  extensions: string[];
  count: number;
}

/**
 * Smart language detection with best-guess verification approach
 * Scans project files and makes educated guesses for user confirmation
 * Can use config file for cached detection results
 */
export class LanguageDetector {
  private configPath: string;
  private config: ProjectConfig | null = null;
  private detectionPatterns: DetectionPattern[];

  constructor(configPath: string = '.claude-setup.json') {
    this.configPath = configPath;
    // Detection patterns ordered by specificity
    this.detectionPatterns = [
      {
        language: 'js',
        name: 'JavaScript/TypeScript',
        files: ['package.json', 'package-lock.json', 'yarn.lock', 'tsconfig.json'],
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.mjs'],
        confidence: 'high'
      },
      {
        language: 'python',
        name: 'Python',
        files: ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile', 'environment.yml'],
        extensions: ['.py', '.pyx', '.pyi'],
        confidence: 'high'
      },
      {
        language: 'go',
        name: 'Go',
        files: ['go.mod', 'go.sum', 'Gopkg.toml'],
        extensions: ['.go'],
        confidence: 'high'
      },
      {
        language: 'rust',
        name: 'Rust',
        files: ['Cargo.toml', 'Cargo.lock'],
        extensions: ['.rs'],
        confidence: 'high'
      },
      {
        language: 'java',
        name: 'Java',
        files: ['pom.xml', 'build.gradle', 'build.gradle.kts', 'gradle.properties'],
        extensions: ['.java', '.kt', '.scala'],
        confidence: 'high'
      },
      {
        language: 'swift',
        name: 'Swift',
        files: ['Package.swift', 'Package.resolved', 'project.pbxproj'],
        extensions: ['.swift'],
        confidence: 'high'
      }
    ];
  }

  /**
   * Detect languages in current directory
   * Returns array of detected languages with confidence scores
   */
  async detectLanguages(): Promise<DetectionResult[]> {
    const detections: DetectionResult[] = [];

    for (const pattern of this.detectionPatterns) {
      const evidence = await this.gatherEvidence(pattern);
      if (evidence.score > 0) {
        detections.push({
          ...pattern,
          evidence,
          score: evidence.score
        });
      }
    }

    // Sort by confidence score (highest first)
    return detections.sort((a, b) => b.score - a.score);
  }

  /**
   * Gather evidence for a specific language pattern
   */
  async gatherEvidence(pattern: DetectionPattern): Promise<Evidence> {
    const evidence: Evidence = {
      foundFiles: [],
      foundExtensions: [],
      fileCount: 0,
      score: 0
    };

    // Check for specific configuration files (high weight)
    for (const file of pattern.files) {
      if (await fs.pathExists(file)) {
        evidence.foundFiles.push(file);
        evidence.score += 10; // High weight for config files
      }
    }

    // Check for source files with matching extensions (medium weight)
    const sourceFiles = await this.findSourceFiles(pattern.extensions);
    evidence.foundExtensions = sourceFiles.extensions;
    evidence.fileCount = sourceFiles.count;
    evidence.score += Math.min(sourceFiles.count * 2, 10); // Cap at 10 points

    return evidence;
  }

  /**
   * Find source files with given extensions (optimized for speed)
   */
  async findSourceFiles(extensions: string[]): Promise<SourceFileResult> {
    const found: SourceFileResult = {
      extensions: [],
      count: 0
    };

    try {
      // Only check root directory and one level of common source dirs
      const rootEntries = await fs.readdir('.', { withFileTypes: true });
      
      for (const entry of rootEntries) {
        if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            if (!found.extensions.includes(ext)) {
              found.extensions.push(ext);
            }
            found.count++;
          }
        }
      }

      // Quick check of common source directories (max 10 files per dir)
      const srcDirs = ['src', 'lib'];
      for (const dir of srcDirs) {
        if (await fs.pathExists(dir)) {
          const dirCount = await this.countFilesInDirectory(dir, extensions, 1, 10);
          found.count += dirCount;
        }
      }
    } catch (error) {
      // Ignore errors, just return what we found
    }

    return found;
  }

  /**
   * Count files with given extensions in a directory (optimized)
   */
  async countFilesInDirectory(
    dirPath: string, 
    extensions: string[], 
    maxDepth: number = 1, 
    maxFiles: number = 10
  ): Promise<number> {
    if (maxDepth <= 0) return 0;

    let count = 0;
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (count >= maxFiles) break; // Early exit for performance
        
        if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            count++;
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return count;
  }

  /**
   * Directories to skip during detection
   */
  shouldSkipDirectory(name: string): boolean {
    const skipDirs = [
      'node_modules', '.git', '.svn', '.hg',
      'vendor', 'target', 'build', 'dist',
      '__pycache__', '.pytest_cache', '.venv',
      '.idea', '.vscode', '.vs'
    ];
    return skipDirs.includes(name) || name.startsWith('.');
  }

  /**
   * Load config file if it exists
   */
  async loadConfig(): Promise<ProjectConfig> {
    if (this.config !== null) return this.config;
    
    try {
      if (await fs.pathExists(this.configPath)) {
        const configContent = await fs.readFile(this.configPath, 'utf8');
        this.config = JSON.parse(configContent) as ProjectConfig;
        return this.config;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Warning: Could not load config from ${this.configPath}:`, errorMessage);
    }
    
    this.config = {} as ProjectConfig;
    return this.config;
  }

  /**
   * Save config file with detection results
   */
  async saveConfig(detection: SingleDetectionGuess, setup: Partial<SetupConfig> = {}): Promise<boolean> {
    const config: ProjectConfig = {
      version: '1.0.0',
      language: {
        primary: detection.language,
        name: detection.name,
        confidence: detection.confidence,
        detected: new Date().toISOString(),
        evidence: detection.evidence
      },
      detection: {
        skipDirectories: [
          'node_modules', '.git', 'dist', 'build', 
          '__pycache__', '.pytest_cache', 'target',
          '.idea', '.vscode', '.vs'
        ],
        maxDepth: 1,
        maxFiles: 10,
        timeout: 5000
      },
      setup: {
        qualityLevel: setup.qualityLevel || null,
        teamSize: setup.teamSize || null,
        cicd: setup.cicd || false,
        lastSetup: setup.lastSetup || null
      }
    };

    try {
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
      this.config = config;
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Warning: Could not save config to ${this.configPath}:`, errorMessage);
      return false;
    }
  }

  /**
   * Get the best guess for language detection
   * Uses cached config if available and fresh, otherwise runs detection
   */
  async getBestGuess(useCache: boolean = true): Promise<DetectionGuess> {
    // Try to use cached config first
    if (useCache) {
      const config = await this.loadConfig();
      if (config.language && this.isConfigFresh(config)) {
        return {
          type: 'single',
          language: config.language.primary,
          name: config.language.name,
          confidence: config.language.confidence,
          evidence: config.language.evidence,
          source: 'config'
        };
      }
    }

    // Run fresh detection
    const detections = await this.detectLanguages();
    
    if (detections.length === 0) {
      return null; // No detection
    }

    // If top detection has significantly higher score than others, return it
    const top = detections[0];
    const second = detections[1];
    
    if (top && (!second || top.score >= second.score * 1.5)) {
      const result: SingleDetectionGuess = {
        type: 'single',
        language: top.language,
        name: top.name,
        confidence: top.score >= 10 ? 'high' : 'medium',
        evidence: top.evidence,
        source: 'detection'
      };
      
      // Auto-save detection result to config
      await this.saveConfig(result);
      
      return result;
    }

    // Multiple strong candidates
    return {
      type: 'multiple',
      candidates: detections.slice(0, 3).map(d => ({
        language: d.language,
        name: d.name,
        score: d.score,
        evidence: d.evidence
      })),
      source: 'detection'
    };
  }

  /**
   * Check if config is fresh (less than 24 hours old)
   */
  isConfigFresh(config: ProjectConfig): boolean {
    if (!config.language || !config.language.detected) return false;
    
    const detectedTime = new Date(config.language.detected);
    const now = new Date();
    const hoursSinceDetection = (now.getTime() - detectedTime.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceDetection < 24;
  }

  /**
   * Format evidence for display to user
   */
  formatEvidence(evidence: Evidence): string {
    const parts: string[] = [];
    
    if (evidence.foundFiles.length > 0) {
      parts.push(`config files: ${evidence.foundFiles.join(', ')}`);
    }
    
    if (evidence.foundExtensions.length > 0) {
      parts.push(`${evidence.fileCount} source files (${evidence.foundExtensions.join(', ')})`);
    }
    
    return parts.join(', ') || 'detected';
  }
}