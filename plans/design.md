# OpenSearch Dashboards CRUD Plugin Design

## 1. Plugin Identity
- **Name:** `opensearch-dashboards-crud`
- **ID:** `osdCrud`
- **Target OSD Version:** `2.11.0`
- **Description:** A Generic Entity Management plugin allowing CRUD operations on entities stored in an OpenSearch index.

## 2. File Structure

The plugin will follow the standard OpenSearch Dashboards plugin directory structure.

```text
opensearch-dashboards-crud/
├── opensearch_dashboards.json      # Plugin manifest
├── package.json                    # Node dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── yarn.lock
├── common/                         # Shared code between server and public
│   ├── index.ts
│   └── types.ts                    # Shared interfaces (Entity, API responses)
├── server/                         # Server-side code (Node.js)
│   ├── index.ts                    # Server plugin entry point
│   ├── plugin.ts                   # Plugin class definition
│   ├── routes/                     # REST API route definitions
│   │   ├── index.ts
│   │   └── entities.ts             # CRUD routes
│   ├── services/                   # Business logic and OpenSearch interaction
│   │   └── entity_service.ts       # Service to handle OpenSearch queries
│   └── types.ts                    # Server-specific types
└── public/                         # Client-side code (Browser/React)
    ├── index.ts                    # Public plugin entry point
    ├── plugin.ts                   # Plugin class definition
    ├── application.tsx             # Main application component
    ├── components/                 # React components
    │   ├── main/
    │   │   └── main.tsx            # Main view container
    │   ├── entity_list/
    │   │   └── entity_list.tsx     # EuiBasicTable implementation
    │   └── entity_form/
    │       └── entity_flyout.tsx   # Create/Edit form in a flyout
    ├── services/                   # Frontend services
    │   └── api_client.ts           # Axios/Http client wrapper
    └── types.ts                    # Client-specific types
```

## 3. Configuration Files

### `opensearch_dashboards.json`
Defines the plugin metadata and integration points.

```json
{
  "id": "osdCrud",
  "version": "1.0.0",
  "opensearchDashboardsVersion": "2.11.0",
  "server": true,
  "ui": true,
  "requiredPlugins": ["navigation"],
  "uiExports": {
    "app": {
      "title": "Entity Management",
      "description": "Manage generic entities",
      "main": "plugins/osdCrud/app",
      "category": "management"
    }
  }
}
```

### `package.json`
Standard Node.js package file.

```json
{
  "name": "opensearch-dashboards-crud",
  "version": "1.0.0",
  "scripts": {
    "build": "plugin-helpers build",
    "plugin_helpers": "plugin-helpers",
    "kbn": "node ../../scripts/kbn"
  },
  "dependencies": {
    "uuid": "^9.0.0" 
  }
}
```

### `tsconfig.json`
Extends the base OSD configuration.

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./target",
    "sourceMap": true
  },
  "include": [
    "common/**/*",
    "server/**/*",
    "public/**/*"
  ]
}
```

## 4. Data Model & Interfaces

### Entity Interface (Common)
Located in `common/types.ts`.

```typescript
export interface IEntity {
  id?: string; // Optional for creation, required for updates/reads
  name: string;
  description?: string;
  type: string;
  created_at?: string; // ISO Date string
  updated_at?: string; // ISO Date string
}
```

### API Request/Response Interfaces (Common)
Located in `common/types.ts`.

```typescript
export interface IGetEntitiesResponse {
  total: number;
  data: IEntity[];
}

export interface IGetEntityResponse {
  data: IEntity;
}

export interface ICreateEntityRequest {
  name: string;
  description?: string;
  type: string;
}

export interface IUpdateEntityRequest extends Partial<ICreateEntityRequest> {}

