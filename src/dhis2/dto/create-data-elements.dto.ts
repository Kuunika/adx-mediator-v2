export class CreateDataElementsDto {
  description: string;
  values: Array<DataElementValue>;
}

export interface DataElementValue {
  value: number;
  dataElementCode: string;
  organizationUnitCode: string;
  period: string;
}
