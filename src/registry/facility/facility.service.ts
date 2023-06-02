import { HttpService } from '@nestjs/axios';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { LoggingService } from '../../logging/logging.service';
import { Facility } from '../../common/types/facility';
import { writeFile, readFile } from 'fs/promises';

@Injectable()
export class FacilityService implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly log: LoggingService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  onModuleInit() {
    //TODO: This is hardcoded for now, but should be configurable
    this.getFacilities('openlmis').then(() => {
      this.log.info('OpenLMIS Facilities Cache initialized');
    });
    this.getFacilities('dhamis').then(() => {
      this.log.info('DHAMIS Facilities Cache initialized');
    });
    this.getFacilities('mhfr').then(() => {
      this.log.info('MHFR Facilities Cache initialized');
    });
  }

  async getFacilities(client: string): Promise<Map<string, string>> {

    //TODO: Refactor Method is getting verbose
    // Checks the cache if the specific clients is already cached, otherwise returns the default MHFR (if cache is not stale)
    let cachedFacilities = await this.cacheManager.get(client);

    if (cachedFacilities === null) {
      cachedFacilities = await this.cacheManager.get('mhfr');
    }

    if (cachedFacilities !== undefined && cachedFacilities !== null) {
      this.log.info(`Using cached facilities for ${client}`);
      return cachedFacilities;
    }
    const facilities = new Map<string, string>();
    let data: Facility[];
    try {
      const res = await lastValueFrom(
        this.httpService.get<Facility[]>(
          this.config.getOrThrow<string>('MASTER_HEALTH_REGISTRY_URL'),
        ),
      );
      data = res.data;
      await writeFile(
        `${process.cwd()}/facilities/facilities.json`,
        JSON.stringify(data),
      );
    } catch (error) {
      this.log.error(
        "Couldn't fetch facilities from master health registry, now reading from backup file",
      );
      try {
        const file = await readFile(
          `${process.cwd()}/facilities/facilities.json`,
          'utf8',
        );
        data = JSON.parse(file);
      } catch (error) {
        this.log.error('Failed to read backup file, exiting...');
        process.exit(1);
      }
    }

    for (const facility of data) {
      const { facility_code_mapping } = facility;
      const dhis2 = facility_code_mapping.find(
        (mapping) => mapping.system === 'DHIS2',
      );

      if (client === 'mhfr' && dhis2) {
        facilities.set(facility.facility_code, dhis2.code);
        continue;
      }

      if (facility_code_mapping && facility_code_mapping.length > 0) {
        const clientSystem = facility_code_mapping.find(
          (mapping) => mapping.system.toLowerCase() === client.toLowerCase(),
        );

        if (clientSystem !== undefined && dhis2 !== undefined) {
          facilities.set(clientSystem.code, dhis2.code);
        }
      }
    }
    await this.cacheManager.set(client, facilities, {
      ttl: 60 * 60 * 24,
    });

    this.log.info(`Cached facilities for ${client}, ${facilities.size} found`);
    return facilities;
  }
}
