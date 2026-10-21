import React, { useState } from 'react';
import { Plus, Trash2, Code2, Table, Sparkles, Check, ChevronDown, BookOpen, AlertCircle, Database } from 'lucide-react';
import { ColumnDefinition, SqlServerDataType, TableDefinition } from '../types/ledger';
import { PRESET_LEDGERS } from '../data/presetLedgers';

interface SchemaBuilderProps {
  tableSchema: TableDefinition;
  onChangeSchema: (updated: TableDefinition) => void;
  onSelectPreset: (presetId: string) => void;
  activePresetId?: string;
  onOpenFruit67Modal?: () => void;
}

const COMMON_SQL_TYPES: SqlServerDataType[] = [
  'NVARCHAR(150)',
  'NVARCHAR(255)',
  'NVARCHAR(50)',
  'NVARCHAR(MAX)',
  'VARCHAR(100)',
  'DECIMAL(18,2)',
  'DECIMAL(10,2)',
  'INT',
  'BIGINT',
  'DATE',
  'DATETIME2',
  'BIT',
];

export const SchemaBuilder: React.FC<SchemaBuilderProps> = ({
  tableSchema,
  onChangeSchema,
  onSelectPreset,
  activePresetId,
  onOpenFruit67Modal,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'sql-import'>('visual');
  const [sqlPasteText, setSqlPasteText] = useState('');
  const [sqlParseError, setSqlParseError] = useState<string | null>(null);

  // Add new column
  const handleAddColumn = () => {
    const newCol: ColumnDefinition = {
      id: `col-${Date.now()}`,
      name: `Column_${tableSchema.columns.length + 1}`,
      labelAr: `عمود جديد ${tableSchema.columns.length + 1}`,
      dataType: 'NVARCHAR(150)',
      isNullable: true,
    };
    onChangeSchema({
      ...tableSchema,
      columns: [...tableSchema.columns, newCol],
    });
  };

  // Update specific column
  const handleUpdateColumn = (colId: string, fields: Partial<ColumnDefinition>) => {
    const updated = tableSchema.columns.map((c) => (c.id === colId ? { ...c, ...fields } : c));
    onChangeSchema({
      ...tableSchema,
      columns: updated,
    });
  };

  // Remove column
  const handleRemoveColumn = (colId: string) => {
    if (tableSchema.columns.length <= 1) return;
    const updated = tableSchema.columns.filter((c) => c.id !== colId);
    onChangeSchema({
      ...tableSchema,
      columns: updated,
    });
  };

  // Parse SQL CREATE TABLE script
  const handleParseSqlScript = () => {
    setSqlParseError(null);
    if (!sqlPasteText.trim()) {
      setSqlParseError('يرجى لصق نص استعلام CREATE TABLE أولاً');
      return;
    }

    try {
      const text = sqlPasteText;
      // Extract table name
      const tableNameMatch = text.match(/CREATE\s+TABLE\s+(?:\[?(\w+)\]?\.)?\[?(\w+)\]?\s*\(/i);
      const schemaName = tableNameMatch && tableNameMatch[1] ? tableNameMatch[1] : 'dbo';
      const tableName = tableNameMatch && tableNameMatch[2] ? tableNameMatch[2] : 'CustomTable';

      // Extract inner columns block
      const startIdx = text.indexOf('(');
      const endIdx = text.lastIndexOf(')');
      if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
        throw new Error('لم يتم العثور على أقواس تعريف الأعمدة ( ... ) بشكل سليم');
      }

      const columnsBlock = text.substring(startIdx + 1, endIdx);
      const rawLines = columnsBlock.split('\n');

      const extractedCols: ColumnDefinition[] = [];

      for (let line of rawLines) {
        line = line.trim();
        // Ignore constraints, keys, empty lines
        if (!line || line.startsWith('--') || line.match(/^(CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY)/i)) {
          continue;
        }

        // Clean trailing comma
        if (line.endsWith(',')) line = line.slice(0, -1).trim();

        // Match column name and type: [ColName] TYPE or ColName TYPE
        const colMatch = line.match(/^\[?(\w+)\]?\s+([A-Za-z0-9_()]+)/);
        if (colMatch) {
          const colName = colMatch[1];
          const rawType = colMatch[2].toUpperCase();

          let matchedType: SqlServerDataType = 'NVARCHAR(150)';
          if (rawType.includes('INT')) matchedType = 'INT';
          else if (rawType.includes('DECIMAL') || rawType.includes('NUMERIC') || rawType.includes('MONEY')) matchedType = 'DECIMAL(18,2)';
          else if (rawType.includes('DATE') && !rawType.includes('TIME')) matchedType = 'DATE';
          else if (rawType.includes('DATETIME')) matchedType = 'DATETIME2';
          else if (rawType.includes('BIT')) matchedType = 'BIT';
          else if (rawType.includes('MAX')) matchedType = 'NVARCHAR(MAX)';
          else if (rawType.includes('VARCHAR')) matchedType = 'NVARCHAR(150)';

          const isNullable = !line.match(/\bNOT\s+NULL\b/i);
          const isPrimaryKey = Boolean(line.match(/\bPRIMARY\s+KEY\b/i));
          const isIdentity = Boolean(line.match(/\bIDENTITY\b/i));

          extractedCols.push({
            id: `col-${Date.now()}-${extractedCols.length}`,
            name: colName,
            labelAr: colName,
            dataType: matchedType,
            isNullable,
            isPrimaryKey,
            isIdentity,
          });
        }
      }

      if (extractedCols.length === 0) {
        throw new Error('تعذر استخراج الأعمدة من النص. تأكد من كتابة كود CREATE TABLE صالح');
      }

      onChangeSchema({
        id: `table-${Date.now()}`,
        name: tableName,
        schemaName: schemaName,
        descriptionAr: `جدول ${tableName} مستورد من استعلام SQL`,
        columns: extractedCols,
      });

      setActiveTab('visual');
    } catch (err: any) {
      setSqlParseError(err.message || 'حدث خطأ أثناء معالجة كود SQL');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Top Banner & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              تحديد جدول وأعمدة Microsoft SQL Server
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            حدد أسماء وحقول الجدول في قاعدة بياناتك التي تريد أن يصب فيها الذكاء الاصطناعي بيانات الدفتر
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'visual'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            المحرر المرئي
          </button>
          <button
            onClick={() => setActiveTab('sql-import')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'sql-import'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            استيراد استعلام DDL
          </button>
        </div>
      </div>

      {/* Preset Ledger Buttons */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          <span>أو اختر نموذجاً جاهزاً سريعاً للتجربة:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {onOpenFruit67Modal && (
            <button
              type="button"
              onClick={onOpenFruit67Modal}
              className="px-3 py-1.5 text-xs rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="تصفح واختيار أحد جداول قاعدة بيانات fruit67 المنسوخة (39 جدول)"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>جداول قاعدة بياناتك [fruit67] (39 جدول) 🗄️</span>
            </button>
          )}
          {PRESET_LEDGERS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className={`px-3 py-1.5 text-xs rounded-xl border transition-all text-right flex items-center gap-2 ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-200 font-semibold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                <span>{preset.titleAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Visual Schema Editor */}
      {activeTab === 'visual' && (
        <div className="space-y-4">
          {/* Table Header Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-400">
                المخطط (Schema)
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="dbo"
                value={tableSchema.schemaName || 'dbo'}
                onChange={(e) => onChangeSchema({ ...tableSchema, schemaName: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-medium text-slate-400">
                اسم الجدول في SQL Server (Table Name)
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="مثال: DailyLedgerRecords"
                value={tableSchema.name}
                onChange={(e) => onChangeSchema({ ...tableSchema, name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono font-semibold bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Columns Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">اسم العمود (SQL Column)</th>
                  <th className="py-2.5 px-3">الوصف بالعربية في الدفتر</th>
                  <th className="py-2.5 px-3 w-40">نوع البيانات في SQL</th>
                  <th className="py-2.5 px-3 w-24 text-center">يقبل NULL</th>
                  <th className="py-2.5 px-3 w-12 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableSchema.columns.map((col, idx) => (
                  <tr key={col.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Column SQL Name */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        dir="ltr"
                        value={col.name}
                        onChange={(e) => handleUpdateColumn(col.id, { name: e.target.value })}
                        className="w-full px-2.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-md text-sky-300 focus:outline-none focus:border-indigo-500"
                      />
                    </td>

                    {/* Arabic Label */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={col.labelAr}
                        onChange={(e) => handleUpdateColumn(col.id, { labelAr: e.target.value })}
                        placeholder="مثل: البيان، المدين، التاريخ..."
                        className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-700/80 rounded-md text-white focus:outline-none focus:border-indigo-500"
                      />
                    </td>

                    {/* SQL Data Type */}
                    <td className="py-2 px-3">
                      <select
                        dir="ltr"
                        value={col.dataType}
                        onChange={(e) => handleUpdateColumn(col.id, { dataType: e.target.value as SqlServerDataType })}
                        className="w-full px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-md text-amber-300 focus:outline-none focus:border-indigo-500"
                      >
                        {COMMON_SQL_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Nullable Checkbox */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={col.isNullable}
                        onChange={(e) => handleUpdateColumn(col.id, { isNullable: e.target.checked })}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                      />
                    </td>

                    {/* Delete Column Button */}
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleRemoveColumn(col.id)}
                        disabled={tableSchema.columns.length <= 1}
                        title="حذف هذا العمود"
                        className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Column Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleAddColumn}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عمود جديد للجدول</span>
            </button>

            <span className="text-[11px] text-slate-500">
              إجمالي الأعمدة المحددة: {tableSchema.columns.length} عمود
            </span>
          </div>
        </div>
      )}

      {/* Tab: SQL Import */}
      {activeTab === 'sql-import' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-300">
            الصق كود استعلام إنشاء الجدول (CREATE TABLE) من SQL Server هنا وسيقوم التطبيق بتحليله وتعبئة الأعمدة تلقائياً:
          </div>

          <textarea
            dir="ltr"
            rows={7}
            value={sqlPasteText}
            onChange={(e) => setSqlPasteText(e.target.value)}
            placeholder={`CREATE TABLE [dbo].[DailyTransactions] (
    [TransactionDate] DATE NOT NULL,
    [Description] NVARCHAR(250) NOT NULL,
    [DebitAmount] DECIMAL(18,2) NULL,
    [CreditAmount] DECIMAL(18,2) NULL,
    [Notes] NVARCHAR(MAX) NULL
);`}
            className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-700 rounded-xl text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />

          {sqlParseError && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{sqlParseError}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleParseSqlScript}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>تحليل واستيراد الأعمدة من الكود</span>
            </button>

            <button
              onClick={() => {
                setSqlPasteText('');
                setSqlParseError(null);
              }}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              مسح النص
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
