# OpenSearch Index Manager - Architecture Documentation

This document describes the technical architecture of the OpenSearch Index Manager plugin for OpenSearch Dashboards.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Diagrams](#component-diagrams)
- [Data Flow](#data-flow)
- [API Documentation](#api-documentation)
- [Plugin Integration Points](#plugin-integration-points)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)

## Overview

The OpenSearch Index Manager is a client-server plugin for OpenSearch Dashboards that provides a user interface for CRUD operations on OpenSearch indices. It follows the standard OSD plugin architecture with clear separation between client (public) and server components.

### Key Design Principles

1. **Separation of Concerns**: Clear boundaries between UI, API, and data layers
2. **Type Safety**: Full TypeScript implementation with comprehensive type definitions
3. **Error Resilience**: Comprehensive error handling at all layers
4. **Performance**: Efficient data fetching and rendering strategies
5. **Extensibility**: Plugin architecture allows for easy extension

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "OpenSearch Dashboards"
        subgraph "Client Side"
            UI[UI Components]
            SVC[Services]
            STATE[State Management]
        end
        
        subgraph "Server Side"
            ROUTES[API Routes]
            HANDLERS[Route Handlers]
            OS_CLIENT[OpenSearch Client]
        end
    end
    
    subgraph "External"
        OS[OpenSearch Cluster]
    end
    
    UI --> SVC
    SVC --> STATE
    SVC --> ROUTES
    ROUTES --> HANDLERS
    HANDLERS --> OS_CLIENT
    OS_CLIENT --> OS
```

### Plugin Architecture

```mermaid
graph LR
    subgraph "Plugin Lifecycle"
        SETUP[Setup Phase]
        START[Start Phase]
        STOP[Stop Phase]
    end
    
    subgraph "Client Plugin"
        C_SETUP[setup<br/>Register UI]
        C_START[start<br/>Mount App]
    end
    
    subgraph "Server Plugin"
        S_SETUP[setup<br/>Register Routes]
        S_START[start<br/>Init Services]
    end
    
    SETUP --> C_SETUP
    SETUP --> S_SETUP
    C_SETUP --> START
    S_SETUP --> START
    START --> C_START
    START --> S_START
```

## Component Diagrams

### Client-Side Components

```mermaid
graph TB
    subgraph "Application Layer"
        APP[AppRoot<br/>Main Application]
    end
    
    subgraph "Page Components"
        INDEX_SEL[IndexSelector]
        DOC_LIST[DocumentList]
        DOC_EDIT[DocumentEditor]
        MAPPING[MappingViewer]
    end
    
    subgraph "Shared Components"
        FIELD_EDIT[FieldEditor]
        JSON_EDIT[JsonEditor]
    end
    
    subgraph "Services"
        IDX_SVC[IndexService]
        DOC_SVC[DocumentService]
        HTTP_SVC[HttpService]
    end
    
    APP --> INDEX_SEL
    APP --> DOC_LIST
    APP --> DOC_EDIT
    APP --> MAPPING
    
    DOC_LIST --> DOC_EDIT
    DOC_EDIT --> FIELD_EDIT
    DOC_EDIT --> JSON_EDIT
    
    INDEX_SEL --> IDX_SVC
    DOC_LIST --> DOC_SVC
    DOC_EDIT --> DOC_SVC
    MAPPING --> IDX_SVC
    
    IDX_SVC --> HTTP_SVC
    DOC_SVC --> HTTP_SVC
```

### Server-Side Components

```mermaid
graph TB
    subgraph "Route Layer"
        IDX_ROUTES[Index Routes]
        DOC_ROUTES[Document Routes]
        SEARCH_ROUTES[Search Routes]
    end
    
    subgraph "Handler Layer"
        IDX_HANDLERS[Index Handlers]
        DOC_HANDLERS[Document Handlers]
        SEARCH_HANDLERS[Search Handlers]
    end
    
    subgraph "Utilities"
        ERROR_HANDLER[Error Handler]
        VALIDATION[Input Validation]
    end
    
    subgraph "External Client"
        OS_CLIENT[OpenSearch Client]
    end
    
    IDX_ROUTES --> IDX_HANDLERS
    DOC_ROUTES --> DOC_HANDLERS
    SEARCH_ROUTES --> SEARCH_HANDLERS
    
    IDX_HANDLERS --> ERROR_HANDLER
    DOC_HANDLERS --> ERROR_HANDLER
    SEARCH_HANDLERS --> ERROR_HANDLER
    
    IDX_HANDLERS --> OS_CLIENT
    DOC_HANDLERS --> OS_CLIENT
    SEARCH_HANDLERS --> OS_CLIENT
```

## Data Flow

### Document Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as DocumentEditor UI
    participant SVC as DocumentService
    participant API as API Routes
    participant OS as OpenSearch
    
    User->>UI: Click "Create Document"
    UI->>UI: Open editor modal
    User->>UI: Fill in document fields
    User->>UI: Click "Save"
    
    UI->>SVC: createDocument(index, document)
    SVC->>API: POST /api/indices/{index}/documents
    
    API->>API: Validate input
    API->>OS: Index document
    OS-->>API: Document created
    API-->>SVC: Success response
    SVC-->>UI: Return created document
    UI-->>User: Show success message
    UI->>UI: Refresh document list
```

### Document Update Flow with Nested Fields

```mermaid
sequenceDiagram
    participant User
    participant FE as FieldEditor
    participant DE as DocumentEditor
    participant SVC as DocumentService
    participant API as API Routes
    participant UTIL as Field Utils
    participant OS as OpenSearch
    
    User->>FE: Edit nested field
    FE->>UTIL: flattenFieldPath(path, value)
    UTIL-->>FE: Return flattened structure
    FE->>DE: onChange(flattenedFields)
    DE->>DE: Merge with existing document
    
    User->>DE: Click "Save"
    DE->>SVC: updateDocument(index, id, document)
    SVC->>API: PUT /api/indices/{index}/documents/{id}
    
    API->>API: Validate document structure
    API->>API: Check index mapping compatibility
    API->>OS: Update document
    OS-->>API: Update result
    API-->>SVC: Success response
    SVC-->>DE: Return updated document
    DE-->>User: Show success message
```

### Index Selection Flow

```mermaid
sequenceDiagram
    participant User
    participant IS as IndexSelector
    participant IDX_SVC as IndexService
    participant API as API Routes
    participant OS as OpenSearch
    
    User->>IS: Open dropdown
    IS->>IDX_SVC: getIndices()
    IDX_SVC->>API: GET /api/indices
    API->>OS: GET /_cat/indices
    OS-->>API: List of indices
    API-->>IDX_SVC: Return indices
    IDX_SVC-->>IS: Display indices
    
    User->>IS: Select index
    IS->>IS: Update selected index state
    IS->>IDX_SVC: getMapping(index)
    IDX_SVC->>API: GET /api/indices/{index}/mapping
    API->>OS: GET /{index}/_mapping
    OS-->>API: Index mapping
    API-->>IDX_SVC: Return mapping
    IS->>IS: Emit onChange event
```

## API Documentation

### REST API Endpoints

#### Index Operations

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | `/api/opensearch_index_manager/indices` | List all indices | - | `IndexListResponse` |
| GET | `/api/opensearch_index_manager/indices/{index}/mapping` | Get index mapping | - | `IndexMappingResponse` |
| GET | `/api/opensearch_index_manager/indices/{index}/settings` | Get index settings | - | `IndexSettingsResponse` |

#### Document Operations

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/opensearch_index_manager/indices/{index}/documents` | List documents | Query params: `from`, `size`, `search` | `DocumentListResponse` |
| GET | `/api/opensearch_index_manager/indices/{index}/documents/{id}` | Get document | - | `DocumentResponse` |
| POST | `/api/opensearch_index_manager/indices/{index}/documents` | Create document | `CreateDocumentRequest` | `DocumentResponse` |
| PUT | `/api/opensearch_index_manager/indices/{index}/documents/{id}` | Update document | `UpdateDocumentRequest` | `DocumentResponse` |
| DELETE | `/api/opensearch_index_manager/indices/{index}/documents/{id}` | Delete document | - | `DeleteResponse` |

#### Search Operations

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/opensearch_index_manager/indices/{index}/search` | Search with DSL | `SearchRequest` | `SearchResponse` |
| POST | `/api/opensearch_index_manager/indices/{index}/query` | Simple query | `QueryRequest` | `SearchResponse` |

### Type Definitions

```typescript
// Document Types
interface Document {
  _id: string;
  _index: string;
  _source: Record<string, unknown>;
  _version?: number;
}

interface DocumentListResponse {
  documents: Document[];
  total: number;
  took: number;
}

// Index Types
interface Index {
  name: string;
  health: 'green' | 'yellow' | 'red';
  status: 'open' | 'close';
  docsCount: number;
  storeSize: string;
}

interface IndexMapping {
  properties: Record<string, MappingProperty>;
}

interface MappingProperty {
  type: string;
  properties?: Record<string, MappingProperty>;
  fields?: Record<string, MappingProperty>;
}

// Request/Response Types
interface CreateDocumentRequest {
  document: Record<string, unknown>;
  id?: string;
}

interface SearchRequest {
  query: QueryDsl;
  from?: number;
  size?: number;
  sort?: SortOptions[];
}

interface SearchResponse {
  hits: {
    total: { value: number; relation: string };
    hits: Document[];
  };
  took: number;
  timed_out: boolean;
}
```

## Plugin Integration Points

### Required Plugins

The plugin depends on the following OSD core plugins:

| Plugin | Purpose | Usage |
|--------|---------|-------|
| `navigation` | Side navigation | Register plugin in left sidebar |
| `data` | Data services | Search capabilities, index patterns |

### Optional Plugins

| Plugin | Purpose | Usage |
|--------|---------|-------|
| `securityDashboards` | Security integration | Respect user permissions |
| `dataSource` | Multi-data source | Support for multiple OpenSearch clusters |

### Required Bundles

| Bundle | Purpose |
|--------|---------|
| `opensearchDashboardsUtils` | OSD utilities |
| `opensearchDashboardsReact` | React components and hooks |

### Integration Diagram

```mermaid
graph TB
    subgraph "OpenSearch Index Manager"
        PLUGIN[Plugin]
    end
    
    subgraph "Required Plugins"
        NAV[navigation]
        DATA[data]
    end
    
    subgraph "Optional Plugins"
        SEC[securityDashboards]
        DS[dataSource]
    end
    
    subgraph "Required Bundles"
        UTILS[opensearchDashboardsUtils]
        REACT[opensearchDashboardsReact]
    end
    
    PLUGIN --> NAV
    PLUGIN --> DATA
    PLUGIN -.-> SEC
    PLUGIN -.-> DS
    PLUGIN --> UTILS
    PLUGIN --> REACT
```

## Security Architecture

### Authentication & Authorization

The plugin relies on OSD's built-in security mechanisms:

```mermaid
graph LR
    subgraph "Security Flow"
        USER[User]
        OSD[OpenSearch Dashboards]
        PLUGIN[Plugin]
        OS[OpenSearch]
    end
    
    USER -->|Authenticate| OSD
    OSD -->|Verify Token| OS
    OSD -->|Forward Request| PLUGIN
    PLUGIN -->|With User Context| OS
```

### Security Measures

1. **Input Validation**: All API inputs are validated using schemas
2. **Output Sanitization**: All outputs are sanitized to prevent XSS
3. **Error Handling**: Error messages don't leak sensitive information
4. **CSRF Protection**: Handled by OSD framework
5. **CORS**: Configured through OSD settings

### Permission Model

The plugin respects OpenSearch index-level permissions:

| Operation | Required Permission |
|-----------|---------------------|
| List indices | `indices:monitor/stats` |
| Read documents | `read` on index |
| Write documents | `write` on index |
| Delete documents | `delete` on index |

## Performance Considerations

### Client-Side Optimizations

1. **Virtual Scrolling**: For large document lists
2. **Debounced Search**: Search input debounced to reduce API calls
3. **Lazy Loading**: Components loaded on demand
4. **Memoization**: React.memo for expensive renders
5. **Pagination**: Server-side pagination for large datasets

### Server-Side Optimizations

1. **Query Optimization**: Efficient OpenSearch queries
2. **Caching**: Mapping information cached where appropriate
3. **Batch Operations**: Bulk operations where supported
4. **Connection Pooling**: Reuse OpenSearch connections

### Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Initial Load | < 2s | TBD |
| Document List (100 docs) | < 500ms | TBD |
| Document Save | < 1s | TBD |
| Search Response | < 500ms | TBD |

### Scalability Considerations

```mermaid
graph TB
    subgraph "Scalability Factors"
        DOC_COUNT[Document Count]
        FIELD_DEPTH[Field Nesting Depth]
        INDEX_COUNT[Index Count]
        CONCURRENT[Concurrent Users]
    end
    
    subgraph "Mitigations"
        PAGINATION[Pagination]
        LAZY_LOAD[Lazy Loading]
        CACHING[Caching]
        RATE_LIMIT[Rate Limiting]
    end
    
    DOC_COUNT --> PAGINATION
    FIELD_DEPTH --> LAZY_LOAD
    INDEX_COUNT --> CACHING
    CONCURRENT --> RATE_LIMIT
```

## Data Models

### Document Model

```mermaid
classDiagram
    class Document {
        +string _id
        +string _index
        +number _version
        +object _source
        +Date created
        +Date updated
    }
    
    class FieldValue {
        +string path
        +any value
        +string type
        +boolean isNested
        +boolean isArray
    }
    
    class DocumentEdit {
        +string index
        +string id
        +FieldValue[] changes
        +Date timestamp
    }
    
    Document --> FieldValue
    DocumentEdit --> FieldValue
```

### Index Model

```mermaid
classDiagram
    class Index {
        +string name
        +string health
        +string status
        +number docsCount
        +string storeSize
    }
    
    class IndexMapping {
        +string index
        +MappingProperty properties
        +Date retrieved
    }
    
    class MappingProperty {
        +string type
        +MappingProperty properties
        +MappingProperty fields
        +boolean isNested
    }
    
    Index --> IndexMapping
    IndexMapping --> MappingProperty
```

---

*This architecture documentation is maintained alongside the codebase. For the most current information, refer to the source code and inline documentation.*