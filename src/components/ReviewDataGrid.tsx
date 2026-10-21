import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Search, 
  Eye, 
  HelpCircle, 
  Sparkles, 
  CheckSquare, 
  Square,
  Calculator,
  RotateCcw,
  Mic
} from 'lucide-react';
import { ExtractedRow, TableDefinition, ExtractionResult } from '../types/ledger';

interface ReviewDataGridProps {
  tableSchema: TableDefinition;
  extractionResult: ExtractionResult | null;
  rows: ExtractedRow[];
  onUpdateRows: (rows: ExtractedRow[]) => void;
  onResetRows?: () => void;
  onOpenVoiceInput?: () => void;
}

export const ReviewDataGrid: React.FC<ReviewDataGridProps> = ({
  tableSchema,
  extractionResult,
  rows,
  onUpdateRows,
  onResetRows,
  onOpenVoiceInput,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const [filterWarningOnly, setFilterWarningOnly] = useState(false);

  // Update cell value
  const handleCellChange = (rowId: string, colName: string, newValue: any) => {
    const updated = rows.map((row) => {
      if (row.id !== rowId) return row;
      const currentCell = row.cells[colName] || { columnName: colName, value: '', confidence: 1 };
      return {
        ...row,
        cells: {
          ...row.cells,
          [colName]: {
            ...currentCell,
            value: newValue,
            isFlagged: false, // cleared on user edit
          },
        },
      };
    });
    onUpdateRows(updated);
  };

  // Toggle row exclusion
  const handleToggleExclude = (rowId: string) => {
    const updated = rows.map((r) => (r.id === rowId ? { ...r, isExcluded: !r.isExcluded } : r));
    onUpdateRows(updated);
  };

  // Delete row
  const handleDeleteRow = (rowId: string) => {
    const updated = rows.filter((r) => r.id !== rowId);
    onUpdateRows(updated);
  };

  // Add new empty row
  const handleAddRow = () => {
    const emptyCells: Record<string, any> = {};
    tableSchema.columns.forEach((col) => {
      emptyCells[col.name] = {
        columnName: col.name,
        value: col.dataType.includes('INT') || col.dataType.includes('DECIMAL') ? '0.00' : '',
        confidence: 1,
      };
    });

    const newRow: ExtractedRow = {
      id: `manual-row-${Date.now()}`,
      rowNumber: rows.length + 1,
      cells: emptyCells,
      confidence: 1,
      status: 'valid',
    };

    onUpdateRows([...rows, newRow]);
  };

  // Filter rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterWarningOnly && r.status !== 'warning') return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      // search in cells
      const values = Object.values(r.cells).map((c) => String(c.value || '').toLowerCase());
      return values.some((v) => v.includes(term)) || (r.rawLineText && r.rawLineText.toLowerCase().includes(term));
    });
  }, [rows, searchTerm, filterWarningOnly]);

  // Compute column sums for numeric fields
  const columnSums = useMemo(() => {
    const sums: Record<string, number> = {};
    tableSchema.columns.forEach((col) => {
      const dt = col.dataType.toUpperCase();
      if (dt.includes('DECIMAL') || dt.includes('INT') || dt.includes('FLOAT') || dt.includes('NUMERIC')) {
        let sum = 0;
        rows.forEach((r) => {
          if (!r.isExcluded) {
            const val = parseFloat(String(r.cells[col.name]?.value || '0').replace(/,/g, ''));
            if (!isNaN(val)) sum += val;
          }
        });
        sums[col.name] = Math.round(sum * 100) / 100;
      }
    });
    return sums;
  }, [rows, tableSchema]);

  const activeRowsCount = rows.filter((r) => !r.isExcluded).length;
  const warningRowsCount = rows.filter((r) => r.status === 'warning').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Top Bar with summary & metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              مراجعة وتدقيق البيانات المستخرجة
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
              {activeRowsCount} سجل جاهز للإدخال
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            يمكنك النقر على أي خلية لتعديل محتواها مباشرة قبل الترحيل إلى جدول [
            {tableSchema.schemaName || 'dbo'}].[{tableSchema.name}]
          </p>
        </div>

        {/* Confidence & ledger stats badge */}
        {extractionResult && (
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">متوسط دقة التعرف:</span>
              <span className="font-bold font-mono text-emerald-400">
                {Math.round(extractionResult.confidenceAverage * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Notes / Summaries Found */}
      {extractionResult && (extractionResult.notes || extractionResult.summaryFound) && (
        <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-xs space-y-1">
          {extractionResult.notes && (
            <div className="text-slate-300">
              <strong className="text-indigo-300">ملاحظات الذكاء الاصطناعي: </strong>
              {extractionResult.notes}
            </div>
          )}
          {extractionResult.summaryFound && (
            <div className="text-amber-300 flex items-center gap-1.5 font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>المجموع المرصود في أسفل الدفتر: {extractionResult.summaryFound}</span>
            </div>
          )}
        </div>
      )}

      {/* Grid Controls (Search, Filter warnings, Raw OCR toggle, Add Row) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث في السجلات والأسماء والمبالغ..."
              className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {warningRowsCount > 0 && (
            <button
              onClick={() => setFilterWarningOnly(!filterWarningOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                filterWarningOnly
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>تصفية المشكوك بها ({warningRowsCount})</span>
            </button>
          )}

          <button
            onClick={() => setShowRawText(!showRawText)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              showRawText
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>عرض النص المكتشف خام</span>
          </button>

          {onOpenVoiceInput && (
            <button
              type="button"
              onClick={onOpenVoiceInput}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 rounded-lg transition-all shadow-md shadow-rose-600/20 border border-rose-500/30 cursor-pointer"
              title="إدخال صوتي (العدد، الوزن، الاسم، السعر، اسم النقلة)"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span>إدخال صوتي 🎙️</span>
            </button>
          )}

          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سطر جديد</span>
          </button>
        </div>
      </div>

      {/* The Editable Grid Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60 max-h-[520px]">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">تضمين</th>
              <th className="py-2.5 px-2 w-8 text-center">#</th>
              {tableSchema.columns.map((col) => (
                <th key={col.id} className="py-2.5 px-3 whitespace-nowrap min-w-[130px]">
                  <div className="font-bold text-slate-200">{col.labelAr || col.name}</div>
                  <div className="text-[10px] font-mono text-sky-400/80 font-normal">
                    [{col.name}] • {col.dataType}
                  </div>
                </th>
              ))}
              {showRawText && (
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[200px] text-amber-300">
                  النص الأصلي من الدفتر
                </th>
              )}
              <th className="py-2.5 px-3 w-10 text-center">حذف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={tableSchema.columns.length + (showRawText ? 3 : 2)}
                  className="py-12 text-center text-slate-500"
                >
                  لا توجد سجلات مطابقة للبحث
                </td>
              </tr>
            ) : (
              filteredRows.map((row, rIdx) => {
                const isExcluded = Boolean(row.isExcluded);
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isExcluded
                        ? 'opacity-40 bg-slate-950/30 line-through'
                        : row.status === 'warning'
                        ? 'bg-amber-950/10 hover:bg-amber-950/20'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Include / Exclude Checkbox */}
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleExclude(row.id)}
                        className="text-slate-400 hover:text-white"
                        title={isExcluded ? 'إعادة تضمين السطر' : 'استبعاد السطر من الإدخال'}
                      >
                        {isExcluded ? (
                          <Square className="w-4 h-4 text-slate-600" />
                        ) : (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        )}
                      </button>
                    </td>

                    {/* Row Index */}
                    <td className="py-2 px-2 text-center text-slate-500 font-mono text-[11px]">
                      {row.rowNumber || rIdx + 1}
                    </td>

                    {/* Columns Cells */}
                    {tableSchema.columns.map((col) => {
                      const cell = row.cells[col.name] || { value: '', confidence: 1 };
                      const val = cell.value !== undefined && cell.value !== null ? String(cell.value) : '';
                      const isFlagged = Boolean(cell.isFlagged);

                      return (
                        <td key={col.id} className="py-1.5 px-2">
                          <div className="relative">
                            <input
                              type="text"
                              value={val}
                              disabled={isExcluded}
                              onChange={(e) => handleCellChange(row.id, col.name, e.target.value)}
                              className={`w-full px-2.5 py-1 text-xs rounded-md border transition-all ${
                                isFlagged
                                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-200 focus:border-amber-400'
                                  : 'bg-slate-900/90 border-slate-700/60 text-white focus:border-indigo-500 focus:bg-slate-900'
                              } focus:outline-none`}
                            />
                            {isFlagged && cell.flagReason && (
                              <span
                                title={cell.flagReason}
                                className="absolute left-1.5 top-1.5 text-amber-400 cursor-help"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Raw Text Column */}
                    {showRawText && (
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                        {row.rawLineText || '-'}
                      </td>
                    )}

                    {/* Delete Row Button */}
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="حذف هذا الصف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer with Numeric Sums */}
          <tfoot className="bg-slate-900/90 border-t-2 border-slate-700 text-slate-300 font-semibold sticky bottom-0 z-10 backdrop-blur-sm">
            <tr>
              <td colSpan={2} className="py-2.5 px-3 text-center text-xs text-indigo-300">
                المجموع
              </td>
              {tableSchema.columns.map((col) => {
                const sum = columnSums[col.name];
                return (
                  <td key={col.id} className="py-2.5 px-3 font-mono text-xs text-emerald-400 font-bold">
                    {sum !== undefined ? sum.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                );
              })}
              {showRawText && <td></td>}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
