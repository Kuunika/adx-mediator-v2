export interface CompletedDataSet {
  completeDate: string;
  period: string;
  dataSet: string;
  orgUnit: string;
  dataValues: DataValue[];
}

export interface DataValue {
  categoryOptionCombo: string;
  comment: string;
  value: number;
  dataElement: string;
}
