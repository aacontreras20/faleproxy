# HW9 Setup and Submission Guide

## GitHub Secrets Configuration

You need to configure the following secrets in your GitHub repository at:
`https://github.com/YOUR_USERNAME/faleproxy/settings/secrets/actions`

### Required Secrets:

1. **VERCEL_TOKEN**
   - Get this from: https://vercel.com/account/tokens
   - Click "Create Token"
   - Give it a descriptive name (e.g., "GitHub Actions")
   - Copy the token and add it to GitHub secrets

2. **VERCEL_ORG_ID**
   - Navigate to your Vercel project settings
   - Go to the "General" tab
   - Find "Project Settings" section
   - Copy the "Organization ID" (or Team ID)

3. **VERCEL_PROJECT_ID**
   - In the same Vercel project settings page
   - Copy the "Project ID" from the "General" tab

### How to Add Secrets to GitHub:

1. Go to your repository: `https://github.com/YOUR_USERNAME/faleproxy`
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret with its corresponding value

## Enable GitHub Actions

GitHub Actions are disabled by default on forked repositories. Enable them at:
`https://github.com/YOUR_USERNAME/faleproxy/actions`

Click the "I understand my workflows, go ahead and enable them" button.

## CI/CD Workflow Overview

### Feature Branch Workflow:
1. Push to feature branch → Runs tests
2. If tests pass → Deploys to Vercel **preview** environment
3. If tests fail → No deployment

### Main Branch Workflow:
1. Push/merge to main → Runs tests
2. If tests pass → Deploys to Vercel **production** environment
3. If tests fail → No deployment (production is protected)

## Testing the Workflow

### Create a Feature Branch:
```bash
git checkout -b hw9-fixes
git add .
git commit -m "Fix case-insensitive replacement for Yale

- Added YALE → FALE replacement to all test files
- Fixed integration tests to use supertest instead of spawning server
- Updated CI/CD workflow to support preview deployments

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push -u origin hw9-fixes
```

### Verify Preview Deployment:
1. Go to GitHub Actions tab
2. Verify tests pass
3. Verify preview deployment succeeds
4. Check Vercel dashboard for preview URL

### Merge to Main:
```bash
git checkout main
git merge hw9-fixes
git push origin main
```

### Verify Production Deployment:
1. Go to GitHub Actions tab
2. Verify tests pass
3. Verify production deployment succeeds
4. Check Vercel dashboard for production URL

## Share Repository Access

Add the following GitHub users as collaborators:
- ssayer-lgtm
- kingshukkundu

Go to: `https://github.com/YOUR_USERNAME/faleproxy/settings/access`
Click "Add people" and invite each user with "Read" access.

## Submission Information

### What to Submit:

1. **GitHub Repository URL**:
   - Format: `https://github.com/YOUR_USERNAME/faleproxy`

2. **Commit Link** (the one that failed tests in HW8):
   - Should be a full commit link, not just branch
   - Format: `https://github.com/YOUR_USERNAME/faleproxy/commit/COMMIT_HASH`
   - Example: `https://github.com/ChristopherThorpe/faleproxy/commit/7e8db6561b5b94a7573314f8bb03bb93e8eafe89`

3. **Vercel Preview URL**:
   - Get from Vercel dashboard after feature branch deployment
   - Format: `https://faleproxy-HASH.vercel.app`

4. **Vercel Production URL**:
   - Get from Vercel dashboard after main branch deployment
   - Format: `https://faleproxy.vercel.app` or your custom domain

## Changes Made in This Assignment

### Code Fixes:
- ✅ Added `YALE` → `FALE` replacement (uppercase support)
- ✅ Updated all test files to use consistent triple replacement pattern
- ✅ Fixed integration tests to avoid circular JSON errors
- ✅ All tests now pass

### CI/CD Improvements:
- ✅ Added preview deployment workflow for feature branches
- ✅ Production deployment only triggers on main branch
- ✅ Deployments only happen when tests pass
- ✅ Upgraded GitHub Actions from v3 to v4

### Workflow Configuration:
- Tests run on Node 18.x and 20.x
- Preview deployments for all non-main branches
- Production deployments only for main branch
- Both require tests to pass first
