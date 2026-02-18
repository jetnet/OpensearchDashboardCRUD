// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

// ============================================================
// Index Types
// ============================================================

export interface IndexInfo {
  index: string;
  health: "green" | "yellow" | "red";
  status: "open" | "close";
  "docs.count": string;
  "store.size": string;
  [key: string]: string;
}

export interface IndexStats {
  index: string;
  primaries: {
    docs: {
      count: number;
      deleted: number;
    };
    store: {
      size_in_bytes: number;
    };
  };
}

export interface IndexSettings {
  [key: string]: any;
}

// ============================================================
// Mapping Types
// ============================================================

export interface MappingProperty {
  type?: string;
  analyzer?: string;
  format?: string;
  properties?: Record<string, MappingProperty>;
  fields?: Record<string, MappingProperty>;
  ignore_above?: number;
  coerce?: boolean;
  doc_values?: boolean;
  index?: boolean;
  null_value?: any;
}

export interface IndexMapping {
  [indexName: string]: {
    mappings: {
      dynamic?: boolean | "strict";
      _source?: {
        enabled?: boolean;
      };
      properties: Record<string, MappingProperty>;
    };
  };
}

// ============================================================
// Document Types
// ============================================================

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface Document {
  _id: string;
  _index: string;
  _version?: number;
  _score?: number;
  found?: boolean;
  _source: Record<string, JsonValue>;
}

export interface DocumentListResponse {
  total: number | { value: number; relation: string };
  hits: Document[];
}

export interface DocumentCreateRequest {
  id?: string;
  document: Record<string, JsonValue>;
}

export interface DocumentUpdateRequest {
  document: Record<string, JsonValue>;
}

export interface DocumentDeleteResponse {
  _id: string;
  _index: string;
  _version: number;
  result: string;
}

// ============================================================
// Search Types
// ============================================================

export interface SearchRequest {
  query: Record<string, any>;
  from?: number;
  size?: number;
  sort?: Array<Record<string, "asc" | "desc" | object>>;
  _source?: string[] | boolean;
  aggs?: Record<string, any>;
}

export interface SearchResponse {
  took: number;
  timed_out: boolean;
  hits: {
    total: number | { value: number; relation: string };
    max_score: number | null;
    hits: Document[];
  };
  aggregations?: Record<string, any>;
}

export interface SimpleQueryRequest {
  q: string;
  fields?: string[];
  from?: number;
  size?: number;
}

// ============================================================
// Field Types
// ============================================================

export enum FieldType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  NULL = "null",
  ARRAY = "array",
  OBJECT = "object",
  DATE = "date",
  GEO_POINT = "geo_point",
  IP = "ip",
  KEYWORD = "keyword",
  TEXT = "text",
  INTEGER = "integer",
  LONG = "long",
  FLOAT = "float",
  DOUBLE = "double",
  NESTED = "nested",
}

export interface FlattenedField {
  path: string;
  key: string;
  value: JsonValue;
  type: FieldType | string;
  depth: number;
  parentPath?: string;
  isArrayItem?: boolean;
  arrayIndex?: number;
  mappingType?: string; // From index mapping
}

// ============================================================
// Plugin Configuration
// ============================================================

export interface PluginConfig {
  enabled: boolean;
  maxDocumentsPerPage: number;
  defaultDocumentsPerPage: number;
  maxNestedDepth: number;
  enableRawJsonEdit: boolean;
  enableDeleteConfirmation: boolean;
}

// ============================================================
// UI State Types
// ============================================================

export interface AppState {
  selectedIndex: string | null;
  currentPage: number;
  pageSize: number;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  searchQuery: Record<string, any> | null;
  selectedDocument: Document | null;
  isEditing: boolean;
  isCreating: boolean;
}
