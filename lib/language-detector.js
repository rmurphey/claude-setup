import fs from 'fs-extra';
import path from 'path';

/**
 * Smart language detection with best-guess verification approach
 * Scans project files and makes educated guesses for user confirmation
 */
export class LanguageDetector {
  constructor() {
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
  async detectLanguages() {
    const detections = [];

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
  async gatherEvidence(pattern) {
    const evidence = {
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
   * Find source files with given extensions
   */
  async findSourceFiles(extensions) {
    const found = {
      extensions: [],
      count: 0
    };

    try {
      const entries = await fs.readdir('.', { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip node_modules, .git, etc.
        if (entry.isDirectory() && this.shouldSkipDirectory(entry.name)) {
          continue;
        }

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

      // Also check common source directories
      const srcDirs = ['src', 'lib', 'app', 'components', 'pages'];
      for (const dir of srcDirs) {
        if (await fs.pathExists(dir)) {
          const dirCount = await this.countFilesInDirectory(dir, extensions);
          found.count += dirCount;
        }
      }
    } catch (error) {
      // Ignore errors, just return what we found
    }

    return found;
  }

  /**
   * Count files with given extensions in a directory
   */
  async countFilesInDirectory(dirPath, extensions, maxDepth = 2) {
    if (maxDepth <= 0) return 0;

    let count = 0;
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
          count += await this.countFilesInDirectory(
            path.join(dirPath, entry.name), 
            extensions, 
            maxDepth - 1
          );
        } else if (entry.isFile()) {
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
  shouldSkipDirectory(name) {
    const skipDirs = [
      'node_modules', '.git', '.svn', '.hg',
      'vendor', 'target', 'build', 'dist',
      '__pycache__', '.pytest_cache', '.venv',
      '.idea', '.vscode', '.vs'
    ];
    return skipDirs.includes(name) || name.startsWith('.');
  }

  /**
   * Get the best guess for language detection
   * Returns null if no clear detection, single language if confident,
   * or array if multiple strong candidates
   */
  async getBestGuess() {
    const detections = await this.detectLanguages();
    
    if (detections.length === 0) {
      return null; // No detection
    }

    // If top detection has significantly higher score than others, return it
    const top = detections[0];
    const second = detections[1];
    
    if (!second || top.score >= second.score * 1.5) {
      return {
        type: 'single',
        language: top.language,
        name: top.name,
        confidence: top.score >= 10 ? 'high' : 'medium',
        evidence: top.evidence
      };
    }

    // Multiple strong candidates
    return {
      type: 'multiple',
      candidates: detections.slice(0, 3).map(d => ({
        language: d.language,
        name: d.name,
        score: d.score,
        evidence: d.evidence
      }))
    };
  }

  /**
   * Format evidence for display to user
   */
  formatEvidence(evidence) {
    const parts = [];
    
    if (evidence.foundFiles.length > 0) {
      parts.push(`config files: ${evidence.foundFiles.join(', ')}`);
    }
    
    if (evidence.foundExtensions.length > 0) {
      parts.push(`${evidence.fileCount} source files (${evidence.foundExtensions.join(', ')})`);
    }
    
    return parts.join(', ') || 'detected';
  }
}