declare module 'openhim-mediator-utils' {
  export interface MediatorConfiguration {
    urn: string;
    version: string;
    name: string;
    description: string;
    defaultChannelConfig: DefaultChannelConfig[];
    endpoints: Route[];
    configDefs?: ConfigDef[];
  }

  export type CommunicationMedium = 'http' | 'tcp' | 'tls' | 'polling';
  export type AuthType = 'private' | 'public';
  export type HttpMethod =
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH';
  //TODO: Add the other types
  export type ConfigDefType = 'struct';
  //TODO: Add the other types
  export type ConfigDefTemplateType = 'string' | 'password' | number;

  export interface DefaultChannelConfig {
    name: string;
    urlPattern: string;
    routes: Route[];
    allow: string[];
    methods: HttpMethod[];
    type: CommunicationMedium;
    authType?: AuthType;
  }

  export interface Route {
    name: string;
    host: string;
    path: string;
    port: number;
    primary: true;
    type: CommunicationMedium;
  }

  export interface ConfigDef {
    param: string;
    displayName: string;
    description: string;
    type: 'struct';
    array: false;
    template: ConfigDefTemplate[];
  }

  export interface ConfigDefTemplate {
    // TODO: Validate - Not spaces are allowed
    param: string;
    displayName: string;
    description: string;
    type: ConfigDefTemplateType;
  }

  export interface OpenhimConfiguration {
    username: string;
    password: string;
    apiURL: string;
    trustSelfSigned: boolean;
    urn: string;
  }

  //TODO: Come up with better naming for the types
  export type Callback<T> = (arg: Error | T) => void;
  type FetchConfigCallBack<T> = (err: Error, initialConfig: T) => void;

  export function registerMediator(
    openhimConfig: OpenhimConfiguration,
    mediatorConfig: MediatorConfiguration,
    callback: Callback,
  ): void;

  export function activateHeartbeat<T>(
    openhimConfig: OpenhimConfiguration,
    interval: number,
  ): {
    on: (eventName: string, callback: Callback<T>) => void;
  };

  export function fetchConfig<T>(
    openhimConfig: OpenhimConfiguration,
    callback: FetchConfigCallBack<T>,
  ): void;
}
