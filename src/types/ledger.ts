export type SqlServerDataType = 
  | 'INT'
  | 'BIGINT'
  | 'SMALLINT'
  | 'DECIMAL(18,2)'
  | 'DECIMAL(18,0)'
  | 'DECIMAL(10,2)'
  | 'FLOAT'
  | 'NVARCHAR(50)'
  | 'NVARCHAR(150)'
  | 'NVARCHAR(255)'
  | 'NVARCHAR(MAX)'
  | 'VARCHAR(100)'
  | 'DATE'
  | 'DATETIME2'
  | 'BIT'
  | (string & {});

export interface ColumnDefinition {
  id: string;
  name: string;
  labelAr: string;
  dataType: SqlServerDataType;
  isNullable: boolean;
  isPrimaryKey?: boolean;
  isIdentity?: boolean;
  description?: string;
  sampleValue?: string;
}

export interface TableDefinition {
  id: string;
  name: string;
  schemaName: string; // e.g. 'dbo'
  descriptionAr: string;
  columns: ColumnDefinition[];
}

export interface ExtractedCell {
  columnName: string;
  value: any;
  rawValue?: string;
  confidence: number; // 0 to 1
  isFlagged?: boolean;
  flagReason?: string;
}

export interface ExtractedRow {
  id: string;
  rowNumber: number;
  cells: Record<string, ExtractedCell>;
  rawLineText?: string;
  confidence: number;
  status: 'valid' | 'warning' | 'error';
  isExcluded?: boolean;
}

export interface ExtractionResult {
  tableName: string;
  totalRows: number;
  confidenceAverage: number;
  rows: ExtractedRow[];
  notes?: string;
  detectedHeaders?: string[];
  summaryFound?: string;
}

export interface SqlServerConfig {
  server: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  trustServerCertificate: boolean;
  encrypt: boolean;
}

export interface PresetLedger {
  id: string;
  titleAr: string;
  descriptionAr: string;
  table: TableDefinition;
  sampleImage: string; // Base64 or SVG data URI
  suggestedNotes: string;
}

export interface DatabaseSyncStatus {
  databaseName: string;
  totalTables: number;
  totalLocalRecords: number;
  pendingSyncCount: number;
  lastSyncTime: string | null;
  isDbConnected: boolean;
}

