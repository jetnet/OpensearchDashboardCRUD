// Type stubs for opensearch-dashboards/public
// These are minimal stubs to allow compilation

declare module 'opensearch-dashboards/public' {
  export interface PluginInitializerContext {
    config: {
      get<T>(): T;
    };
    logger: {
      get(name: string): Logger;
    };
  }
  
  export interface Logger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
  }
  
  export interface CoreSetup {
    http: {
      createRouter(): Router;
    };
  }
  
  export interface CoreStart {}
  
  export interface PluginSetup {}
  export interface PluginStart {}
  
  export interface Plugin<TSetup = void, TStart = void> {
    setup(core: CoreSetup, plugins: PluginSetup): TSetup | Promise<TSetup>;
    start(core: CoreStart, plugins: PluginStart): TStart | Promise<TStart>;
    stop(): void;
  }
  
  export interface Router {
    get<RouteContext>(options: RouteOptions, handler: RouteHandler<RouteContext>): void;
    post<RouteContext>(options: RouteOptions, handler: RouteHandler<RouteContext>): void;
    put<RouteContext>(options: RouteOptions, handler: RouteHandler<RouteContext>): void;
    delete<RouteContext>(options: RouteOptions, handler: RouteHandler<RouteContext>): void;
  }
  
  export interface RouteOptions {
    path: string;
    validate?: any;
    options?: {
      body?: any;
    };
  }
  
  export type RouteHandler<RouteContext> = (
    context: RouteContext,
    request: any,
    response: any
  ) => any;
  
  export interface HttpServiceSetup {
    createRouter(): Router;
  }
}

declare module 'opensearch-dashboards/server' {
  export interface PluginInitializerContext {
    config: {
      get<T>(): T;
    };
    logger: {
      get(name: string): Logger;
    };
  }
  
  export interface Logger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
  }
  
  export interface CoreSetup {
    http: {
      createRouter(): Router;
    };
    opensearch: {
      client: {
        asScoped(request: any): {
          asCurrentUser: OpenSearchClient;
        };
      };
    };
  }
  
  export interface CoreStart {
    opensearch: {
      client: {
        asScoped(request: any): {
          asCurrentUser: OpenSearchClient;
        };
      };
    };
  }
  
  export interface PluginSetup {}
  export interface PluginStart {}
  
  export interface Plugin<TSetup = void, TStart = void> {
    setup(core: CoreSetup, plugins: PluginSetup): TSetup | Promise<TSetup>;
    start(core: CoreStart, plugins: PluginStart): TStart | Promise<TStart>;
    stop(): void;
  }
  
  export interface Router {
    get<RouteContext>(options: RouteOptions, handler: RouteHandler<RouteContext>): void;
    post<RouteContext>(options: RouteOptions, handler: RouteHandler<RouteContext>): void;
    put<RouteContext>(options: RouteOptions, handler: RouteHandler<RouteContext>): void;
    delete<RouteContext>(options: RouteOptions, handler: RouteHandler<RouteContext>): void;
  }
  
  export interface RouteOptions {
    path: string;
    validate?: any;
    options?: {
      body?: any;
    };
  }
  
  export type RouteHandler<RouteContext> = (
    context: RouteContext,
    request: any,
    response: any
  ) => any;
  
  export interface OpenSearchClient {
    indices: {
      exists(params: { index: string }): Promise<{ body: { exists: boolean } }>;
      create(params: { index: string, body?: any }): Promise<any>;
      delete(params: { index: string }): Promise<any>;
    };
    index(params: { index: string, body: any, id?: string }): Promise<any>;
    get(params: { index: string, id: string }): Promise<any>;
    update(params: { index: string, id: string, body: any }): Promise<any>;
    delete(params: { index: string, id: string }): Promise<any>;
    search(params: { index: string, body?: any, size?: number, from?: number }): Promise<any>;
    mget(params: { index: string, body: { ids: string[] } }): Promise<any>;
    bulk(params: { body: any[] }): Promise<any>;
    count(params: { index: string, body?: any }): Promise<any>;
  }
  
  export interface HttpServiceSetup {
    createRouter(): Router;
  }
  
  export interface ResponseError {
    error: string;
    message: string;
    statusCode: number;
  }
  
  export interface CustomHttpResponseOptions<T = any> {
    body?: T;
    statusCode?: number;
    headers?: Record<string, string>;
  }
}

declare module 'src/plugins/data/public' {
  export interface IDataPluginServices {
    search: any;
    query: any;
  }
}

declare module 'src/plugins/data/server' {
  export interface IDataPluginServices {
    search: any;
    query: any;
  }
}

declare module 'src/plugins/navigation/public' {
  export interface INavigationPluginServices {
    ui: any;
  }
}

declare module 'src/plugins/navigation/server' {
  export interface INavigationPluginServices {
    ui: any;
  }
}
