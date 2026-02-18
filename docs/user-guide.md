# OpenSearch Index Manager - User Guide

Complete guide for using the OpenSearch Index Manager plugin.

## Table of Contents

- [Getting Started](#getting-started)
- [Index Selection](#index-selection)
- [Document Management](#document-management)
  - [Viewing Documents](#viewing-documents)
  - [Creating Documents](#creating-documents)
  - [Editing Documents](#editing-documents)
  - [Deleting Documents](#deleting-documents)
- [Nested Field Editing](#nested-field-editing)
- [Search Functionality](#search-functionality)
- [Mapping Viewer](#mapping-viewer)
- [Tips and Tricks](#tips-and-tricks)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the Plugin

1. Log in to your OpenSearch Dashboards instance
2. Look for **"OpenSearch Plugins"** in the left navigation sidebar
3. Click on **"Index Manager"** to open the plugin

### First Look

When you open the plugin, you'll see:

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenSearch Index Manager                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Select Index: [Choose an index...                    ▼]        │
│                                                                 │
│  [Create Document]  [Toggle Mapping]                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Search: [                                      🔍]     │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  Select an index to view documents                      │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Index Selection

### Selecting an Index

1. Click the **"Select Index"** dropdown
2. You'll see a list of all available indices in your OpenSearch cluster
3. Choose the index you want to work with

### Understanding the Index List

The dropdown shows:
- **Index name**: The name of the index
- **Document count**: Number of documents (shown as badge)
- **Health status**: Green (healthy), Yellow (warning), or Red (critical)

### Refreshing Index List

The index list refreshes automatically when you open the dropdown. To manually refresh:
- Close and reopen the dropdown
- Reload the page (F5)

## Document Management

### Viewing Documents

Once you select an index, the document list appears:

```
┌─────────────────────────────────────────────────────────────────┐
│  Documents (1-20 of 1,247)                              [Refresh]│
├──────────┬──────────┬──────────┬──────────┬────────────┬────────┤
│ _id      │ title    │ status   │ created  │ Actions    │  ...   │
├──────────┼──────────┼──────────┼──────────┼────────────┼────────┤
│ doc_001  │ ...      │ active   │ ...      │ [Edit][Del]│        │
│ doc_002  │ ...      │ pending  │ ...      │ [Edit][Del]│        │
│ doc_003  │ ...      │ active   │ ...      │ [Edit][Del]│        │
├──────────┴──────────┴──────────┴──────────┴────────────┴────────┤
│  [← Previous]  Page 1 of 63  [Next →]  [20 ▼] per page          │
└─────────────────────────────────────────────────────────────────┘
```

#### Column Display

The table automatically shows common fields:
- `_id`: Document ID
- `title`, `name`: Common identifier fields
- `status`, `state`: Status fields
- `created`, `timestamp`: Date fields

Additional fields can be viewed by scrolling horizontally.

#### Pagination

- Use **Previous** / **Next** buttons to navigate pages
- Change items per page: **20**, **50**, **100**, or **1000**
- Current position shown as: "1-20 of 1,247"

### Creating Documents

1. Click the **"Create Document"** button
2. The document editor opens:

```
┌─────────────────────────────────────────────────────────────┐
│ Create Document                                    [X]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Document ID (optional):                                    │
│  [my-custom-id                                    ]         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Fields                                               │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ [+ Add Field]                                        │   │
│  │                                                      │   │
│  │ Field Name     Type          Value                   │   │
│  │ [title      ] [text ▼] [Hello World          ] [🗑️] │   │
│  │ [status     ] [keyword▼] [active             ] [🗑️] │   │
│  │ [count      ] [long ▼] [42                   ] [🗑️] │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  [Switch to JSON Mode]                                      │
│                                                             │
│                    [Cancel]          [Save Document]        │
└─────────────────────────────────────────────────────────────┘
```

#### Steps to Create a Document

1. **Document ID** (optional):
   - Leave blank for auto-generated ID
   - Enter custom ID if needed
   - Must be unique within the index

2. **Add Fields**:
   - Click **"+ Add Field"** to add a new field
   - Enter field name
   - Select field type:
     - `text` - For full-text search
     - `keyword` - For exact matching
     - `long` / `integer` - For numbers
     - `double` / `float` - For decimals
     - `boolean` - For true/false
     - `date` - For dates
     - `object` - For nested objects
     - `nested` - For nested arrays

3. **Enter Values**:
   - Type the value in the value field
   - For objects, click the **+** icon to add child fields
   - For arrays, click **Add Item**

4. **Save**:
   - Click **"Save Document"** to create
   - Or **"Cancel"** to discard

#### JSON Mode

For complex documents, switch to JSON mode:

```
[Switch to Form Mode]

┌──────────────────────────────────────────────────────────────┐
│ {                                                            │
│   "title": "Hello World",                                    │
│   "status": "active",                                        │
│   "metadata": {                                              │
│     "created_by": "user123",                                 │
│     "tags": ["important", "review"]                          │
│   }                                                          │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
```

### Editing Documents

1. Find the document in the list
2. Click the **"Edit"** button (pencil icon)
3. The editor opens with current values

#### Editing Different Field Types

**Simple Fields** (text, keyword, numbers):
- Click the value field
- Make changes
- Press Tab or click elsewhere to confirm

**Boolean Fields**:
- Toggle the checkbox

**Date Fields**:
- Use the date picker
- Or enter ISO format: `2024-01-15T10:30:00Z`

**Object Fields**:
- Click the arrow to expand
- Edit child fields
- Click **+** to add new fields to the object

**Array Fields**:
- Each item shown with index
- Click **Add Item** to append
- Click **🗑️** to remove an item

#### Saving Changes

- Click **"Save Document"** to persist changes
- Click **"Cancel"** to discard changes
- Validation errors will be shown inline

### Deleting Documents

1. Find the document in the list
2. Click the **"Delete"** button (trash icon)
3. Confirm deletion in the dialog:

```
┌─────────────────────────────────────────┐
│ Confirm Delete                 [X]      │
├─────────────────────────────────────────┤
│                                         │
│  Are you sure you want to delete        │
│  document "doc_001"?                    │
│                                         │
│  This action cannot be undone.          │
│                                         │
│           [Cancel]    [Delete]          │
└─────────────────────────────────────────┘
```

⚠️ **Warning**: Deletion is permanent and cannot be undone.

## Nested Field Editing

The plugin provides specialized support for nested JSON structures.

### Understanding Nested Fields

Given this document structure:
```json
{
  "user": {
    "profile": {
      "name": "John Doe",
      "address": {
        "street": "123 Main St",
        "city": "New York"
      }
    },
    "preferences": {
      "notifications": true
    }
  }
}
```

### Editing Nested Objects

1. **Navigate the tree**:
   - Click arrows to expand/collapse levels
   - Each level shows its own fields

2. **Edit values**:
   ```
   ▼ user (object)
     ▼ profile (object)
         name: [John Doe          ]
       ▼ address (object)
           street: [123 Main St   ]
           city: [New York       ]
     ▼ preferences (object)
         notifications: [✓]
   ```

3. **Add nested fields**:
   - Click **+** on the parent object
   - Enter field name and type
   - For deeply nested objects, select type "object"

### Editing Arrays

For array fields:

```
▼ tags (array)
  [0]: [important                ] [🗑️]
  [1]: [review                   ] [🗑️]
  [+ Add Item]
```

**Array of Objects**:
```
▼ items (array of objects)
  ▼ [0]
      name: [Product A          ]
      price: [29.99             ]
  ▼ [1]
      name: [Product B          ]
      price: [49.99             ]
  [+ Add Item]
```

### Maximum Nesting Depth

The editor supports up to **10 levels** of nesting (configurable). Deep nesting warning:

```
⚠️ Maximum nesting depth (10) reached. 
   Use JSON mode for deeper structures.
```

### Tips for Nested Editing

- **Collapse unused branches**: Click ▼ to collapse sections you're not editing
- **Use breadcrumbs**: The editor shows your current path (user > profile > address)
- **Search within document**: Use Ctrl+F to find fields
- **Copy path**: Right-click a field to copy its full path

## Search Functionality

### Simple Search

Enter text in the search box for basic query:

```
Search: [laptop                                    🔍]
```

This searches across all text fields in the documents.

### Advanced Search (Query DSL)

Click the **"Advanced"** link to use OpenSearch Query DSL:

```
┌─────────────────────────────────────────────────────────────┐
│ Advanced Search                                    [X]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Query DSL:                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ {                                                    │   │
│  │   "query": {                                         │   │
│  │     "bool": {                                        │   │
│  │       "must": [                                      │   │
│  │         { "match": { "status": "active" } },         │   │
│  │         { "range": { "price": { "gte": 100 } } }     │   │
│  │       ]                                              │   │
│  │     }                                                │   │
│  │   }                                                  │   │
│  │ }                                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│              [Cancel]              [Search]                 │
└─────────────────────────────────────────────────────────────┘
```

#### Common Query Examples

**Match Query**:
```json
{
  "query": {
    "match": {
      "title": "search terms"
    }
  }
}
```

**Term Query** (exact match):
```json
{
  "query": {
    "term": {
      "status": "active"
    }
  }
}
```

**Range Query**:
```json
{
  "query": {
    "range": {
      "created_at": {
        "gte": "2024-01-01",
        "lte": "2024-12-31"
      }
    }
  }
}
```

**Bool Query** (combined):
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "laptop" } }
      ],
      "filter": [
        { "term": { "status": "active" } },
        { "range": { "price": { "lte": 1000 } } }
      ]
    }
  }
}
```

### Search Results

Results are displayed with:
- **Highlighted matches**: Matching terms highlighted
- **Score**: Relevance score (for text search)
- **Total hits**: Number of matching documents
- **Took**: Query execution time

### Saving Searches

Frequently used searches can be saved:
1. Run your search
2. Click **"Save Search"**
3. Give it a name
4. Access from **Saved Searches** dropdown

## Mapping Viewer

### Viewing Index Mapping

Click **"Toggle Mapping"** to see the index structure:

```
┌─────────────────────────────────────────────────────────────┐
│ Index Mapping                                      [X]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Tree View]  [JSON View]                                   │
│                                                             │
│  ▼ my-index                                                 │
│    ▼ properties                                             │
│      ▼ title                                                │
│          type: text                                         │
│      ▼ status                                               │
│          type: keyword                                      │
│      ▼ metadata (object)                                    │
│        ▼ properties                                         │
│          ▼ created_by                                       │
│              type: keyword                                  │
│          ▼ tags                                             │
│              type: text                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tree View

Hierarchical view showing:
- Field names
- Field types
- Nested structure
- Multi-field mappings

### JSON View

Raw mapping JSON for advanced use:

```json
{
  "my-index": {
    "mappings": {
      "properties": {
        "title": { "type": "text" },
        "status": { "type": "keyword" }
      }
    }
  }
}
```

### Understanding Field Types

| Type | Description | Use Case |
|------|-------------|----------|
| `text` | Analyzed text | Full-text search |
| `keyword` | Exact value | Filtering, sorting |
| `long` / `integer` | Whole numbers | IDs, counts |
| `float` / `double` | Decimals | Prices, measurements |
| `boolean` | true/false | Flags |
| `date` | Date/time | Timestamps |
| `object` | Nested object | Complex data |
| `nested` | Array of objects | Parent-child |

## Tips and Tricks

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save document (in editor) |
| `Ctrl + F` | Find in page |
| `Esc` | Close modal / Cancel |
| `Enter` | Confirm dialog |
| `Tab` | Next field |
| `Shift + Tab` | Previous field |

### Bulk Operations

Currently, the plugin focuses on single-document operations. For bulk operations:

1. **Export documents**: Use OpenSearch API
2. **Bulk update**: Use OpenSearch `_bulk` API
3. **Re-import**: Create documents individually

### Performance Tips

**For Large Indices**:
- Use smaller page sizes (20-50)
- Apply filters before viewing
- Avoid expanding all nested fields
- Use specific searches instead of browsing

**For Complex Documents**:
- Use JSON mode for bulk changes
- Collapse unused branches
- Save work frequently

### Common Patterns

**Adding Timestamp**:
```json
{
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Status Workflow**:
```json
{
  "status": "draft",
  "status_history": [
    { "status": "draft", "timestamp": "..." }
  ]
}
```

**Nested Categories**:
```json
{
  "category": {
    "primary": "electronics",
    "sub": "laptops",
    "path": "electronics.laptops"
  }
}
```

## Troubleshooting

### Common Issues

#### "No indices found"

**Cause**: User doesn't have permissions or cluster is empty

**Solution**:
- Check OpenSearch Security permissions
- Verify indices exist: `GET /_cat/indices`
- Check user roles in OpenSearch Dashboards

#### "Failed to load documents"

**Cause**: Index doesn't exist or mapping issue

**Solution**:
- Verify index name is correct
- Check OpenSearch cluster health
- Review OSD logs for errors

#### "Document update failed"

**Cause**: Version conflict or validation error

**Solution**:
- Refresh the page and try again
- Check if document was modified by another user
- Verify field types match mapping

#### "Cannot edit nested field"

**Cause**: Field type mismatch or depth limit

**Solution**:
- Check field type in mapping viewer
- Use JSON mode for complex changes
- Verify max nested depth setting

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `index_not_found_exception` | Index doesn't exist | Check index name |
| `document_missing_exception` | Document was deleted | Refresh list |
| `version_conflict_engine_exception` | Concurrent modification | Refresh and retry |
| `mapper_parsing_exception` | Invalid field value | Check field type |
| `illegal_argument_exception` | Invalid operation | Check parameters |

### Getting Help

If you encounter issues:

1. **Check browser console** (F12 → Console) for JavaScript errors
2. **Review OSD logs** for server-side errors
3. **Test OpenSearch directly** using Dev Tools
4. **File an issue** with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Screenshots if applicable

### Debug Mode

Enable debug logging in `opensearch_dashboards.yml`:

```yaml
logging.verbose: true
logging.events.log: ['debug', 'info', 'warning', 'error']
```

---

*For more help, visit our [GitHub Discussions](https://github.com/opensearch-project/opensearch_index_manager/discussions) or [Issues](https://github.com/opensearch-project/opensearch_index_manager/issues).*