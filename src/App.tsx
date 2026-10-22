import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SchemaBuilder } from './components/SchemaBuilder';
import { ImageUploader } from './components/ImageUploader';
import { TestFileViewer } from './components/TestFileViewer';
import { ReviewDataGrid } from './components/ReviewDataGrid';
import { SqlScriptExporter } from './components/SqlScriptExporter';
import { SqlServerModal } from './components/SqlServerModal';
import { GuideModal } from './components/GuideModal';
import { VoiceInputModal } from './components/VoiceInputModal';
import { Fruit67SyncModal } from './components/Fruit67SyncModal';
import { Fruit67WorkflowModel } from './components/Fruit67WorkflowModel';
import { PRESET_LEDGERS } from './data/presetLedgers';
import { FRUIT67_TABLES } from './data/fruit67Database';
import { ExtractedRow, ExtractionResult, SqlServerConfig, TableDefinition } from './types/ledger';
import { analyzeLedger, getFruit67Status, saveRecordsToFruit67 } from './services/api';
import { AlertCircle, CheckCircle2, Sparkles, Layers, ArrowDown, Mic, RefreshCw, Database } from 'lucide-react';

const STORAGE_KEY_SQL_CONFIG = 'handwritten_ledger_sql_config';

export default function App() {
  const initialPreset = PRESET_LEDGERS[0];

  const [activePresetId, setActivePresetId] = useState<string>(initialPreset.id);
  const [tableSchema, setTableSchema] = useState<TableDefinition>(initialPreset.table);
  const [imageSrc, setImageSrc] = useState<string | null>(initialPreset.sampleImage);
  const [customNotes, setCustomNotes] = useState<string>(initialPreset.suggestedNotes);
  const [autoTestOnUpload, setAutoTestOnUpload] = useState<boolean>(true);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [rows, setRows] = useState<ExtractedRow[]>([]);

  // Database Connection State (Defaulted to user's fruit67 database)
  const [sqlConfig, setSqlConfig] = useState<SqlServerConfig>({
    server: 'localhost',
    port: 1433,
    database: 'fruit67',
    user: 'sa',
    password: '',
    trustServerCertificate: true,
    encrypt: false,
  });
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isFruit67ModalOpen, setIsFruit67ModalOpen] = useState(false);
  const [isFruit67WorkflowOpen, setIsFruit67WorkflowOpen] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Load saved config on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SQL_CONFIG);
      if (saved) {
        setSqlConfig(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }

    // Pre-populate demo rows from the initial preset
    const demoRows: ExtractedRow[] = [
      {
        id: 'row-demo-1',
        rowNumber: 1,
        rawLineText: 'مبيعات نقدية فاتورة 104 - وارد 3500.00 نقداً',
        confidence: 0.98,
        status: 'valid',
        cells: {
          TransactionDate: { columnName: 'TransactionDate', value: '2024-10-01', confidence: 0.99 },
          Description: { columnName: 'Description', value: 'مبيعات نقدية فاتورة 104', confidence: 0.97 },
          CreditAmount: { columnName: 'CreditAmount', value: '3500.00', confidence: 0.98 },
          DebitAmount: { columnName: 'DebitAmount', value: '0.00', confidence: 0.99 },
          PaymentMethod: { columnName: 'PaymentMethod', value: 'نقداً', confidence: 0.98 },
          Notes: { columnName: 'Notes', value: 'مستلم من الكاشير', confidence: 0.96 },
        },
      },
      {
        id: 'row-demo-2',
        rowNumber: 2,
        rawLineText: 'سداد فاتورة كهرباء الفرع - منصرف 420.50 نقداً',
        confidence: 0.96,
        status: 'valid',
        cells: {
          TransactionDate: { columnName: 'TransactionDate', value: '2024-10-01', confidence: 0.98 },
          Description: { columnName: 'Description', value: 'سداد فاتورة كهرباء الفرع', confidence: 0.95 },
          CreditAmount: { columnName: 'CreditAmount', value: '0.00', confidence: 0.99 },
          DebitAmount: { columnName: 'DebitAmount', value: '420.50', confidence: 0.97 },
          PaymentMethod: { columnName: 'PaymentMethod', value: 'نقداً', confidence: 0.98 },
          Notes: { columnName: 'Notes', value: 'وصل رقم 8892', confidence: 0.95 },
        },
      },
      {
        id: 'row-demo-3',
        rowNumber: 3,
        rawLineText: 'دفعة عميل شركة الأمل - وارد 8200.00 تحويل بنكي',
        confidence: 0.97,
        status: 'valid',
        cells: {
          TransactionDate: { columnName: 'TransactionDate', value: '2024-10-02', confidence: 0.99 },
          Description: { columnName: 'Description', value: 'دفعة عميل شركة الأمل', confidence: 0.98 },
          CreditAmount: { columnName: 'CreditAmount', value: '8200.00', confidence: 0.99 },
          DebitAmount: { columnName: 'DebitAmount', value: '0.00', confidence: 0.99 },
          PaymentMethod: { columnName: 'PaymentMethod', value: 'تحويل بنكي', confidence: 0.97 },
          Notes: { columnName: 'Notes', value: 'شيك رقم 4410', confidence: 0.96 },
        },
      },
      {
        id: 'row-demo-4',
        rowNumber: 4,
        rawLineText: 'شراء أدوات نظافة وضيافة - منصرف 165.00 نقداً',
        confidence: 0.94,
        status: 'valid',
        cells: {
          TransactionDate: { columnName: 'TransactionDate', value: '2024-10-02', confidence: 0.98 },
          Description: { columnName: 'Description', value: 'شراء أدوات نظافة وضيافة', confidence: 0.95 },
          CreditAmount: { columnName: 'CreditAmount', value: '0.00', confidence: 0.99 },
          DebitAmount: { columnName: 'DebitAmount', value: '165.00', confidence: 0.96 },
          PaymentMethod: { columnName: 'PaymentMethod', value: 'نقداً', confidence: 0.97 },
          Notes: { columnName: 'Notes', value: 'عهدة المحل', confidence: 0.94 },
        },
      },
      {
        id: 'row-demo-5',
        rowNumber: 5,
        rawLineText: 'مبيعات منتجات ورقية وجملة - وارد 5400.00 شبكة مدى',
        confidence: 0.97,
        status: 'valid',
        cells: {
          TransactionDate: { columnName: 'TransactionDate', value: '2024-10-03', confidence: 0.99 },
          Description: { columnName: 'Description', value: 'مبيعات منتجات ورقية وجملة', confidence: 0.97 },
          CreditAmount: { columnName: 'CreditAmount', value: '5400.00', confidence: 0.98 },
          DebitAmount: { columnName: 'DebitAmount', value: '0.00', confidence: 0.99 },
          PaymentMethod: { columnName: 'PaymentMethod', value: 'شبكة مدى', confidence: 0.98 },
          Notes: { columnName: 'Notes', value: 'عملية 7721', confidence: 0.95 },
        },
      },
      {
        id: 'row-demo-6',
        rowNumber: 6,
        rawLineText: 'مصاريف صيانة مكيف - منصرف 350.00 نقداً ورشة السلام',
        confidence: 0.93,
        status: 'valid',
        cells: {
          TransactionDate: { columnName: 'TransactionDate', value: '2024-10-03', confidence: 0.97 },
          Description: { columnName: 'Description', value: 'مصاريف صيانة مكيف', confidence: 0.94 },
          CreditAmount: { columnName: 'CreditAmount', value: '0.00', confidence: 0.99 },
          DebitAmount: { columnName: 'DebitAmount', value: '350.00', confidence: 0.96 },
          PaymentMethod: { columnName: 'PaymentMethod', value: 'نقداً', confidence: 0.97 },
          Notes: { columnName: 'Notes', value: 'ورشة السلام', confidence: 0.92 },
        },
      },
      {
        id: 'row-demo-7',
        rowNumber: 7,
        rawLineText: 'دفعة مورد أقمشة ومواد خام - منصرف 4500.00 شيك',
        confidence: 0.96,
        status: 'valid',
        cells: {
          TransactionDate: { columnName: 'TransactionDate', value: '2024-10-04', confidence: 0.98 },
          Description: { columnName: 'Description', value: 'دفعة مورد أقمشة ومواد خام', confidence: 0.96 },
          CreditAmount: { columnName: 'CreditAmount', value: '0.00', confidence: 0.99 },
          DebitAmount: { columnName: 'DebitAmount', value: '4500.00', confidence: 0.98 },
          PaymentMethod: { columnName: 'PaymentMethod', value: 'شيك', confidence: 0.97 },
          Notes: { columnName: 'Notes', value: 'استحقاق 10 أكتوبر', confidence: 0.94 },
        },
      },
      {
        id: 'row-demo-8',
        rowNumber: 8,
        rawLineText: 'إيراد مبيعات تجزئة مسائي - وارد 2850.75 وردية المساء',
        confidence: 0.91,
        status: 'valid',
        cells: {
          TransactionDate: { columnName: 'TransactionDate', value: '2024-10-04', confidence: 0.98 },
          Description: { columnName: 'Description', value: 'إيراد مبيعات تجزئة مسائي', confidence: 0.94 },
          CreditAmount: { columnName: 'CreditAmount', value: '2850.75', confidence: 0.92 },
          DebitAmount: { columnName: 'DebitAmount', value: '0.00', confidence: 0.99 },
          PaymentMethod: { columnName: 'PaymentMethod', value: 'نقداً', confidence: 0.95 },
          Notes: { columnName: 'Notes', value: 'وردية المساء', confidence: 0.92 },
        },
      },
    ];

    setRows(demoRows);
    setExtractionResult({
      tableName: initialPreset.table.name,
      totalRows: demoRows.length,
      confidenceAverage: 0.96,
      rows: demoRows,
      notes: 'تم فحص صورة الدفتر اليدوي وتعيين الحقول بنجاح.',
      detectedHeaders: ['م', 'التاريخ', 'البيان والتفاصيل', 'الوارد (مدين)', 'المنصرف (دائن)', 'طريقة الدفع', 'الملاحظات'],
      summaryFound: 'إجمالي الوارد: 19950.75 ج.م | إجمالي المنصرف: 5435.50 ج.م',
    });

    // Check fruit67 replica status
    getFruit67Status()
      .then((status) => {
        if (status && typeof status.pendingSyncCount === 'number') {
          setPendingSyncCount(status.pendingSyncCount);
        }
      })
      .catch((err) => console.log('Fruit67 local store status check:', err));
  }, []);

  // Save config
  const handleSaveConfig = (cfg: SqlServerConfig) => {
    setSqlConfig(cfg);
    try {
      localStorage.setItem(STORAGE_KEY_SQL_CONFIG, JSON.stringify(cfg));
    } catch (e) {
      // ignore
    }
  };

  // Switch preset
  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_LEDGERS.find((p) => p.id === presetId);
    if (found) {
      setActivePresetId(found.id);
      setTableSchema(found.table);
      setImageSrc(found.sampleImage);
      setCustomNotes(found.suggestedNotes);
      setExtractionResult(null);
      setRows([]);
    }
  };

  // Update specific cell in rows
  const handleUpdateRowCell = (rowId: string, colName: string, value: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const currentCell = r.cells[colName] || { columnName: colName, value: '', confidence: 1 };
        return {
          ...r,
          cells: {
            ...r.cells,
            [colName]: {
              ...currentCell,
              value,
              isFlagged: false,
            },
          },
        };
      })
    );
  };

  // Trigger Gemini Analysis (supports override image for instant upload testing)
  const handleAnalyze = async (overrideImg?: string) => {
    const targetImg = overrideImg || imageSrc;
    if (!targetImg) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await analyzeLedger(targetImg, tableSchema, customNotes);
      setExtractionResult(result);
      const extractedRows = result.rows || [];
      setRows(extractedRows);

      // Auto-save to fruit67 local replica database
      if (extractedRows.length > 0) {
        try {
          const saveRes = await saveRecordsToFruit67(tableSchema.name, extractedRows);
          if (saveRes && saveRes.success) {
            setPendingSyncCount((prev) => prev + extractedRows.length);
          }
        } catch (e) {
          console.error('Error saving extracted rows to fruit67:', e);
        }
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'حدث خطأ أثناء معالجة صورة الدفتر');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle new image upload with auto-test support
  const handleImageChange = (newImg: string, triggerAutoTest: boolean = false) => {
    setImageSrc(newImg);
    setActivePresetId('');
    if (triggerAutoTest) {
      handleAnalyze(newImg);
    }
  };

  // Add row from voice input
  const handleAddVoiceRow = async (newRow: ExtractedRow) => {
    setRows((prev) => [newRow, ...prev]);

    // Auto-save voice row to fruit67 local replica
    try {
      const saveRes = await saveRecordsToFruit67(tableSchema.name, [newRow]);
      if (saveRes && saveRes.success) {
        setPendingSyncCount((prev) => prev + 1);
      }
    } catch (e) {
      console.error('Error auto-saving voice row to fruit67 store:', e);
    }
  };

  // Sync table schema with the 5 voice fields if requested
  const handleSyncColumnsForVoice = () => {
    // If fatora table from fruit67 is available, prefer it
    const fatoraTable = FRUIT67_TABLES.find((t) => t.name.toLowerCase() === 'fatora');
    if (fatoraTable) {
      setTableSchema(fatoraTable);
      setActivePresetId('');
      return;
    }

    const tripsPreset = PRESET_LEDGERS.find((p) => p.id === 'trips-ledger');
    if (tripsPreset) {
      setTableSchema(tripsPreset.table);
      setActivePresetId('trips-ledger');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* App Header */}
      <Header
        sqlConfig={sqlConfig}
        isDbConnected={isDbConnected}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenVoiceInput={() => setIsVoiceModalOpen(true)}
        onOpenFruit67Modal={() => setIsFruit67ModalOpen(true)}
        onOpenFruit67Workflow={() => setIsFruit67WorkflowOpen(true)}
        pendingSyncCount={pendingSyncCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Special Fruit67 Voice Ingest & Tables Model Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/70 via-emerald-950/50 to-slate-900 border border-amber-500/30 p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  قاعدة بيانات fruit67 - وكالات وأسواق الفاكهة
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ★ جدول المبيعات المعتمد: fatora_f
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                نموذج تدفق الإدخال الصوتي وتسكين النقلات والمبيعات عبر الجداول
              </h3>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                مسار ذكي للتحقق من المورد والمزرعة، تسجيل النقلة مع نولون الشحن ووهبة السائق، احتساب كود الصنف الجديد (MAX+1) وبياعته العادية والخاصة، وتسكين المبيعات في جدول <strong>fatora_f</strong> (نقدي أو زمام) مع إضافة العميل وترحيل المديونية تلقائياً إلى جدول <strong>zemam</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsFruit67WorkflowOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-950" />
                <span>فتح نموذج الجداول ومسار الصوت 📊</span>
              </button>
            </div>
          </div>
        </div>

        {/* Banner Announcement */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-5 shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  حل متكامل للسجلات اليدوية و SQL Server
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-slate-400 text-xs hidden sm:inline">
                  يدعم خط الرقعة والنسخ والأرقام العربية واللاتينية
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                حوّل دفاتر الحسابات واليوميات الورقية إلى جداول Microsoft SQL Server
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                حدد بنية الجداول والأعمدة في قاعدة بياناتك، التقط صورة لدفتر الحسابات اليدوي، ودع الذكاء الاصطناعي يستخرج البيانات ويدرجها في SQL Server مباشرة أو يولد لك ملف T-SQL متكامل.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsFruit67ModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 rounded-xl transition-all shadow-md shadow-emerald-950/30 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>قاعدة بيانات fruit67 (39 جدول)</span>
              </button>
              <button
                onClick={() => setIsGuideModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                شرح الخطوات
              </button>
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                ربط SQL Server
              </button>
            </div>
          </div>
        </div>

        {/* Quick fruit67 Database Card */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-slate-900/90 border border-emerald-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">قاعدة بياناتك [fruit67]</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  39 جدول متطابق
                </span>
                {pendingSyncCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    {pendingSyncCount} سجلات بانتظار المزامنة مع الكمبيوتر
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                الجدول النشط: <span className="text-emerald-300 font-mono font-bold">[{tableSchema.name}]</span> • يمكنك إدراج فواتيرك ونقلاتك الممسوحة أو المنطوقة صوتياً ومزامنتها مباشرة مع جهاز الكمبيوتر.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsFruit67ModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>مركز المزامنة وجداول fruit67</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {analysisError && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">خطأ في معالجة الدفتر</div>
              <div className="mt-0.5">{analysisError}</div>
            </div>
          </div>
        )}

        {/* STEP 1: Table & Column Mapping */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[11px]">
              ١
            </span>
            <span>الخطوة الأولى: تحديد الجدول والأعمدة في SQL Server</span>
          </div>
          <SchemaBuilder
            tableSchema={tableSchema}
            onChangeSchema={(updated) => {
              setTableSchema(updated);
              setActivePresetId('');
            }}
            onSelectPreset={handleSelectPreset}
            activePresetId={activePresetId}
            onOpenFruit67Modal={() => setIsFruit67ModalOpen(true)}
          />
        </section>

        {/* STEP 2: Ledger Image Upload & Vision Trigger */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[11px]">
              ٢
            </span>
            <span>الخطوة الثانية: صورة الدفتر اليدوي وبدء القراءة</span>
          </div>
          <ImageUploader
            imageSrc={imageSrc}
            onImageChange={handleImageChange}
            onAnalyze={() => handleAnalyze()}
            isAnalyzing={isAnalyzing}
            customNotes={customNotes}
            setCustomNotes={setCustomNotes}
            tableColsCount={tableSchema.columns.length}
            autoTestOnUpload={autoTestOnUpload}
            setAutoTestOnUpload={setAutoTestOnUpload}
          />
        </section>

        {/* STEP 3: Test File & Visual Comparison Sheet */}
        {(rows.length > 0 || isAnalyzing) && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">
                ٣
              </span>
              <span>الخطوة الثالثة: ملف الاختبار والمطابقة المرئية (المقارنة الحية مع الصورة)</span>
            </div>
            <TestFileViewer
              imageSrc={imageSrc}
              tableSchema={tableSchema}
              extractionResult={extractionResult}
              rows={rows}
              onUpdateRowCell={handleUpdateRowCell}
              isAnalyzing={isAnalyzing}
            />
          </section>
        )}

        {/* STEP 4: Review Data Grid (shows if rows exist or after extraction) */}
        {rows.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">
                ٤
              </span>
              <span>الخطوة الرابعة: تدقيق وتعديل خلايا جدول SQL Server</span>
            </div>
            <ReviewDataGrid
              tableSchema={tableSchema}
              extractionResult={extractionResult}
              rows={rows}
              onUpdateRows={setRows}
              onOpenVoiceInput={() => setIsVoiceModalOpen(true)}
            />
          </section>
        )}

        {/* STEP 5: SQL Server Script & Direct Execution */}
        {rows.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[11px]">
                ٥
              </span>
              <span>الخطوة الخامسة: الترحيل إلى SQL Server أو تصدير كود T-SQL</span>
            </div>
            <SqlScriptExporter
              tableSchema={tableSchema}
              rows={rows}
              sqlConfig={sqlConfig}
              isDbConnected={isDbConnected}
              onOpenDbModal={() => setIsDbModalOpen(true)}
            />
          </section>
        )}
      </main>

      {/* Floating Quick Voice Action Button */}
      <button
        onClick={() => setIsVoiceModalOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-2xl shadow-rose-600/40 border border-rose-400/40 hover:scale-105 transition-all cursor-pointer"
        title="الإدخال الصوتي: العدد، الوزن، الاسم، السعر، اسم النقلة"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <Mic className="w-4 h-4" />
        <span>إدخال صوتي للنقلات 🎙️</span>
      </button>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            مستخرج الدفاتر اليدوية إلى Microsoft SQL Server • مدعوم بنماذج الذكاء الاصطناعي متعددة الوسائط (Vision)
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>متوافق مع T-SQL</span>
            <span>SSMS & Azure Data Studio</span>
            <span>Unicode & UTF-8 Support</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        tableSchema={tableSchema}
        onAddRow={handleAddVoiceRow}
        onSyncColumnsIfNeeded={handleSyncColumnsForVoice}
        onOpenFruit67Workflow={() => setIsFruit67WorkflowOpen(true)}
      />

      <SqlServerModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        config={sqlConfig}
        onSaveConfig={handleSaveConfig}
        onImportTable={(importedTable) => {
          setTableSchema(importedTable);
          setActivePresetId('');
        }}
        isDbConnected={isDbConnected}
        setIsDbConnected={setIsDbConnected}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <Fruit67SyncModal
        isOpen={isFruit67ModalOpen}
        onClose={() => {
          setIsFruit67ModalOpen(false);
          getFruit67Status()
            .then((s) => {
              if (s && typeof s.pendingSyncCount === 'number') {
                setPendingSyncCount(s.pendingSyncCount);
              }
            })
            .catch(() => {});
        }}
        onSelectTable={(selectedTable) => {
          setTableSchema(selectedTable);
          setActivePresetId('');
        }}
        activeTableName={tableSchema.name}
        sqlConfig={sqlConfig}
        onSaveSqlConfig={handleSaveConfig}
      />

      <Fruit67WorkflowModel
        isOpen={isFruit67WorkflowOpen}
        onClose={() => setIsFruit67WorkflowOpen(false)}
      />
    </div>
  );
}
