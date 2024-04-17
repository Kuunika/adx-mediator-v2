export interface MigrationSummary {
  responseType: string;
  status: string;
  importOptions: ImportOptions;
  description: string;
  importCount: ImportCount;
  conflicts: Conflict[];
  dataSetComplete: string;
}

export interface Conflict {
  object: string;
  value: string;
}

export interface ImportCount {
  imported: number;
  updated: number;
  ignored: number;
  deleted: number;
}

export interface ImportOptions {
  idSchemes: IDSchemes;
  dryRun: boolean;
  async: boolean;
  importStrategy: string;
  mergeMode: string;
  reportMode: string;
  skipExistingCheck: boolean;
  sharing: boolean;
  skipNotifications: boolean;
  skipAudit: boolean;
  datasetAllowsPeriods: boolean;
  strictPeriods: boolean;
  strictDataElements: boolean;
  strictCategoryOptionCombos: boolean;
  strictAttributeOptionCombos: boolean;
  strictOrganisationUnits: boolean;
  requireCategoryOptionCombo: boolean;
  requireAttributeOptionCombo: boolean;
  skipPatternValidation: boolean;
  ignoreEmptyCollection: boolean;
  force: boolean;
  firstRowIsHeader: boolean;
  skipLastUpdated: boolean;
}

export interface IDSchemes { }
