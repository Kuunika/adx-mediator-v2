import { Injectable } from '@nestjs/common';
import {
  ReportedDataElement,
  ReportedDataElementsPayload,
  CompletedDataSet,
  DataValue,
} from '../common/types';
import { AdxMigrationPayloadDto } from '../common/dtos';
import { FacilityService } from '../registry/facility/facility.service';
import { LoggingService } from '../logging/logging.service';
import moment from "moment"

@Injectable()
export class TransformerService {
  constructor(
    private readonly facilityService: FacilityService,
    private readonly log: LoggingService,
  ) { }

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

    const completedDataSet = adxDataElements.facilities.reduce(
      (acc: CompletedDataSet[], facility) => {
        const currentIterationsFacility = facilities.get(
          facility['facility-code'],
        );
        if (currentIterationsFacility) {
          const dataValues: DataValue[] = facility.values.map(
            (reportedValues) => {
              return {
                categoryOptionCombo: reportedValues['category-option-combo'],
                comment: 'ADX Data Submission',
                value: reportedValues.value,
                dataElement: reportedValues['data-element'],
              };
            },
          );
          return [
            ...acc,
            {
              orgUnit: facilities.get(facility['facility-code']),
              // completeDate: adxDataElements['reporting-period'],
              completeDate: moment().format('YYYY-MM-DD'),
              period: adxDataElements['reporting-period'],
              dataSet: adxDataElements['data-set'],
              dataValues,
            },
          ];
        }

        this.log.warn(`Facility Not Found with associated DHIS2 Code`, {
          facilityCode: facility['facility-code'],
        });
        return acc;
      },
      [],
    );

    return completedDataSet;
  }
}
