import {
  registerMediator,
  activateHeartbeat,
  fetchConfig,
  MediatorConfiguration,
} from 'openhim-mediator-utils';
import { config } from 'dotenv';
import { OpenHimService } from '../open-him/open-him.service';
import { OpenHieVariable } from '../open-him/types/open-hie-variable';
import { LoggingService } from 'src/logging/logging.service';
config();

export function registerMediatorToOpenHim(
  mediatorConfig: MediatorConfiguration,
  openHieService: OpenHimService,
  log: LoggingService,
) {
  const {
    OPENHIM_USERNAME,
    OPENHIM_PASSWORD,
    OPENHIM_API_URL,
    OPENHIM_HEARTBEAT_INTERVAL,
  } = process.env;
  const openhimConfig = {
    username: OPENHIM_USERNAME,
    password: OPENHIM_PASSWORD,
    apiURL: OPENHIM_API_URL,
    trustSelfSigned: true,
    urn: mediatorConfig.urn,
  };

  registerMediator(openhimConfig, mediatorConfig, (err: Error) => {
    if (err) {
      log.error(
        `There was an issue registering the mediator, please check the mediator configurations`,
        err,
      );
      process.exit(1);
      //This is rather draconian, but I feel it is best. In development mode they would turn off the mediator registration.
    }

    fetchConfig<OpenHieVariable>(openhimConfig, (err: Error, initialConfig) => {
      if (err) {
        log.error(`Failed to Fetch Configurations: ${err}`);
        process.exit(1);
      }
      if (Object.keys(initialConfig).length > 0) {
        openHieService.setVariables(initialConfig);
        return;
      }

      log.info(
        'Initial Configuration Parameters Not Set, Please Update in Mediator Console',
      );
    });

    const openhimEmitter = activateHeartbeat<OpenHieVariable>(
      openhimConfig,
      +OPENHIM_HEARTBEAT_INTERVAL,
    );

    openhimEmitter.on('error', (err) =>
      log.error(`The heartbeat failed ${err}`),
    );
    //Change the definition of the callback function type
    openhimEmitter.on('config', (arg) => {
      const config = arg as OpenHieVariable;
      log.info('New configurations received');
      openHieService.setVariables(config);
    });
  });
}
