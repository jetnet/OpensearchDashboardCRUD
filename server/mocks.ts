
// import { SavedObjectsClientContract } from 'opensearch-dashboards/server';

export interface OpenSearchClient {
  indices: {
    exists: (params: any) => Promise<any>;
    create: (params: any) => Promise<any>;
  };
  index: (params: any) => Promise<any>;
  search: (params: any) => Promise<any>;
  update: (params: any) => Promise<any>;
  delete: (params: any) => Promise<any>;
}

export interface PluginInitializerContext {
    logger: {
        get: () => Logger;
    }
}
export interface CoreSetup {
  http: {
    createRouter: () => IRouter;
  };
  getStartServices: () => Promise<[CoreStart, any, any]>;
  opensearch: {
    client: {
      asInternalUser: OpenSearchClient;
    };
  };
  application: {
    register: (params: any) => void;
  };
}
export interface CoreStart {
  http: {
    get: (path: string) => Promise<any>;
    post: (path: string, body: any) => Promise<any>;
    put: (path: string, body: any) => Promise<any>;
    delete: (path: string) => Promise<any>;
  };
  chrome: ChromeStart;
  overlays: any;
  notifications: any;
  savedObjects: any;
}
export interface Plugin<T = any, U = any> {
  setup: (core: CoreSetup) => T;
  start: (core: CoreStart) => U;
}
export interface IRouter {
  get: (params: { path: any; validate: any }, handler: any) => any;
  post: (params: { path: any; validate: any }, handler: any) => any;
  put: (params: { path: any; validate: any }, handler: any) => any;
  delete: (params: { path: any; validate: any }, handler: any) => any;
}

export const schema = {
  object: (params: any) => params,
  string: () => ({}),
  maybe: (params: any) => params,
  any: () => ({}),
};

export const Logger = {
    info: (msg: string) => {},
    warn: (msg: string) => {},
    error: (msg: string) => {},
}

export interface RequestHandlerContext {}
export interface OpenSearchDashboardsRequest {
    params: any;
    body: any;
}
export interface OpenSearchDashboardsResponseFactory {
    ok: (params: { body: any }) => any;
    internalError: (params: { body: any }) => any;
}

export interface IEntity {
    id?: string;
    name: string;
    description: string;
    type: string;
    created_at?: string;
    updated_at?: string;
}

export interface AppMountParameters {
    element: HTMLElement;
}

