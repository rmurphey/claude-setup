import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'path';

import fs from 'fs-extra';

import { LanguageDetector } from '../dist/lib/language-detector.js';

describe('Language Configuration', () => {
  const testDir = path.join(process.cwd(), 'test-language-config');
  
  before(async () => {
    await fs.ensureDir(testDir);
    await fs.emptyDir(testDir);
  });

  after(async () => {
    await fs.remove(testDir);
  });

  test('should save and load detection config', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      const detector = new LanguageDetector();
      
      // Create test detection result
      const detection = {
        language: 'js',
        name: 'JavaScript/TypeScript',
        confidence: 'high',
        evidence: {
          foundFiles: ['package.json'],
          foundExtensions: ['.js'],
          fileCount: 5,
          score: 15
        }
      };
      
      const setup = {
        qualityLevel: 'strict',
        teamSize: 'solo',
        cicd: false
      };
      
      // Save config
      const saved = await detector.saveConfig(detection, setup);
      assert(saved, 'Config should be saved successfully');
      
      // Verify file exists
      assert(await fs.pathExists('.claude-setup.json'), 'Config file should exist');
      
      // Load and verify config
      const config = await detector.loadConfig();
      assert.strictEqual(config.language.primary, 'js');
      assert.strictEqual(config.language.name, 'JavaScript/TypeScript');
      assert.strictEqual(config.setup.qualityLevel, 'strict');
      assert.strictEqual(config.setup.teamSize, 'solo');
      
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('should use cached config when fresh', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Create fresh config
      const config = {
        version: '1.0.0',
        language: {
          primary: 'python',
          name: 'Python',
          confidence: 'high',
          detected: new Date().toISOString(),
          evidence: {
            foundFiles: ['requirements.txt'],
            foundExtensions: ['.py'],
            fileCount: 3,
            score: 13
          }
        }
      };
      
      await fs.writeFile('.claude-setup.json', JSON.stringify(config, null, 2));
      
      const detector = new LanguageDetector();
      const detection = await detector.getBestGuess(true);
      
      assert.strictEqual(detection.source, 'config');
      assert.strictEqual(detection.language, 'python');
      assert.strictEqual(detection.name, 'Python');
      
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('should run fresh detection when config is stale', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Create stale config (2 days old)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const staleConfig = {
        version: '1.0.0',
        language: {
          primary: 'go',
          name: 'Go',
          confidence: 'high',
          detected: twoDaysAgo.toISOString(),
          evidence: { foundFiles: ['go.mod'], foundExtensions: ['.go'], fileCount: 2, score: 12 }
        }
      };
      
      await fs.writeFile('.claude-setup.json', JSON.stringify(staleConfig, null, 2));
      
      const detector = new LanguageDetector();
      const detection = await detector.getBestGuess(true);
      
      // Should run fresh detection since config is stale
      assert(detection === null || detection.source === 'detection', 'Should run fresh detection for stale config');
      
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('should skip cache when useCache is false', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Create fresh config
      const config = {
        version: '1.0.0',
        language: {
          primary: 'rust',
          name: 'Rust',
          confidence: 'high',
          detected: new Date().toISOString(),
          evidence: { foundFiles: ['Cargo.toml'], foundExtensions: ['.rs'], fileCount: 4, score: 14 }
        }
      };
      
      await fs.writeFile('.claude-setup.json', JSON.stringify(config, null, 2));
      
      const detector = new LanguageDetector();
      const detection = await detector.getBestGuess(false); // Force fresh detection
      
      // Should run fresh detection even with fresh config
      assert(detection === null || detection.source === 'detection', 'Should run fresh detection when useCache=false');
      
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('should handle config file errors gracefully', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Create invalid JSON config
      await fs.writeFile('.claude-setup.json', '{ invalid json }');
      
      const detector = new LanguageDetector();
      const config = await detector.loadConfig();
      
      // Should return empty config on parse error
      assert.deepStrictEqual(config, {});
      
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('should check config freshness correctly', async () => {
    const detector = new LanguageDetector();
    
    // Fresh config (1 hour ago)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const freshConfig = {
      language: {
        detected: oneHourAgo.toISOString()
      }
    };
    
    assert(detector.isConfigFresh(freshConfig), 'Config from 1 hour ago should be fresh');
    
    // Stale config (25 hours ago)
    const twentyFiveHoursAgo = new Date();
    twentyFiveHoursAgo.setHours(twentyFiveHoursAgo.getHours() - 25);
    
    const staleConfig = {
      language: {
        detected: twentyFiveHoursAgo.toISOString()
      }
    };
    
    assert(!detector.isConfigFresh(staleConfig), 'Config from 25 hours ago should be stale');
    
    // Invalid config
    assert(!detector.isConfigFresh({}), 'Empty config should not be fresh');
    assert(!detector.isConfigFresh({ language: {} }), 'Config without detected time should not be fresh');
  });

  test('should auto-save detection results', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Clean directory
      await fs.emptyDir('.');
      
      // Create a package.json to trigger JS detection
      await fs.writeFile('package.json', '{"name": "test"}');
      await fs.writeFile('test.js', 'console.log("test");');
      
      const detector = new LanguageDetector();
      const detection = await detector.getBestGuess(false);
      
      if (detection && detection.type === 'single') {
        // Should auto-save detection
        assert(await fs.pathExists('.claude-setup.json'), 'Config should be auto-saved');
        
        const config = await detector.loadConfig();
        assert.strictEqual(config.language.primary, detection.language);
      }
      
    } finally {
      process.chdir(originalCwd);
    }
  });
});