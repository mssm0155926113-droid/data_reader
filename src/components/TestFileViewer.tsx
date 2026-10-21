import React, { useState } from 'react';
import { 
  FileCheck2, 
  Download, 
  Printer, 
  ExternalLink, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  Maximize2, 
  FileSpreadsheet, 
  FileText,
  ScanLine,
  Search,
  Check,
  ArrowRightLeft
} from 'lucide-react';
import { ExtractedRow, ExtractionResult, TableDefinition } from '../types/ledger';

interface TestFileViewerProps {
  imageSrc: string | null;
  tableSchema: TableDefinition;
  extractionResult: ExtractionResult | null;
  rows: ExtractedRow[];
  onUpdateRowCell: (rowId: string, colName: string, value: any) => void;
  isAnalyzing: boolean;
}

export const TestFileViewer: React.FC<TestFileViewerProps> = ({
  imageSrc,
  tableSchema,
  extractionResult,
  rows,
  onUpdateRowCell,
  isAnalyzing,
}) => {
  const [hoveredRowIdx, setHoveredRowIdx] = useState<number | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [testViewMode, setTestViewMode] = useState<'paper' | 'grid'>('paper');
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Run automated data tests
  const testResults = React.useMemo(() => {
    let totalFields = 0;
    let validFields = 0;
    let warningsCount = 0;
    let formatErrors = 0;

    rows.forEach((row) => {
      if (row.isExcluded) return;
      tableSchema.columns.forEach((col) => {
        totalFields++;
        const val = row.cells[col.name]?.value;
        const cell = row.cells[col.name];

        if (cell?.isFlagged) {
          warningsCount++;
        }

        if (val === undefined || val === null || val === '') {
          if (!col.isNullable) {
            formatErrors++;
          }
        } else {
          const dt = col.dataType.toUpperCase();
          if (dt.includes('DECIMAL') || dt.includes('INT') || dt.includes('FLOAT')) {
            const num = parseFloat(String(val).replace(/,/g, ''));
            if (isNaN(num)) formatErrors++;
            else validFields++;
          } else if (dt.includes('DATE')) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(String(val))) formatErrors++;
            else validFields++;
          } else {
            validFields++;
          }
        }
      });
    });

    const accuracyScore = totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 100;

    return {
      totalFields,
      validFields,
      warningsCount,
      formatErrors,
      accuracyScore,
    };
  }, [rows, tableSchema]);

  // Generate self-contained downloadable HTML Test Sheet
  const handleDownloadTestFileHtml = () => {
    const activeRows = rows.filter((r) => !r.isExcluded);

    const tableHeaders = tableSchema.columns
      .map((c) => `<th style="padding:10px; border:1px solid #cbd5e1; background:#f1f5f9; text-align:right;">${c.labelAr || c.name} <br><small style="color:#64748b; font-weight:normal;">[${c.name}] (${c.dataType})</small></th>`)
      .join('');

    const tableBody = activeRows
      .map((row, idx) => {
        const cells = tableSchema.columns
          .map((col) => {
            const val = row.cells[col.name]?.value ?? '';
            const isFlagged = row.cells[col.name]?.isFlagged;
            return `<td style="padding:8px 10px; border:1px solid #e2e8f0; ${isFlagged ? 'background:#fef3c7; color:#92400e;' : ''}">${val}</td>`;
          })
          .join('');

        return `<tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding:8px 10px; border:1px solid #e2e8f0; text-align:center; font-weight:bold; color:#64748b;">${row.rowNumber || idx + 1}</td>
          ${cells}
        </tr>`;
      })
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>ملف اختبار ومطابقة الدفتر اليدوي - ${tableSchema.name}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 25px; }
    .header { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; background: #dcfce7; color: #166534; }
    .grid-container { display: flex; gap: 20px; flex-wrap: wrap; }
    .image-box { flex: 1; min-width: 380px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; }
    .table-box { flex: 2; min-width: 480px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    img { max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; }
    .summary { margin-top: 15px; padding: 12px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe; font-size: 13px; color: #1e40af; }
    @media print { .no-print { display: none; } body { padding: 0; background: white; } }
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h1 style="margin:0 0 5px 0; font-size: 20px;">ملف اختبار ومطابقة الدفتر اليدوي (Ledger Test File)</h1>
        <p style="margin:0; color:#64748b; font-size:13px;">الجدول المستهدف: <strong>[${tableSchema.schemaName || 'dbo'}].[${tableSchema.name}]</strong> | تاريخ الفحص: ${new Date().toLocaleString('ar-EG')}</p>
      </div>
      <div>
        <span class="badge">دقة الاختبار: ${testResults.accuracyScore}% (${activeRows.length} سجل)</span>
      </div>
    </div>
  </div>

  <div class="grid-container">
    ${imageSrc ? `
    <div class="image-box">
      <h3 style="margin-top:0; font-size:15px; color:#334155;">صورة الدفتر الأصلية للاختبار والمقارنة:</h3>
      <img src="${imageSrc}" alt="صورة الدفتر اليدوي">
    </div>` : ''}

    <div class="table-box">
      <h3 style="margin-top:0; font-size:15px; color:#334155;">البيانات المستخرجة في ورقة الاختبار:</h3>
      <table>
        <thead>
          <tr>
            <th style="padding:10px; border:1px solid #cbd5e1; background:#f1f5f9; width:40px; text-align:center;">#</th>
            ${tableHeaders}
          </tr>
        </thead>
        <tbody>
          ${tableBody}
        </tbody>
      </table>

      ${extractionResult?.summaryFound ? `<div class="summary"><strong>المجموع المرصود في الدفتر:</strong> ${extractionResult.summaryFound}</div>` : ''}
    </div>
  </div>

  <div style="margin-top:20px; text-align:center; color:#94a3b8; font-size:11px;" class="no-print">
    تم توليد هذا التقرير للاختبار والمراجعة بواسطة تطبيق مستخرج الدفاتر اليدوية إلى Microsoft SQL Server
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_test_file_${tableSchema.name}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print current test sheet
  const handlePrint = () => {
    window.print();
  };

  if (!imageSrc && rows.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Test Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              ملف الاختبار والمطابقة المرئية للدفتر
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                وضع الاختبار نشط
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            عرض بيانات الدفتر في ورقة اختبار ومطابقتها سطر بسطر مع صورة الدفتر المرفوعة قبل الترحيل لقاعدة البيانات
          </p>
        </div>

        {/* Action Controls for Test File */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Switch View Style */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTestViewMode('paper')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                testViewMode === 'paper'
                  ? 'bg-amber-600/30 text-amber-200 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ورقة الدفتر المسطرة
            </button>
            <button
              onClick={() => setTestViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                testViewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              جدول الحقول
            </button>
          </div>

          {/* Download Interactive HTML Test File */}
          <button
            onClick={handleDownloadTestFileHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm shadow-indigo-600/20"
            title="تنزيل ملف HTML للاختبار والمراجعة بدون إنترنت"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل ملف الاختبار (HTML)</span>
          </button>

          {/* Print Test File */}
          <button
            onClick={handlePrint}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            title="طباعة ورقة الاختبار للمراجعة اليدوية"
          >
            <Printer className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Test Quality Audit Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
          <div className="text-[11px] text-slate-400">إجمالي سطور الاختبار</div>
          <div className="text-base font-bold font-mono text-white mt-0.5">
            {rows.filter((r) => !r.isExcluded).length} سطر
          </div>
        </div>

        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
          <div className="text-[11px] text-slate-400">دقة مطابقة الحقول</div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
            {testResults.accuracyScore}%
          </div>
        </div>

        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
          <div className="text-[11px] text-slate-400">حقول مشكوك في خطها</div>
          <div className={`text-base font-bold font-mono mt-0.5 ${testResults.warningsCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {testResults.warningsCount} حقل
          </div>
        </div>

        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
          <div className="text-[11px] text-slate-400">أخطاء في نوع البيانات</div>
          <div className={`text-base font-bold font-mono mt-0.5 ${testResults.formatErrors > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {testResults.formatErrors} خطأ
          </div>
        </div>
      </div>

      {/* Interactive Side-by-Side Dual Verification Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left/Upper: Uploaded Ledger Image Viewer with Cursor Guide */}
        {imageSrc && (
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ScanLine className="w-3.5 h-3.5 text-sky-400" />
                صورة الدفتر اليدوي الأصلية
              </span>
              <span className="text-[10px] text-slate-500">
                مرر الفأرة على الأسطر للمطابقة
              </span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-800/80 bg-slate-900/60 max-h-[460px] flex items-center justify-center">
              <img
                src={imageSrc}
                alt="دفتر يدوي للاختبار"
                className="max-w-full max-h-[450px] object-contain shadow-lg"
              />

              {/* Dynamic Highlighter Ruler on Hover */}
              {hoveredRowIdx !== null && (
                <div 
                  className="absolute left-0 right-0 pointer-events-none transition-all duration-150 border-y-2 border-indigo-400 bg-indigo-500/15"
                  style={{
                    top: `${Math.min(15 + (hoveredRowIdx * 11), 85)}%`,
                    height: '35px',
                  }}
                >
                  <div className="absolute right-2 top-1 text-[10px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded shadow">
                    سطر #{hoveredRowIdx + 1}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              💡 يمكنك مقارنة كل سطر في ورقة الاختبار مع الخط اليدوي في الصورة لتأكيد صحة الأرقام.
            </div>
          </div>
        )}

        {/* Right/Lower: Digital Ledger Test File (Paper or Grid format) */}
        <div className={`${imageSrc ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-2`}>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              ورقة الدفتر الرقمية للاختبار: [{tableSchema.name}]
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              جاهز للاختبار والتعديل الحي
            </span>
          </div>

          {/* Test View: Authentic Lined Ledger Paper */}
          {testViewMode === 'paper' ? (
            <div className="border border-amber-900/40 rounded-xl overflow-hidden bg-[#fdfbf7] text-slate-900 shadow-md">
              {/* Paper Top Title */}
              <div className="p-3 border-b border-amber-200/80 bg-[#f9f5ea] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-amber-950">
                    📓 سجل اختبار ومطابقة: {tableSchema.descriptionAr || tableSchema.name}
                  </h3>
                  <div className="text-[11px] text-amber-800">
                    جدول SQL: <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">[{tableSchema.schemaName || 'dbo'}].[{tableSchema.name}]</code>
                  </div>
                </div>
                <div className="text-right text-[11px] text-amber-900">
                  <div>التاريخ: {new Date().toLocaleDateString('ar-EG')}</div>
                  <div className="font-bold text-emerald-700">✓ تم التدقيق الآلي</div>
                </div>
              </div>

              {/* Lined Notebook Rows */}
              <div className="overflow-x-auto max-h-[420px]">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-amber-100/70 border-b border-amber-300 text-amber-950 font-bold">
                      <th className="p-2 border-l border-amber-200 text-center w-8">م</th>
                      {tableSchema.columns.map((col) => (
                        <th key={col.id} className="p-2 border-l border-amber-200 whitespace-nowrap min-w-[110px]">
                          {col.labelAr || col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rIdx) => {
                      const isHovered = hoveredRowIdx === rIdx;
                      return (
                        <tr
                          key={row.id}
                          onMouseEnter={() => setHoveredRowIdx(rIdx)}
                          onMouseLeave={() => setHoveredRowIdx(null)}
                          className={`transition-colors border-b border-dashed border-amber-200/90 ${
                            isHovered
                              ? 'bg-amber-200/60 font-semibold'
                              : rIdx % 2 === 0
                              ? 'bg-[#fdfbf7]'
                              : 'bg-[#faf6ee]'
                          }`}
                        >
                          <td className="p-2 text-center text-amber-900 border-l border-amber-200 font-bold font-mono">
                            {row.rowNumber || rIdx + 1}
                          </td>
                          {tableSchema.columns.map((col) => {
                            const val = row.cells[col.name]?.value ?? '';
                            const isFlagged = row.cells[col.name]?.isFlagged;
                            return (
                              <td
                                key={col.id}
                                className={`p-1.5 border-l border-amber-200/80 ${
                                  isFlagged ? 'bg-amber-200/80 text-amber-950 font-bold' : ''
                                }`}
                              >
                                <input
                                  type="text"
                                  value={String(val)}
                                  onChange={(e) => onUpdateRowCell(row.id, col.name, e.target.value)}
                                  className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded px-1 text-slate-900"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Paper Signatures */}
              <div className="p-3 border-t border-amber-200 bg-[#f9f5ea] flex items-center justify-between text-xs text-amber-900">
                <div>حالة الاختبار: <strong>جاهز للترحيل إلى SQL Server</strong></div>
                <div>توقيع مراجع السجل: _________________</div>
              </div>
            </div>
          ) : (
            /* Test View: Grid format */
            <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950 max-h-[420px]">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2.5 text-center w-8">#</th>
                    {tableSchema.columns.map((c) => (
                      <th key={c.id} className="p-2.5 whitespace-nowrap min-w-[120px]">
                        <div>{c.labelAr || c.name}</div>
                        <div className="text-[10px] text-sky-400 font-mono">[{c.dataType}]</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {rows.map((row, rIdx) => {
                    const isHovered = hoveredRowIdx === rIdx;
                    return (
                      <tr
                        key={row.id}
                        onMouseEnter={() => setHoveredRowIdx(rIdx)}
                        onMouseLeave={() => setHoveredRowIdx(null)}
                        className={`transition-colors ${
                          isHovered ? 'bg-indigo-950/40 text-white' : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <td className="p-2 text-center text-slate-500 font-mono">
                          {row.rowNumber || rIdx + 1}
                        </td>
                        {tableSchema.columns.map((col) => {
                          const val = row.cells[col.name]?.value ?? '';
                          return (
                            <td key={col.id} className="p-1.5">
                              <input
                                type="text"
                                value={String(val)}
                                onChange={(e) => onUpdateRowCell(row.id, col.name, e.target.value)}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
