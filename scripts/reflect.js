#!/usr/bin/env node

/**
 * Reflection prompts for better decision making
 */

const mode = process.argv[2] || 'quick';

const prompts = {
  quick: {
    title: '🤔 Quick Checkpoint',
    questions: [
      'What problem am I solving?',
      'Is this the simplest solution?',
      'What assumptions am I making?'
    ]
  },
  decision: {
    title: '🎯 Decision Point',
    questions: [
      'What are ALL the options?',
      'What are the trade-offs?',
      'Am I solving the right problem?'
    ]
  },
  pattern: {
    title: '🔄 Pattern Check',
    questions: [
      'What keeps happening?',
      'What works consistently?',
      'Should this become a rule?'
    ]
  },
  assumption: {
    title: '❓ Assumption Check',
    questions: [
      'What am I assuming?',
      'What if the opposite were true?',
      'What evidence do I have?'
    ]
  }
};

const prompt = prompts[mode] || prompts.quick;

console.log(prompt.title);
console.log('='.repeat(prompt.title.length));
console.log('');
prompt.questions.forEach(q => console.log(`• ${q}`));
console.log('');
console.log('Take 2 minutes to think, then:');
console.log('  /learn add "your insight"');