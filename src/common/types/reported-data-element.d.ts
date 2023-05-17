export interface ReportedDataElement {
  dataElement: string;
  value: number;
  orgUnit: string;
  period: string;
}

export interface ReportedDataElementsPayload {
  dataValues: ReportedDataElement[];
}
