import { config } from 'dotenv';
import {
  MediatorConfiguration,
  ConfigDef,
  DefaultChannelConfig,
  Route,
} from 'openhim-mediator-utils';
config();

export class MediatorConfigBuilder {
  private mediatorConfig: MediatorConfiguration;
  private PORT: number;
  private URL_PREFIX: string;
  private name: string;
  private HOST: string;

  constructor() {
    const { PORT, URL_PREFIX, HOST } = process.env;
    this.HOST = HOST;
    this.PORT = +PORT;
    this.URL_PREFIX = URL_PREFIX;

    const version = process.env.npm_package_version;
    const name = process.env.npm_package_name;
    const description =
      'Aggregate Data Exchange for Migrating Logistics Data to National HIMS';
    this.name = name;
    this.mediatorConfig = {
      defaultChannelConfig: null,
      description,
      endpoints: null,
      name,
      version,
      urn: `urn:mediator:${name}`,
      configDefs: null,
    };
  }

  build() {
    if (
      this.mediatorConfig.defaultChannelConfig === null ||
      this.mediatorConfig.endpoints === null
    ) {
      this.setDefaults();
    }
    return this.mediatorConfig;
  }

  private setDefaults() {
    this.mediatorConfig.defaultChannelConfig = [
      {
        name: this.name,
        urlPattern: `^/${this.URL_PREFIX}.*$`,
        routes: [
          {
            name: this.name,
            host: this.HOST,
            path: '',
            port: this.PORT,
            primary: true,
            type: 'http',
          },
        ],
        //This is a naive way of doing things and most likely will require a redesign, could be added from the .env file
        allow: [],
        //This is a naive way of doing things and most likely will require a redesign, Could Read this from .ENV
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        type: 'http',
      },
    ];
    this.mediatorConfig.endpoints = [
      {
        name: this.name,
        host: this.HOST,
        path: '',
        port: this.PORT,
        primary: true,
        type: 'http',
      },
    ];
  }

  setEndpoints(routes: Route[]) {
    this.mediatorConfig.endpoints = routes;
    return this;
  }

  setDefaultChannelConfig(defaultChannel: DefaultChannelConfig[]) {
    this.mediatorConfig.defaultChannelConfig = defaultChannel;
    return this;
  }

  setConfigDefs(configDefs: ConfigDef[]) {
    this.mediatorConfig.configDefs = configDefs;
    return this;
  }
}
