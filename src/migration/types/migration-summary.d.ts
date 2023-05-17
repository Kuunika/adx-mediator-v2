import { ImportCount, Conflict } from '../../dhis2/types/migration-summary';
export interface MigrationSummary {
  importCount: ImportCount;
  conflicts: Conflict[];
  transactionId: string;
}