export interface IDeleteEntityResponse {
  success: boolean;
  id: string;
}
```

## 5. Server-side Architecture

### Plugin Class (`server/plugin.ts`)
- **`setup(core)`**:
    - Registers the API routes.
    - Initializes the `EntityService`.
    - Creates the `.osd-crud-entities` index if it doesn't exist (using `core.opensearch.client.asCurrentUser`).
- **`start(core)`**:
    - Returns the contract to other plugins if needed.

### Routes (`server/routes/entities.ts`)
Base path: `/api/osd_crud`

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/entities` | Retrieve a paginated list of entities. Supports search/filtering. |
| GET | `/entities/{id}` | Retrieve a single entity by ID. |
| POST | `/entities` | Create a new entity. Auto-generates ID and timestamps. |
| PUT | `/entities/{id}` | Update an existing entity. Updates `updated_at`. |
| DELETE | `/entities/{id}` | Delete an entity. |

### Service Layer (`server/services/entity_service.ts`)
- **Responsibility:** Abstraction over the OpenSearch Client.
- **Dependencies:** `OpenSearchClient` (from `core.opensearch.client.asCurrentUser`).
- **Index:** `.osd-crud-entities`
- **Methods:**
    - `setupIndex()`: Checks existence via `client.indices.exists`. Creates with `client.indices.create`.
    - `search(query, pagination)`: Executes `client.search` with a `match_all` or `multi_match` query.
    - `create(entity)`: Adds UUID, `created_at`, `updated_at`. Executes `client.index`.
    - `update(id, updates)`: Updates `updated_at`. Executes `client.update`.
    - `delete(id)`: Executes `client.delete`.

## 6. Client-side Architecture

### Plugin Class (`public/plugin.ts`)
- **`setup(core)`**:
    - Registers the application with `core.application.register`.
- **`start(core)`**:
    - Mounts the React application.

### Components

#### `Main` (`public/components/main/main.tsx`)
- **Role:** Top-level container.
- **Structure:**
    - `EuiPage` -> `EuiPageBody` -> `EuiPageHeader` (Title "Entity Management", Right side "Create" button).
    - `EuiPageContent` -> `EntityList`.
    - `EntityFlyout` (conditionally rendered or always present but hidden).

#### `EntityList` (`public/components/entity_list/entity_list.tsx`)
- **Role:** Displays the data grid.
- **Components:** `EuiBasicTable`.
- **Props:** `entities`, `onEdit`, `onDelete`.
- **Columns:** Name, Description, Type, Created At, Actions (Edit/Delete).
- **Features:**
    - Pagination (using `EuiBasicTable` pagination props).
    - Sorting (using `EuiBasicTable` sorting props).
    - Search (using `EuiSearchBar`).

#### `EntityFlyout` (`public/components/entity_form/entity_flyout.tsx`)
- **Role:** Form for Create/Edit.
- **Components:** `EuiFlyout`, `EuiForm`, `EuiFieldText`, `EuiTextArea`, `EuiComboBox`, `EuiButton`.
- **Props:** `isVisible`, `onClose`, `onSubmit`, `initialData` (null for create).
- **Validation:** Simple required field checks.

### State Management (`public/application.tsx`)
- **Strategy:** React Hooks (`useState`, `useEffect`) inside the root `App` component or a custom hook `useEntities`.
- **State Variables:**
    - `entities`: Array of `IEntity`.
    - `isLoading`: Boolean.
    - `isFlyoutVisible`: Boolean.
    - `currentEntity`: `IEntity | null` (for editing).
    - `toasts`: Array for `EuiGlobalToastList`.
- **Actions:**
    - `refresh()`: Calls API GET `/entities`.
    - `handleCreate(data)`: Calls API POST -> `refresh()`.
    - `handleUpdate(id, data)`: Calls API PUT -> `refresh()`.
    - `handleDelete(id)`: Calls API DELETE -> `refresh()`.

### API Client (`public/services/api_client.ts`)
- **Role:** Wrapper around `core.http`.
- **Methods:**
    - `getEntities()`
    - `createEntity(data)`
    - `updateEntity(id, data)`
    - `deleteEntity(id)`
