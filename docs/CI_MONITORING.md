# CI Monitoring Options

Three complementary ways to stay aware of CI status and never push broken code.

## Option 1: Quick Check via /hygiene Command

The `/hygiene` command now includes CI status checking:

```bash
/hygiene
```

Output includes:
- ❌ Failed workflows with branch info
- ✅ Success status with last successful run
- ⏳ Running workflow indicators

This gives you immediate CI visibility during regular health checks.

## Option 2: Background Monitoring with Notifications

Enable desktop notifications for CI failures:

```bash
# Start background monitor (runs every 5 minutes)
npm run monitor:start

# Check current status
npm run monitor:status  

# Stop monitoring
npm run monitor:stop
```

### Configuration (.monitor-config.json)

```json
{
  "notifications": {
    "desktop": true,    // Desktop alerts
    "sound": true       // Audio alerts
  },
  "checkInterval": 300000  // 5 minutes
}
```

When CI fails, you'll get:
- Desktop notification popup
- Terminal bell sound (if enabled)
- Visual alert in terminal

## Option 3: Pre-Push Protection

Git hook prevents pushing when CI is failing:

```bash
git push
# 🔍 Checking CI status before push...
# ❌ CI is currently failing!
#    Failed: Quality Checks
# ⚠️  Push blocked due to CI failures
```

Override if needed (not recommended):
```bash
git push --no-verify
```

## Why All Three?

- **Option 1**: Proactive awareness during development
- **Option 2**: Passive monitoring catches issues early  
- **Option 3**: Last-line defense prevents spreading failures

## Setup

All three options are automatically configured. To verify:

```bash
# Check all monitoring is working
/hygiene                    # Should show CI status
cat .monitor-config.json    # Should have notifications enabled
ls .husky/pre-push          # Should exist and be executable
```

## Troubleshooting

### GitHub CLI Not Configured
If you see "CI status unavailable", configure GitHub CLI:
```bash
gh auth login
```

### Notifications Not Working
- **macOS**: Check System Preferences > Notifications
- **Linux**: Ensure notify-send is installed
- **Windows**: Notifications use msg command

### Pre-Push Hook Not Running
Ensure husky is installed:
```bash
npx husky install
```

## Benefits

- **Never push broken code** - Pre-push hook catches failures
- **Early warning system** - Desktop notifications alert you immediately
- **Part of daily workflow** - Hygiene checks include CI status
- **Token efficient** - All delegated to scripts, minimal Claude usage