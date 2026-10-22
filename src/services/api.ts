import { ExtractionResult, SqlServerConfig, TableDefinition } from '../types/ledger';

export async function analyzeLedger(
  imageBase64: string,
  tableSchema: TableDefinition,
  customNotes?: string
): Promise<ExtractionResult> {
  const response = await fetch('/api/analyze-ledger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      tableSchema,
      customNotes,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `خطأ في الخادم: ${response.status}`);
  }

  return await response.json();
}

export async function testSqlServerConnection(config: SqlServerConfig): Promise<{
  success: boolean;
  version?: string;
  currentDb?: string;
  message?: string;
  error?: string;
}> {
  const response = await fetch('/api/sqlserver/test-connection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  return await response.json();
}

export async function fetchSqlServerTables(config: SqlServerConfig): Promise<{
  success: boolean;
  tables?: TableDefinition[];
  error?: string;
}> {
  const response = await fetch('/api/sqlserver/fetch-tables', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  return await response.json();
}

export async function executeInsertToSqlServer(
  connection: SqlServerConfig,
  tableSchema: TableDefinition,
  rows: any[]
): Promise<{
  success: boolean;
  insertedCount?: number;
  message?: string;
  error?: string;
}> {
  const response = await fetch('/api/sqlserver/execute-insert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      connection,
      tableSchema,
      rows,
    }),
  });

  return await response.json();
}

export async function parseVoiceInput(params: {
  spokenText?: string;
  audioBase64?: string;
  mimeType?: string;
}): Promise<{
  success: boolean;
  data?: {
    count: number | null;
    weight: number | null;
    name: string;
    price: number | null;
    tripName: string;
    transcript: string;
    confidence: number;
  };
  error?: string;
}> {
  const response = await fetch('/api/voice-parse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  return await response.json();
}

export function generateTSqlScript(tableSchema: TableDefinition, rows: any[]): string {
  const schema = tableSchema.schemaName || 'dbo';
  const table = tableSchema.name;
  const cols = (tableSchema.columns || []).filter((c) => !c.isIdentity);

  if (!rows || rows.length === 0 || cols.length === 0) {
    return '-- لا توجد سجلات لتوليد كود SQL';
  }

  const colList = cols.map((c) => `[${c.name}]`).join(', ');

  const valueRows = rows.map((row) => {
    const formattedValues = cols.map((col) => {
      const cellData = row.cells ? row.cells[col.name] : null;
      let val = cellData !== undefined && cellData !== null ? cellData.value : row[col.name];

      if (val === null || val === undefined || val === '') {
        return col.isNullable ? 'NULL' : col.dataType.includes('INT') || col.dataType.includes('DECIMAL') ? '0' : "N''";
      }

      const dt = col.dataType.toUpperCase();
      if (dt.includes('INT') || dt.includes('DECIMAL') || dt.includes('FLOAT') || dt.includes('NUMERIC')) {
        const num = String(val).replace(/,/g, '').trim();
        return isNaN(Number(num)) ? '0' : num;
      }

      if (dt.includes('BIT')) {
        return val === true || val === '1' || val === 1 || val === 'نعم' ? '1' : '0';
      }

      if (dt.includes('DATE')) {
        return `'${String(val).replace(/'/g, "''")}'`;
      }

      // Unicode text escaping
      const escaped = String(val).replace(/'/g, "''");
      return `N'${escaped}'`;
    });

    return `    (${formattedValues.join(', ')})`;
  });

  return `-- =======================================================================
-- كود استيراد البيانات إلى Microsoft SQL Server
-- تم استخراجه من صورة الدفتر اليدوي بواسطة الذكاء الاصطناعي
-- التاريخ: ${new Date().toLocaleDateString('ar-EG')}
-- الجدول المستهدف: [${schema}].[${table}]
-- عدد السجلات المستخرجة: ${rows.length}
-- =======================================================================

USE [${tableSchema.name ? 'اسم_قاعدة_البيانات' : 'master'}];
GO

SET NOCOUNT ON;
BEGIN TRANSACTION;

BEGIN TRY
    PRINT N'جاري إدراج السجلات في جدول [${schema}].[${table}]...';

    INSERT INTO [${schema}].[${table}] (
        ${colList}
    )
    VALUES
${valueRows.join(',\n')};

    COMMIT TRANSACTION;
    PRINT N'تم إدراج ${rows.length} سجل بنجاح!';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT N'حدث خطأ أثناء إدراج البيانات: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO
`;
}

export async function getFruit67Status(): Promise<{
  databaseName: string;
  totalTables: number;
  totalLocalRecords: number;
  pendingSyncCount: number;
  lastSyncTime: string | null;
}> {
  const res = await fetch('/api/fruit67/status');
  return await res.json();
}

export async function saveRecordsToFruit67(tableName: string, rows: any[]): Promise<{
  success: boolean;
  message: string;
  savedCount: number;
  totalLocalRecords: number;
}> {
  const res = await fetch('/api/fruit67/save-records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableName, rows }),
  });
  return await res.json();
}

export async function syncFruit67ToPc(connection: SqlServerConfig, tableName?: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  syncedCount?: number;
}> {
  const res = await fetch('/api/fruit67/sync-to-pc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connection, tableName }),
  });
  return await res.json();
}

export async function generateFruit67SyncScript(tableName?: string, onlyPending: boolean = true): Promise<{
  script: string;
  count: number;
}> {
  const res = await fetch('/api/fruit67/generate-sync-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableName, onlyPending }),
  });
  return await res.json();
}

export async function fetchFruit67TableRecords(): Promise<{
  success: boolean;
  tables: Record<string, any[]>;
  counts: Record<string, number>;
}> {
  const res = await fetch('/api/fruit67/table-records');
  return await res.json();
}

export async function voiceStepIngestFruit67(params: {
  step: 'supplier_farm' | 'category' | 'nakla' | 'sales' | 'all';
  spokenText?: string;
  audioBase64?: string;
  mimeType?: string;
  context?: {
    supplierName?: string;
    farmName?: string;
    naklaName?: string;
    catName?: string;
    catCode?: number;
    byaaa?: number;
    byaaaKhassa?: number;
  };
}): Promise<{
  success: boolean;
  step?: string;
  summary?: string;
  transcript?: string;
  stepLogs?: string[];
  recordsAddedCount?: number;
  tablesAffected?: string[];
  tSqlScript?: string;
  supplierName?: string;
  farmName?: string;
  catName?: string;
  catCode?: number;
  byaaa?: number;
  byaaaKhassa?: number;
  naklaName?: string;
  sequenceNumber?: number;
  error?: string;
}> {
  const res = await fetch('/api/fruit67/voice-step-ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return await res.json();
}

export async function voiceIngestFruit67(params: {
  spokenText?: string;
  audioBase64?: string;
  mimeType?: string;
}): Promise<{
  success: boolean;
  summary?: string;
  transcript?: string;
  stepLogs?: string[];
  recordsAddedCount?: number;
  tablesAffected?: string[];
  tSqlScript?: string;
  error?: string;
}> {
  const res = await fetch('/api/fruit67/voice-step-ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, step: 'all' }),
  });
  return await res.json();
}

export async function resetFruit67Store(): Promise<{
  success: boolean;
  message: string;
  recordsCount: number;
}> {
  const res = await fetch('/api/fruit67/reset-store', {
    method: 'POST',
  });
  return await res.json();
}
