# Branch Protection Setup

## Current Protection

**Local Git Hooks** (✅ Active):
- `pre-commit`: Runs tests before each commit
- `pre-push`: Runs tests before pushing to main branch

**GitHub Branch Protection** (⚠️ Manual Setup Required):

Go to: `https://github.com/rmurphey/claude-setup/settings/branches`

Configure main branch protection:

1. **Require status checks to pass before merging** ✅
   - Require branches to be up to date before merging ✅
   - Status checks: `Test Suite` ✅

2. **Require a pull request before merging** (Optional)
   - Require approvals: 1
   - Dismiss stale reviews when new commits are pushed ✅

3. **Restrict pushes that create files** (Optional)

4. **Do not allow bypassing the above settings** ✅

## Testing the Protection

**Test pre-commit hook**:
```bash
# Make a change that breaks tests
echo "invalid syntax" >> some-file.js
git add some-file.js
git commit -m "test commit"
# Should fail with test error
```

**Test pre-push hook**:
```bash
# If tests fail locally
git push origin main
# Should fail with "Tests failed! Push to main denied."
```

**Test GitHub Actions**:
- All pushes to main trigger test suite
- PRs to main require passing tests
- Matrix testing on Node.js 20, 22

## Emergency Override

If you need to bypass hooks in an emergency:
```bash
# Skip pre-commit hook
git commit --no-verify

# Skip pre-push hook  
git push --no-verify
```

**⚠️ Use sparingly and fix issues immediately!**