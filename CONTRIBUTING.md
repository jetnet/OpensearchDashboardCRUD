# Contributing to OpenSearch Dashboards CRUD Plugin

Thank you for your interest in contributing to the OpenSearch Dashboards CRUD Plugin! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project follows the [OpenSearch Code of Conduct](https://github.com/opensearch-project/.github/blob/main/CODE_OF_CONDUCT.md). By participating in this project, you agree to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 14.x or higher | LTS version recommended |
| Yarn | 1.21.1 or higher | Package manager |
| Git | 2.x | Version control |
| OpenSearch Dashboards | 2.x | For local development |

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/jetnet/OpensearchDashboardCRUD.git
cd OpensearchDashboardCRUD
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/jetnet/OpensearchDashboardCRUD.git
```

4. Install dependencies:

```bash
cd opensearch-crud-plugin
yarn install
```

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

1. **Bug Description**: A clear and concise description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the behavior
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Screenshots**: If applicable, add screenshots
6. **Environment**:
   - OpenSearch Dashboards version
   - Plugin version
   - Browser and version
   - Operating System

### Suggesting Enhancements

We welcome enhancement suggestions! Please create an issue with:

1. **Enhancement Description**: A clear description of the enhancement
2. **Use Case**: Why this enhancement would be useful
3. **Proposed Solution**: If you have ideas for implementation
4. **Alternatives Considered**: Any alternative solutions you've considered

### Contributing Code

1. Find an issue to work on (check for `good first issue` or `help wanted` labels)
2. Comment on the issue to let others know you're working on it
3. Create a feature branch from `main`
4. Make your changes
5. Submit a pull request

## Development Workflow

### Branch Naming

Use descriptive branch names with the following prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/bulk-export` |
| `fix/` | Bug fixes | `fix/pagination-reset` |
| `docs/` | Documentation | `docs/api-reference` |
| `refactor/` | Code refactoring | `refactor/service-layer` |
| `test/` | Adding tests | `test/entity-service` |
| `chore/` | Maintenance | `chore/update-dependencies` |

### Development Setup

1. Link to your OpenSearch Dashboards development environment:

```bash
# Assuming OpenSearch Dashboards is at ../../opensearch-dashboards
yarn link --all
```

2. Start OpenSearch Dashboards in development mode:

```bash
cd ../../opensearch-dashboards
yarn start
```

3. The plugin will be automatically loaded and hot-reloaded on changes.

### Running Tests

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run specific test file
yarn test -- path/to/test.file.ts

# Run tests in watch mode
yarn test --watch
```

### Linting

```bash
# Run ESLint
yarn lint

# Fix lint issues automatically
yarn lint:fix
```

### Type Checking

```bash
# Run TypeScript type check
yarn typecheck
```

### Building

```bash
# Build the plugin
yarn build

# Build for production release
yarn build --release
```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Define explicit types for all function parameters and return values
- Avoid `any` type; use `unknown` when type is truly unknown
- Use interfaces for object shapes, types for unions/primitives
- Use const assertions for literal types

```typescript
// Good
interface EntityAttributes {
  name: string;
  status: EntityStatus;
  tags?: string[];
}

function createEntity(attributes: EntityAttributes): Promise<Entity> {
  // implementation
}

// Avoid
function createEntity(attributes: any): any {
  // implementation
}
```

### React Components

- Use functional components with hooks
- Use TypeScript for prop types
- Use OUI components from OpenSearch Design System
- Keep components focused and single-purpose

```tsx
// Good
import React from 'react';
import { OuiPanel, OuiTitle } from '@opensearch-project/oui';

interface EntityCardProps {
  entity: Entity;
  onSelect: (id: string) => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity, onSelect }) => {
  return (
    <OuiPanel onClick={() => onSelect(entity.id)}>
      <OuiTitle size="s">
        <h3>{entity.attributes.name}</h3>
      </OuiTitle>
    </OuiPanel>
  );
};
```

### File Organization

- One component per file
- Co-locate related files (component, styles, tests)
- Use index files for exports
- Keep files under 300 lines; split if larger

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase | `EntityList.tsx` |
| Files (utilities) | camelCase | `queryBuilder.ts` |
| Files (hooks) | camelCase with `use` prefix | `useEntityList.ts` |
| Interfaces | PascalCase | `EntityAttributes` |
| Types | PascalCase | `EntityStatus` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Variables | camelCase | `entityList` |
| Functions | camelCase | `createEntity` |
| React Components | PascalCase | `EntityCard` |

### Import Order

```typescript
// 1. React and framework imports
import React, { useState, useEffect } from 'react';

