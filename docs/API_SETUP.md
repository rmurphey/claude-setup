# Claude API Setup Guide

This guide covers how to configure and use the Claude API for automated agent audits and intelligent analysis features.

## What the API Enables

With the Claude API configured, you can:
- 🤖 **Automated Agent Audits** - Weekly quality checks via GitHub Actions
- 🧠 **Intelligent Analysis** - Beyond simple pattern matching
- 📊 **Deep Insights** - Claude's reasoning applied to your codebase
- 🔄 **CI/CD Integration** - Automated quality gates in your pipeline

## Quick Setup (GitHub Actions)

### 1. Get Your API Key
- Visit [Anthropic Console](https://console.anthropic.com/)
- Navigate to API Keys section
- Create a new key for this project

### 2. Add to GitHub Secrets
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the secret:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your API key (sk-ant-...)
5. Click **"Add secret"**

⚠️ **NEVER commit your API key to the repository!**

### 3. Enable the Workflow
The agent audit workflow runs:
- **Automatically**: Every Sunday at midnight UTC
- **Manually**: Via Actions tab → Agent Audit → Run workflow

## Local Development Setup

For local API usage with agents:

### Option 1: Environment Variable
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
# Now run your agent commands
```

### Option 2: .env File (Git-Ignored)
```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
# The .env file is already in .gitignore
```

### Option 3: Claude Code CLI Config
```bash
claude config set api-key sk-ant-...
```

## Security Best Practices

### DO ✅
- Store API keys in environment variables or secrets
- Use different keys for development and production
- Rotate keys regularly
- Limit key permissions when possible
- Monitor usage via the Anthropic Console

### DON'T ❌
- Commit API keys to version control
- Share keys between team members
- Log API keys in console output
- Include keys in error messages
- Use production keys for testing

## Cost Considerations

### API Pricing
- Claude 3.5 Sonnet: ~$3 per million input tokens
- Typical agent audit: ~10,000 tokens (~$0.03)
- Weekly audits: ~$1.50/month

### Optimization Tips
- Use caching for repeated analyses
- Batch related operations
- Filter inputs to relevant content only
- Monitor usage in Anthropic Console

## Workflow Examples

### Automated Agent Audit
```yaml
# .github/workflows/agent-audit.yml
- uses: rmurphey/claude-code-cli@v1
  with:
    api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    command: run .claude/agents/agent-auditor.md
```

### Manual Agent Run
```bash
# With API key configured
claude run .claude/agents/repo-quality-auditor.md
```

### CI/CD Quality Gate
```yaml
# In your CI pipeline
- name: Quality Check with Claude
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    npx claude-code-cli run .claude/agents/test-coverage-advisor.md
```

## Troubleshooting

### Common Issues

#### "Invalid API Key"
- Verify key starts with `sk-ant-`
- Check for extra spaces or quotes
- Ensure key hasn't been revoked

#### "Rate Limit Exceeded"
- Default: 50 requests per minute
- Solution: Add delays between requests
- Consider upgrading your plan

#### "Workflow Not Running"
- Check Actions are enabled in repository settings
- Verify secret name is exactly `ANTHROPIC_API_KEY`
- Check workflow file syntax

#### "Permission Denied"
- Ensure GitHub Actions has write permissions
- Check branch protection rules
- Verify workflow permissions in settings

### Debug Mode
Enable verbose logging:
```bash
DEBUG=claude* npm run agent:audit
```

## Advanced Configuration

### Custom Model Selection
```javascript
// In your agent configuration
const config = {
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 4096,
  temperature: 0.7
};
```

### Webhook Notifications
Configure GitHub to notify on audit completion:
1. Settings → Webhooks → Add webhook
2. Payload URL: Your notification endpoint
3. Events: Workflow runs

### Multi-Environment Setup
```yaml
# Different keys per environment
production:
  secret: ANTHROPIC_API_KEY_PROD
staging:
  secret: ANTHROPIC_API_KEY_STAGING
development:
  secret: ANTHROPIC_API_KEY_DEV
```

## Resources

- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Claude Code CLI](https://www.npmjs.com/package/claude-code-cli)
- [Pricing Calculator](https://www.anthropic.com/pricing)

## Support

- **Issues**: [GitHub Issues](https://github.com/rmurphey/claude-setup/issues)
- **Community**: [Discussions](https://github.com/rmurphey/claude-setup/discussions)
- **API Support**: [Anthropic Support](https://support.anthropic.com/)