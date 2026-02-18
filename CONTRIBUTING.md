# Contributing to OpenSearch Index Manager

Thank you for your interest in contributing to the OpenSearch Index Manager plugin! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Requesting Features](#requesting-features)
  - [Contributing Code](#contributing-code)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Commit Message Conventions](#commit-message-conventions)
- [Release Process](#release-process)
- [Questions?](#questions)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

### Our Standards

- Be respectful and inclusive in your communication
- Welcome newcomers and help them get started
- Focus on constructive criticism and feedback
- Respect different viewpoints and experiences
- Prioritize the community's best interests

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js 18.x installed
- Yarn 1.22.x installed
- Podman (for running tests locally)
- Git configured with your GitHub account

### Setting Up Your Environment

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/opensearch_index_manager.git
cd opensearch_index_manager

# 3. Add upstream remote
git remote add upstream https://github.com/opensearch-project/opensearch_index_manager.git

# 4. Verify remotes
git remote -v
```

### Development Setup

```bash
# Start local development environment
./scripts/start-local.sh

# Install plugin dependencies
cd opensearch_index_manager
yarn install

# Build the plugin
yarn build
```

For advanced development setup with OSD source code, see [OSD_SOURCE_INTEGRATION.md](OSD_SOURCE_INTEGRATION.md).

## How to Contribute

### Reporting Bugs

Before creating a bug report, please:

1. **Check existing issues** to avoid duplicates
2. **Update to the latest version** to see if the bug is already fixed
3. **Collect information** about the bug (OSD version, error messages, steps to reproduce)

#### Submitting a Bug Report

Use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- **Clear title**: Summarize the bug concisely
- **Description**: What happened vs. what you expected
- **Steps to reproduce**: Numbered steps to recreate the issue
- **Environment**: OSD version, OpenSearch version, browser, OS
- **Screenshots**: If applicable, add screenshots
- **Logs**: Relevant error messages or log output

```markdown
**Description**
When I try to edit a nested field, the editor shows an error.

**To Reproduce**
1. Select index 'my-index'
2. Click edit on document with nested fields
3. Modify a nested value
4. Click Save

**Expected behavior**
The document should save successfully.

**Actual behavior**
Error: "Failed to update document"

**Environment**
- OSD Version: 2.19.0
- OpenSearch Version: 2.19.0
- Browser: Chrome 120
- Plugin Version: 1.0.0
```

### Requesting Features

We welcome feature requests! Before submitting:

1. **Check existing requests** to avoid duplicates
2. **Consider the scope**: Is it aligned with the project's goals?
3. **Think about implementation**: Can you suggest how it might work?

#### Submitting a Feature Request

Use our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- **Clear title**: Describe the feature concisely
- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: What other approaches were considered?
- **Additional context**: Mockups, examples, or references

### Contributing Code

#### Finding Issues to Work On

Look for issues labeled:
- `good first issue`: Great for newcomers
- `help wanted`: Community contributions welcome
- `bug`: Something is broken
- `enhancement`: New feature or improvement

Comment on the issue to let others know you're working on it.

#### Making Changes

1. **Create a branch** from the latest `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style guidelines

3. **Test your changes**:
   ```bash
   # Run unit tests
   yarn test
   
   # Run integration tests
   ./scripts/ci/run-integration-tests.sh
   
   # Run functional tests
   cd functional-tests && npm test
   ```

4. **Commit your changes** following our commit conventions

## Development Workflow

### Branch Strategy

```
main
  ├── feature/nested-field-validation
  ├── bugfix/document-save-error
  ├── docs/update-readme
  └── refactor/api-client
```

- `main`: Production-ready code
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `docs/*`: Documentation updates
- `refactor/*`: Code refactoring

### Making Changes

#### Step-by-Step Workflow

```bash
# 1. Sync with upstream
git checkout main
git pull upstream main
git push origin main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 4. Push to your fork
git push origin feature/my-feature

# 5. Create Pull Request on GitHub
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Checkout your main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main
```

## Code Style Guidelines

### TypeScript/JavaScript

We follow the OpenSearch Dashboards style guide:

#### General Rules

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- End statements with **semicolons**
- Maximum **120 characters** per line
- Use **meaningful variable names**

#### TypeScript Specifics

```typescript
// ✅ Good
interface Document {
  id: string;
  title: string;
  metadata?: Record<string, unknown>;
}

class DocumentService {
  private readonly http: HttpSetup;
  
  constructor(http: HttpSetup) {
    this.http = http;
  }
  
  async getDocument(index: string, id: string): Promise<Document> {
    const response = await this.http.get(`/api/indices/${index}/documents/${id}`);
    return response as Document;
  }
}

// ❌ Bad
class document_service {
  http: any;
  
  constructor(h: any) {
    this.http = h;
  }
  
  getDoc(idx: any, id: any) {
    return this.http.get(`/api/indices/${idx}/documents/${id}`);
  }
}
```

#### React Components

```typescript
// ✅ Good
import React, { useState, useCallback } from 'react';

interface DocumentEditorProps {
  document: Document;
  onSave: (doc: Document) => void;
  onCancel: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document,
  onSave,
  onCancel,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(document);
    } finally {
      setIsSaving(false);
    }
  }, [document, onSave]);
  
  return (
    <div className="document-editor">
      {/* Component JSX */}
    </div>
  );
};
```

### File Organization

```
component_name/
├── index.ts              # Public exports
├── component_name.tsx    # Main component
├── component_name.scss   # Styles (if needed)
├── types.ts             # Component-specific types
└── utils.ts             # Component utilities
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `document-editor.tsx` |
| Components | PascalCase | `DocumentEditor` |
| Functions | camelCase | `getDocumentById` |
| Constants | UPPER_SNAKE_CASE | `MAX_NESTED_DEPTH` |
| Interfaces | PascalCase | `Document` |
| Types | PascalCase | `DocumentType` |
| Enums | PascalCase | `FieldType` |

## Testing Requirements

### Test Coverage Expectations

- **New features**: Must include unit tests
- **Bug fixes**: Must include regression tests
- **UI changes**: Should include functional tests
- **API changes**: Must include integration tests

### Writing Tests

#### Unit Tests

```typescript
// document_service.test.ts
import { DocumentService } from './document_service';

describe('DocumentService', () => {
  let service: DocumentService;
  let mockHttp: jest.Mocked<HttpSetup>;
  
  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpSetup>;
    
    service = new DocumentService(mockHttp);
  });
  
  describe('getDocument', () => {
    it('should fetch document by id', async () => {
      const mockDoc = { _id: '1', _source: { title: 'Test' } };
      mockHttp.get.mockResolvedValue(mockDoc);
      
      const result = await service.getDocument('my-index', '1');
      
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/api/opensearch_index_manager/indices/my-index/documents/1'
      );
      expect(result).toEqual(mockDoc);
    });
    
    it('should throw error when document not found', async () => {
      mockHttp.get.mockRejectedValue(new Error('Not found'));
      
      await expect(service.getDocument('my-index', '999'))
        .rejects.toThrow('Not found');
    });
  });
});
```

#### Functional Tests

```typescript
// document-crud.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Document CRUD', () => {
  test('should create a new document', async ({ page }) => {
    await page.goto('/app/opensearch_index_manager');
    
    // Select index
    await page.selectOption('[data-test-subj="indexSelector"]', 'test-index');
    
    // Click create
    await page.click('[data-test-subj="createDocumentButton"]');
    
    // Fill form
    await page.fill('[data-test-subj="field-title"]', 'Test Document');
    
    // Save
    await page.click('[data-test-subj="saveDocumentButton"]');
    
    // Verify success
    await expect(page.locator('.euiToast--success')).toBeVisible();
  });
});
```

### Running Tests

```bash
# All unit tests
yarn test