export interface SavedObjectsClientContract {}
export interface IUiSettingsClient {}
export interface HttpSetup {}
export interface SavedObjectsStart {}
export interface NotificationsStart {}
export interface OverlayStart {}
export interface MountPoint {}
export interface ChromeStart {
    setBreadcrumbs: (params: any) => void;
    navGroup: {
        getComponent: (params: any) => any;
    }
    docTitle: {
        change: (params: any) => void;
    }
}
export interface StartServicesAccessor<T = any, U = any, V = any> {
    (): Promise<[CoreStart, T, U]>;
}
export interface Logger {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
}
export interface CoreContext {}
export interface ApplicationSetup {}
export interface ApplicationStart {}
export interface IToasts {}
export interface KibanaRequest {}
export interface KibanaResponseFactory {}
export interface IScopedClusterClient {}
export interface RouteConfig {}
export interface OnPreAuthToolkit {}
export interface Authentication {}
export interface AuthToolkit {}
export interface AuthResult {}
export interface AppMount {}
export interface AppUnmount {}
export interface LifecycleResponseFactory {}
export interface UrlForwardingSetup {}
export interface UrlForwardingStart {}
export interface DocLinksStart {}
export interface ToastsSetup {}
export interface ToastsStart {}
export interface ChromeBrand {}
export interface ChromeHelpExtension {}
export interface ChromeBreadcrumb {}
export interface ChromeNavGroup {}
export interface ChromeNavControl {}
export interface ChromeDocTitle {}
export interface ChromeBadge {}
export interface EuiTableFieldDataColumnType<T> {}
export interface EuiTableSortingType<T> {}
export interface CoreSystem {}
export interface SavedObjectsFindOptions {}
export interface SavedObject<T = any> {}
export interface SavedObjectsBaseOptions {}
export interface MutateObjectOptions {}
export interface SavedObjectsBulkCreateObject {}
export interface SavedObjectsBulkUpdateObject {}
export interface SavedObjectsBulkResponse {}
export interface SavedObjectsUpdateResponse {}
export interface SavedObjectsCreateOptions {}
export interface SavedObjectsDeleteOptions {}
export interface SavedObjectsError {}
export interface SimpleSavedObject<T = any> {}
export interface SavedObjectReference {}
export interface SavedObjectsImportResponse {}
export interface SavedObjectsImportOptions {}
export interface SavedObjectsResolveImportErrorsOptions {}
export interface SavedObjectsExportOptions {}
export interface SavedObjectsCheckConflictsOptions {}
export interface SavedObjectsCheckConflictsResponse {}
export interface SavedObjectsImportResponseDetail {}
export interface SavedObjectsImportError {}
export interface SavedObjectsImportRetry {}
export interface SavedObjectsImportUnknownError {}
export interface SavedObjectsImportUnsupportedTypeError {}
export interface SavedObjectsImportMissingReferencesError {}
export interface SavedObjectsImportAmbiguousConflictError {}
export interface SavedObjectsImportConflictError {}
export interface SavedObjectsSerializer {}
export interface SavedObjectsRawDoc {}
export interface SavedObjectsSchema {}
export interface SavedObjectsService {}
export interface SavedObjectsRepository {}
export interface SavedObjectsType {}
export interface SavedObjectMigrationMap {}
export interface SavedObjectMigrationFn {}
export interface SavedObjectMigrationContext {}
export interface SavedObjectSanitizedDoc {}
export interface SavedObjectUnsanitizedDoc {}
export interface SavedObjectConfig {}
export interface SavedObjectsMigrationLogger {}
export interface SavedObjectsMigrationVersion {}
export interface SavedObjectsBatchResponse {}
export interface SavedObjectsFindResponse {}
export interface SavedObjectsClient {}
export interface SavedObjectsClientProvider {}
export interface SavedObjectsClientFactory {}
export interface SavedObjectsClientWrapperFactory {}
export interface SavedObjectsClientWrapper {}
// export interface SavedObjectsClientContract {}
export interface SavedObjectsManagementDefinition {}
export interface SavedObjectsManagementAction {}
export interface SavedObjectsManagementRecord {}
export interface SavedObjectsManagementColumn {}
export interface SavedObjectsManagementFilter {}
export interface SavedObjectsManagementNamespace {}
export interface SavedObjectsManagementDefinition {}
export interface UiSettingsState {}
export interface ImageValidation {}
export interface UiSettingsClientContract {}
export interface ChromeRegistration {}
export interface ChromeRecentlyAccessed {}
export interface ChromeNavControls {}
export interface ChromeDocTitleUpdate {}
export interface ChromeBreadcrumbUpdate {}
export interface ChromeHelpSupportUrl {}
export interface ChromeHelpExtensionConfig {}
export interface ChromeBadgeConfig {}
export interface ChromeBrandConfig {}
export interface ChromeBreadcrumbConfig {}
export interface ChromeNavGroupConfig {}
export interface ChromeNavControlConfig {}
export interface ChromeDocTitleConfig {}
export interface ChromeBase {}
export interface ChromeApplication {}
export interface ChromeUser {}
export interface ChromeHelpExtension {}
export interface ChromeBadge {}
export interface ChromeBreadcrumb {}
export interface ChromeNavGroup {}
export interface ChromeNavControl {}
export interface ChromeDocTitle {}
export interface ChromeBrand {}
export interface ChromeHelpExtension {}
export interface ChromeBreadcrumb {}
export interface ChromeNavGroup {}
