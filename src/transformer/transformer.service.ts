import { Injectable } from '@nestjs/common';
import {
  ReportedDataElement,
  ReportedDataElementsPayload,
  CompletedDataSet,
  DataValue,
} from '../common/types';
import {} from 'src/common/types';
import { AdxMigrationPayloadDto } from '../common/dtos';
import { FacilityService } from 'src/registry/facility/facility.service';

@Injectable()
export class TransformerService {
  constructor(private readonly facilityService: FacilityService) {}

  async toReportedDataElementsPayload(
    adxDataElements: AdxMigrationPayloadDto,
  ): Promise<ReportedDataElementsPayload[]> {
    //Transform into ReportedDataElement payload by using the Facilities and Products Service

    //Chunk the data and load them into an array of Dhis2ReportedDataElementsPayload

    //Return the data

    throw new Error('Not Implemented');
    return;
  }

  async toCompletedDataSetsPayload(
    adxDataElements: AdxMigrationPayloadDto,
  ): Promise<CompletedDataSet[]> {
    //TODO: this is hard coded and need to be changed to read the appropriate facilities list based on who the client is
    const facilities = await this.facilityService.getFacilities('mhfr');
    return adxDataElements.facilities.map((facility) => {
      const dataValues: DataValue[] = facility.values.map((reportedValues) => {
        return {
          categoryOptionCombo: reportedValues['category-option-combo'],
          comment: 'ADX Data Submission',
          value: reportedValues.value,
          dataElement: reportedValues['data-element'],
        };
      });
      return {
        orgUnit: facilities.get(facility['facility-code']),
        completeDate: adxDataElements['reporting-period'],
        period: adxDataElements['reporting-period'],
        dataSet: adxDataElements['data-set'],
        dataValues,
      };
    });
  }
}
