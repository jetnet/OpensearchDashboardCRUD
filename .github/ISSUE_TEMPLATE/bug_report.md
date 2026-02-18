---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description

A clear and concise description of what the bug is.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

A clear and concise description of what actually happened.

## Screenshots

If applicable, add screenshots to help explain your problem.

## Environment

Please complete the following information:

- **Plugin Version**: [e.g., 1.0.0]
- **OpenSearch Dashboards Version**: [e.g., 2.19.0]
- **OpenSearch Version**: [e.g., 2.19.0]
- **Browser**: [e.g., Chrome 120, Firefox 121]
- **Operating System**: [e.g., Ubuntu 22.04, macOS 14, Windows 11]
- **Node.js Version**: [e.g., 18.19.0]
- **Installation Method**: [e.g., GitHub Release, Source Build, OSD Plugins Directory]

## Configuration

If applicable, provide your `opensearch_dashboards.yml` configuration (remove sensitive information):

```yaml
opensearch_index_manager:
  enabled: true
  maxDocumentsPerPage: 1000
  # ... other config
```

## Logs

Please provide relevant log output. This could be:
- Browser console logs (F12 → Console)
- OpenSearch Dashboards server logs
- OpenSearch logs

```
Paste logs here
```

## Index Mapping (if applicable)

If the bug is related to document editing or nested fields, please provide the index mapping:

```json
{
  "mappings": {
    "properties": {
      // your mapping here
    }
  }
}
```

## Sample Document (if applicable)

If the bug involves specific document data:

```json
{
  "_id": "example-doc",
  "_source": {
    // your document here
  }
}
```

## Additional Context

Add any other context about the problem here, such as:
- Does this happen consistently or intermittently?
- Have you tried different browsers?
- Does it happen with all indices or specific ones?
- Any recent changes to your OSD or OpenSearch setup?

## Possible Solution

If you have suggestions on how to fix the bug, please describe them here.

## Checklist

- [ ] I have searched existing issues to ensure this bug hasn't been reported
- [ ] I have updated to the latest plugin version
- [ ] I have provided all requested information above
- [ ] I have tested this in an incognito/private browser window
- [ ] I have checked browser console for JavaScript errors