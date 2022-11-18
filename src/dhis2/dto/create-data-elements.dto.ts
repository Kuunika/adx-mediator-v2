export interface CreateDataElementsDto {
  description: string;
  facilities: Array<Facility>;
  'reporting-period': string;
}

interface Facility {
  values: Array<DataElementValue>;
  'facility-code': string;
}

interface DataElementValue {
  value: number;
  'product-code': string;
}
