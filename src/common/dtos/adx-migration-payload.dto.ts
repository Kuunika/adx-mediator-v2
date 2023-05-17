export interface AdxMigrationPayloadDto {
  description: string;
  facilities: Array<Facility>;
  'reporting-period': string;
  'data-set': string;
}

interface Facility {
  values: Array<DataElementValue>;
  'facility-code': string;
}

interface DataElementValue {
  value: number;
  'product-code'?: string;
  'data-element'?: string;
  'category-option-combo'?: string;
}
