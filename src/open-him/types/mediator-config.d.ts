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
