/**
 * Remark configuration for markdown linting
 * Ensures consistent markdown formatting and prevents display issues
 */

module.exports = {
  plugins: [
    // Core presets for consistency and recommended rules
    'remark-preset-lint-recommended',
    'remark-preset-lint-consistent',
    
    // Disable final newline check
    ['remark-lint-final-newline', false],
    
    // Validate internal links exist - but skip commit links
    ['remark-validate-links', false], // Disable for now since commit links cause too many false positives
    
    // Custom rule configurations - set to warnings for gradual adoption
    ['remark-lint-list-item-indent', false], // Disable for now, too many existing violations
    ['remark-lint-heading-style', false], // Disable for now, mixed styles in existing docs
    ['remark-lint-code-block-style', 'fenced'],
    ['remark-lint-maximum-line-length', false], // Disable line length for code blocks
    ['remark-lint-no-duplicate-headings', false], // Duplicate headings are often intentional in docs
    ['remark-lint-no-empty-url', true],
    ['remark-lint-no-reference-like-url', true],
    
    // Table formatting
    ['remark-lint-table-cell-padding', false], // Disable for now
    ['remark-lint-table-pipes', true],
    
    // Link and reference validation - critical for preventing broken links
    ['remark-lint-no-undefined-references', false], // Too many false positives
    ['remark-lint-no-unused-definitions', 'warn'],
    
    // Code block validation - important for display
    ['remark-lint-fenced-code-flag', {
      allowEmpty: true // Allow empty for now
    }],
    
    // List formatting - disable for existing files
    ['remark-lint-ordered-list-marker-style', false],
    ['remark-lint-unordered-list-marker-style', false],
    
    // Emphasis markers - disable for existing files
    ['remark-lint-emphasis-marker', false],
    ['remark-lint-strong-marker', false]
  ],
  
  // Settings for remark processing
  settings: {
    bullet: '-',
    emphasis: '*',
    strong: '*', // Use single asterisk for compatibility
    listItemIndent: 'one',
    fences: true,
    rule: '-'
  }
};