# Watch mode
yarn test:watch

# Specific file
yarn test document_service.test.ts

# Integration tests
./scripts/ci/run-integration-tests.sh

# Functional tests
cd functional-tests
npm test

# With UI for debugging
npm run test:ui
```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated (if applicable)
- [ ] Commit messages follow conventions

### Submitting Your PR

1. **Push your branch** to your fork
2. **Create a Pull Request** against the `main` branch
3. **Fill out the PR template** completely
4. **Link related issues** using keywords (Fixes #123)
5. **Request review** from maintainers

### PR Review Process

1. **Automated checks** must pass (CI/CD, linting)
2. **Code review** by at least one maintainer
3. **Feedback addressed** and changes pushed
4. **Final approval** and merge by maintainer

### PR Checklist

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Functional tests pass
- [ ] Tested manually

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
```

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, semicolons, etc) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tool changes |

### Examples

```bash
# Feature
feat(document-editor): add support for array fields

# Bug fix
fix(api): handle null values in nested fields

# Documentation
docs(readme): update installation instructions

# Breaking change
feat(api)!: change response format for document list

# With scope and body
feat(nested-fields): improve editor performance

- Add virtualization for large nested structures
- Optimize re-rendering on field updates
- Add loading states for async operations

Fixes #123
```

### Commit Best Practices

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and PRs in body

## Release Process

See [RELEASING.md](RELEASING.md) for detailed release procedures.

### Version Bumping

```bash
# Update version
npm version 1.1.0 --no-git-tag-version

# Update CHANGELOG.md
git add package.json CHANGELOG.md
git commit -m "chore(release): prepare v1.1.0"
```

## Questions?

- 💬 Join our [Discussions](https://github.com/opensearch-project/opensearch_index_manager/discussions)
- 🐛 Report issues using our [templates](https://github.com/opensearch-project/opensearch_index_manager/issues/new/choose)
- 📧 Email maintainers (see [SECURITY.md](SECURITY.md) for contact)

---

Thank you for contributing to OpenSearch Index Manager! 🎉