import { Injectable } from '@nestjs/common';
import { AdxMigrationPayloadDto } from '../common/dtos';
import { ReportedDataElement } from '../common/types/reported-data-element';
import * as _ from 'lodash';
import { FacilityService } from '../registry/facility/facility.service';
import { ProductService } from '../registry/product/product.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ValidationService {
  constructor(
    private readonly facilityService: FacilityService,
    private readonly productService: ProductService,
    private readonly config: ConfigService,
  ) {}

  async validate(payload: AdxMigrationPayloadDto, client: string) {
    const facilities = await this.facilityService.getFacilities(client);
    const products = await this.productService.getProducts(client);

    const missingFacilities = new Set<string>();
    const missingProducts = new Set<string>();

    const dhis2Payload: ReportedDataElement[] = [];

    //TODO: this need to be better segmented to make it more readable
    payload.facilities.forEach((facility) => {
      const orgUnit = facilities.get(facility['facility-code']);
      if (orgUnit) {
        facility.values.forEach((value) => {
          const dataElement = products.get(value['product-code']);
          if (dataElement) {
            dhis2Payload.push({
              orgUnit,
              dataElement,
              value: value.value,
              period: payload['reporting-period'],
            });
          } else {
            missingProducts.add(value['product-code']);
          }
        });
      } else {
        missingFacilities.add(facility['facility-code']);
      }
    });

    const CHUNK_SIZE = this.config.get<number>('CHUNK_SIZE') ?? 1_500;

    return {
      payload: _.chunk(dhis2Payload, CHUNK_SIZE),
      totalNumberOfValidatedProducts: dhis2Payload.length,
      missingProducts: [...missingProducts].sort(),
      missingFacilities: [...missingFacilities].sort(),
    };
  }
}
