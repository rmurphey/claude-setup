# Claude API Setup Guide for GitHub CI/CD

> **TL;DR:** This enables **GitHub Actions** to automatically run the **Agent Auditor** (`.claude/agents/agent-auditor.md`) on a schedule, auditing all your AI agents for quality issues without manual intervention.

This guide covers how to configure the Claude API so **GitHub Actions CI/CD** can automatically run the Agent Auditor agent to perform weekly quality audits of your AI agent library.

## What This Enables: Automated CI/CD Agent Auditing

The API setup allows **GitHub Actions** to run the **Agent Auditor** automatically:

### The GitHub Actions Workflow
- 🔄 **Runs automatically** every Sunday at midnight UTC
- 🤖 **No manual intervention** - CI/CD handles everything
- 📊 **Creates audit reports** directly in your repository
- ✅ **Can block merges** if agents fail quality checks
- 🔔 **Can notify** on Slack/email when issues are found

### What the Agent Auditor Checks
The **`.claude/agents/agent-auditor.md`** agent that GitHub Actions runs will:
- 📋 **Audit all agents** in `.claude/agents/` for quality and completeness
- 🔍 **Validate frontmatter** ensuring proper agent-type and allowed-tools
- 📝 **Check documentation** for clear instructions and success criteria
- 🎯 **Verify task focus** ensuring each agent has a single, clear purpose
- 🚨 **Flag security issues** like overly broad tool access

### Why Use GitHub Actions for This?
Without automated CI/CD auditing:
- ❌ You manually review each agent (time-consuming)
- ❌ Quality issues slip through to production
- ❌ No consistent quality enforcement across team members
- ❌ No audit trail of agent quality over time

With GitHub Actions + Claude API:
- ✅ Automatic weekly quality audits
- ✅ Consistent quality standards enforced
- ✅ Historical reports tracked in git
- ✅ Team notified of issues automatically

## Quick Setup: Enable GitHub Actions CI/CD for Agent Auditing

### 1. Get Your Claude API Key
- Visit [Anthropic Console](https://console.anthropic.com/)
- Navigate to API Keys section
- Create a new key for this project

### 2. Add API Key to GitHub Secrets (Required for CI/CD)
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the secret:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your API key (sk-ant-...)
5. Click **"Add secret"**

⚠️ **NEVER commit your API key to the repository!**

### 3. GitHub Actions Workflow is Now Enabled
Once the secret is added, the `.github/workflows/agent-audit.yml` workflow will:
- **Run automatically**: Every Sunday at midnight UTC
- **Run manually**: Via Actions tab → Agent Audit → Run workflow
- **Use the API key**: To run Claude and audit your agents
- **Commit reports**: Back to your repository for review

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

### Automated Agent Audit (Primary Use Case)
```yaml
# .github/workflows/agent-audit.yml
# Runs the Agent Auditor to check all agents in your library
- uses: rmurphey/claude-code-cli@v1
  with:
    api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    command: run .claude/agents/agent-auditor.md
```
This runs the **Agent Auditor** which:
1. Scans all `.claude/agents/*.md` files
2. Validates each agent's configuration
3. Creates a report at `.claude/agents/reports/agent-audit-[date].md`

### Manual Local Audit
```bash
# Run the Agent Auditor locally (requires API key configured)
claude run .claude/agents/agent-auditor.md

# View the generated report
cat .claude/agents/reports/agent-audit-*.md
```

### Other Available Agents (Also Require API)
```bash
# Documentation Auditor - checks all documentation
claude run .claude/agents/documentation-auditor.md

# Session Insights Analyzer - analyzes development patterns
claude run .claude/agents/session-insights-analyzer.md

# Command Analyzer - audits command templates
claude run .claude/agents/command-analyzer.md
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