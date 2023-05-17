export interface Dhis2SingularDataset {
  dataSet: string;
  completeDate: string;
  period: string;
  orgUnit: string;
  dataValues: DataValue[];
}

export interface DataValue {
  dataElement: string;
  categoryOptionCombo: string;
  value: string;
  comment: string;
}