// 2. Third-party imports
import { render, screen } from '@testing-library/react';

// 3. OpenSearch imports
import { OuiPanel, OuiButton } from '@opensearch-project/oui';

// 4. Internal imports (absolute)
import { Entity } from '../../types';
import { EntityService } from '../../services';

// 5. Relative imports
import { EntityCard } from './EntityCard';
import './entity_list.scss';
```

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

### Examples

```bash
# Feature
feat(filter): add date range filter support

# Bug fix
fix(pagination): reset page number when filters change

# Documentation
docs(api): update entity endpoints documentation

# Breaking change
feat(api)!: change entity response format

BREAKING CHANGE: Entity response now includes `attributes` wrapper
```

### Commit Message Body

- Use imperative mood ("add feature" not "added feature")
- Limit subject line to 72 characters
- Reference issues and pull requests in footer

```bash
feat(bulk): add bulk delete operation

Implements bulk delete functionality for entity management.
Users can now select multiple entities and delete them in a
single operation.

Closes #123
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest upstream changes:

```bash
git fetch upstream
git rebase upstream/main
```

2. **Run all checks**:

```bash
yarn lint
yarn typecheck
yarn test
yarn build
```

3. **Update documentation** if needed

4. **Add/update tests** for new functionality

### PR Title

Use the same format as commit messages:

```
feat(filter): add date range filter support
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests pass locally
- [ ] New and existing tests pass
```

### Review Process

1. At least one approval from a maintainer is required
2. All CI checks must pass
3. No merge conflicts
4. PR must be up to date with main branch

### After Approval

- Maintainers will squash and merge your PR
- Your commit will be included in the next release

## Issue Guidelines

### Creating Issues

Use the appropriate issue template:

- **Bug Report**: For reporting bugs
- **Feature Request**: For suggesting new features
- **Question**: For asking questions

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Improvements or additions to documentation |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention is needed |
| `blocked` | Blocked by another issue |
| `wontfix` | This will not be worked on |

### Issue Lifecycle

1. **New**: Issue created, awaiting triage
2. **Triaged**: Maintainers have reviewed and labeled
3. **In Progress**: Someone is working on it
4. **Review**: PR submitted, under review
5. **Closed**: Issue resolved or closed

## Testing Guidelines

### Unit Tests

- Write tests for all new functionality
- Aim for 80% code coverage or higher
- Use descriptive test names

```typescript
describe('EntityService', () => {
  describe('createEntity', () => {
    it('should create an entity with valid attributes', async () => {
      // Arrange
      const attributes = { name: 'Test', status: 'active' };
      
      // Act
      const result = await service.createEntity(attributes);
      
      // Assert
      expect(result.id).toBeDefined();
      expect(result.attributes.name).toBe('Test');
    });

    it('should throw validation error for invalid attributes', async () => {
      // Arrange
      const attributes = { name: '', status: 'invalid' };
      
      // Act & Assert
      await expect(service.createEntity(attributes))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

### Integration Tests

- Test API endpoints
- Test component interactions
- Test data flow

### Test File Organization

```
tests/
|-- unit/
|   |-- public/
|   |   |-- components/
|   |   |-- services/
|   |   |-- hooks/
|   |-- server/
|       |-- routes/
|       |-- services/
|-- integration/
    |-- api/
    |-- e2e/
```

## Getting Help

- **GitHub Discussions**: For questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **OpenSearch Forum**: [forum.opensearch.org](https://forum.opensearch.org/)

## Recognition

Contributors are recognized in our:
- Release notes
- Contributors file
- Project README

Thank you for contributing to the OpenSearch Dashboards CRUD Plugin! 🎉
