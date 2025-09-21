# Versioning and Release Management

This project uses **Semantic Versioning** with automated releases via GitHub Actions.

## Overview

- **Automatic version bumping** based on commit types (when using conventional commits)
- **Automated CHANGELOG generation** for user-friendly release notes
- **GitHub releases** with tags created automatically
- **No enforcement** - commits work as normal, but following the convention enables automation

## Commit Message Format (Optional but Recommended)

**You can commit normally**, but if you want automatic versioning, follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Valid Commit Types

| Type       | Version Bump | Description                                    |
|------------|-------------|------------------------------------------------|
| `feat`     | Minor       | New feature for the user                      |
| `fix`      | Patch       | Bug fix for the user                          |
| `docs`     | None        | Documentation only changes                     |
| `style`    | None        | Code style changes (formatting, etc)          |
| `refactor` | None        | Code change that neither fixes nor adds       |
| `perf`     | Patch       | Performance improvements                       |
| `test`     | None        | Adding or updating tests                      |
| `build`    | None        | Build system or dependency changes            |
| `ci`       | None        | CI configuration changes                      |
| `chore`    | None        | Other changes that don't modify src           |
| `revert`   | Varies      | Reverting a previous commit                   |

### Breaking Changes

To trigger a major version bump (e.g., 1.0.0 → 2.0.0):

```bash
# Using footer
git commit -m "feat: redesign authentication system

BREAKING CHANGE: API endpoints have changed"

# Using ! after type
git commit -m "feat!: redesign authentication system"
```

## Simple Usage

```bash
# Regular commits (no version change)
git commit -m "update readme"
git commit -m "refactoring"

# Commits that trigger versions
git commit -m "feat: add new feature"  # Minor version bump
git commit -m "fix: resolve bug"       # Patch version bump
```

## Manual Commits

If committing manually, ensure your message follows the format:

```bash
# All commits work - these trigger versions:
git commit -m "feat: add user dashboard"        # ✅ Minor bump
git commit -m "fix: resolve login timeout issue" # ✅ Patch bump

# These also work - no version change:
git commit -m "updated code"      # Works, no version
git commit -m "WIP"               # Works, no version
git commit -m "minor fixes"       # Works, no version
```

## Version Bumping Rules

Based on commits since the last release:

- **Patch version** (1.0.0 → 1.0.1): When there are only `fix` or `perf` commits
- **Minor version** (1.0.0 → 1.1.0): When there are `feat` commits
- **Major version** (1.0.0 → 2.0.0): When there are breaking changes

## Release Process

### Automatic (GitHub Actions)

1. Push commits to `main` branch
2. GitHub Actions runs semantic-release
3. Analyzes commits since last release
4. Updates version in package.json
5. Generates/updates CHANGELOG.md
6. Creates git tag
7. Creates GitHub release
8. Commits changes back to main with `[skip ci]`

### Manual Release (Local)

```bash
# Dry run to see what would be released
bunx semantic-release --dry-run

# Actual release (requires GitHub token)
GITHUB_TOKEN=your_token bunx semantic-release
```

## GitHub Setup

### Required Secrets

No additional secrets needed - uses default `GITHUB_TOKEN`

### Branch Protection

Recommended settings for `main` branch:
- Require pull request reviews
- Dismiss stale pull request approvals
- Require status checks to pass
- Include administrators

### Workflow Permissions

Ensure Actions have write permissions:
- Settings → Actions → General → Workflow permissions
- Select "Read and write permissions"

## Viewing Releases

- **GitHub Releases**: https://github.com/[your-org]/[your-repo]/releases
- **Changelog**: See `CHANGELOG.md` in the repository
- **Version**: Check `package.json` version field

## Troubleshooting

### Mixed Commits

If you have both conventional and regular commits:
- Regular commits are included in the release but don't affect versioning
- Only conventional commits (`feat:`, `fix:`, etc.) trigger version bumps
- All commits appear in the git history

### No Release Created

Possible reasons:
- No commits with `feat` or `fix` since last release
- Only `chore`, `docs`, or `style` commits
- Release already exists for current version

### Permission Denied in CI

Ensure GitHub Actions has write permissions:
- Repository Settings → Actions → General
- Workflow permissions: Read and write

## Best Practices

1. **Write meaningful commit messages** - They become your changelog
2. **Use scopes for clarity** - `feat(auth): add OAuth support`
3. **Include breaking changes properly** - Users need to know
4. **Group related changes** - Makes changelog more readable
5. **Use commitizen for consistency** - `bun run commit`

## Examples

```bash
# Feature with scope
git commit -m "feat(dashboard): add real-time analytics widget"

# Bug fix
git commit -m "fix: prevent memory leak in data processing"

# Breaking change
git commit -m "feat!: migrate to new API structure

BREAKING CHANGE: All API endpoints now require authentication"

# Multiple changes in one commit (avoid if possible)
git commit -m "feat: add export functionality

- Add CSV export
- Add PDF export
- Add email integration"
```