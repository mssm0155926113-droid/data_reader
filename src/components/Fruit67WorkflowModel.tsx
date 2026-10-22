import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  ArrowDown,
  RefreshCw,
  Copy,
  Check,
  Code,
  Table as TableIcon,
  Layers,
  Truck,
  Users,
  Building2,
  DollarSign,
  FileText,
  BadgePercent,
  TrendingUp,
  Tag,
  ShieldCheck,
  ChevronDown,
  Play,
  RotateCcw
} from 'lucide-react';
import { fetchFruit67TableRecords, voiceStepIngestFruit67, resetFruit67Store } from '../services/api';

interface Fruit67WorkflowModelProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActiveStep = 'supplier_farm' | 'category' | 'nakla' | 'sales' | 'all';

export const Fruit67WorkflowModel: React.FC<Fruit67WorkflowModelProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeStepTab, setActiveStepTab] = useState<ActiveStep>('supplier_farm');
  const [activeTableTab, setActiveTableTab] = useState<string>('fatora_f');
  const [viewMode, setViewMode] = useState<'workflow' | 'tables' | 'sql'>('workflow');
  const [tablesData, setTablesData] = useState<Record<string, any[]>>({});
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [isLoadingTables, setIsLoadingTables] = useState<boolean>(false);

  // Workflow Context (Carries selected supplier, farm, item, shipment between steps)
  const [context, setContext] = useState<{
    supplierName: string;
    farmName: string;
    catName: string;
    catCode: number;
    byaaa: number;
    byaaaKhassa: number;
    naklaName: string;
    sequenceNumber: number;
  }>({
    supplierName: 'أحمد جابر',
    farmName: 'أحمد جابر',
    catName: 'مانجو فص',
    catCode: 104,
    byaaa: 3.0,
    byaaaKhassa: 1.5,
    naklaName: 'أحمد جابر 1',
    sequenceNumber: 1,
  });

  // Voice & Input State
  const [spokenText, setSpokenText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestResult, setIngestResult] = useState<{
    step?: string;
    summary?: string;
    transcript?: string;
    stepLogs?: string[];
    recordsAddedCount?: number;
    tablesAffected?: string[];
    tSqlScript?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Step-specific realistic sample phrases
  const STEP_SAMPLES: Record<ActiveStep, Array<{ title: string; desc: string; text: string }>> = {
    supplier_farm: [
      {
        title: 'المورد أحمد جابر (مورد جديد ومزرعته بنفس اسمه)',
        desc: 'قاعدة: فحص المورد في suppliers، وإن كان جديداً يضاف مع إنشاء مزرعة له في farm بنفس اسمه "أحمد جابر".',
        text: 'سجل المورد أحمد جابر مزرعة أحمد جابر',
      },
      {
        title: 'المعلم فوزي رضوان (مورد ومزرعة مسجلين مسبقاً)',
        desc: 'يتحقق من وجود المورد فوزي رضوان ويربطه بمزرعته السابقة المسجلة.',
        text: 'المورد المعلم فوزي رضوان مزرعة الإسماعيلية 1',
      },
      {
        title: 'الحاج إبراهيم خليل (مورد جديد بالكامل)',
        desc: 'إضافة مورد جديد بكود MAX+1 وإضافة مزرعة الحاج إبراهيم خليل له.',
        text: 'سجل مورد جديد الحاج إبراهيم خليل',
      },
    ],
    category: [
      {
        title: 'صنف جديد: مانجو فص (بياعة 3 وخاصة 1.5 كود MAX+1)',
        desc: 'قاعدة: الصنف الجديد يسجل بأعلى كود موجود + 1 مع تسجيل البياعة والبياعة الخاصة في category.',
        text: 'صنف جديد مانجو فص بياعة 3 خاصة 1.5',
      },
      {
        title: 'صنف جديد: عنب كريمسون (بياعة 2.5 وخاصة 1.25)',
        desc: 'إدراج صنف جديد عنب كريمسون بكود تسلسلي جديد.',
        text: 'صنف جديد عنب كريمسون فاخر بياعة 2.5 وبياعة خاصة 1.25',
      },
      {
        title: 'صنف مسجل مسبقاً: موز بلدي فاخر',
        desc: 'التعرف على صنف موجود مسبقاً بكوده المسجل وبياعته المعتمدة.',
        text: 'صنف موز بلدي فاخر',
      },
    ],
    nakla: [
      {
        title: 'نقلة أحمد جابر الأولى (أحمد جابر 1)',
        desc: 'قاعدة: ترتيب نقلات المورد تسلسلياً (أحمد جابر 1، ثم أحمد جابر 2...). وتسكين الأصناف في nakla_cat والمصاريف.',
        text: 'نقلة من المورد أحمد جابر صنف مانجو فص عدد مستلم 120 قفص نولون 500 وهبة 50',
      },
      {
        title: 'نقلة ثانية لنفس المورد (أحمد جابر 2)',
        desc: 'حساب عدد نقلات أحمد جابر السابقة وإطلاق اسم "أحمد جابر 2" عليها تلقائياً.',
        text: 'نقلة جديدة للمورد أحمد جابر صنف مانجو فص عدد مستلم 100 قفص نولون 450 وهبة 50',
      },
      {
        title: 'نقلة المعلم فوزي رضوان مع مصاريف',
        desc: 'تسكين نقلة للمورد فوزي رضوان مع نولون شحن 700 ج.م ووهبة سائق 100 ج.م.',
        text: 'نقلة من المورد المعلم فوزي رضوان صنف عنب بناتي أصفر عدد 150 قفص نولون 700 وهبة 100',
      },
    ],
    sales: [
      {
        title: 'بيع نقدي + بيع زمام لزبون جديد (بالترتيب: عدد -> وزن -> سعر)',
        desc: 'قاعدة: عدد ثم وزن ثم سعر. نقدي تسجل نقدي، وزمام تسجل لزبون جديد يضاف لـ customers ويرحل لـ zemam.',
        text: 'بيع 30 وزن 450 بسعر 40 نقدي وبيع 40 وزن 600 بسعر 40 زمام للعميل عماد الطوخي جديد',
      },
      {
        title: 'بيع زمام لزبون مسجل مسبقاً (طارق الصعيدي)',
        desc: 'تسكين المبيعات في fatora_f وترحيل المديونية لحساب طارق في جدول zemam.',
        text: 'بيع 50 سباطة وزن 1000 كيلو بسعر 35 زمام للزبون طارق الصعيدي',
      },
      {
        title: 'بيع نقدي فوري كامل للنقلة',
        desc: 'تسكين بيع نقدي مباشر للكمية المستلمة في fatora_f.',
        text: 'بيع 60 قفص وزن 900 كيلو بسعر 42 نقدي',
      },
    ],
    all: [
      {
        title: 'الدورة المتكاملة التتابعية (أحمد جابر 1 + صنف جديد + بيع نقدي وزمام)',
        desc: 'تنفيذ التتابع الكامل في خطوة واحدة: مورد ومزرعة أحمد جابر، صنف مانجو فص (MAX+1)، نقلة أحمد جابر 1، مبيعات fatora_f (نقدي وزمام للزبون عماد الطوخي MAX+1 وترحيل ذمم).',
        text: 'سجل المورد أحمد جابر مزرعة أحمد جابر صنف جديد مانجو فص بياعة 3 خاصة 1.5 نقلة عدد مستلم 120 قفص نولون 500 وهبة 50 بيع 30 وزن 450 بسعر 40 نقدي وبيع 40 وزن 600 بسعر 40 زمام للعميل عماد الطوخي جديد',
      },
      {
        title: 'الدورة المتكاملة: نقلة عنب للمورد فوزي رضوان مع مبيعات نقدي وزمام',
        desc: 'تسكين دورة كاملة للمورد فوزي رضوان مع مبيعات نقدية وآجلة متفرقة.',
        text: 'نقلة للمورد المعلم فوزي رضوان صنف عنب بناتي أصفر عدد مستلم 100 قفص بياعة 2.5 خاصة 1 نولون 400 وهبة 50 بيع 40 وزن 600 بسعر 35 نقدي وبيع 50 وزن 750 بسعر 35 زمام للزبون فتحي البقال',
      },
    ],
  };

  // Load tables records
  const loadTables = async () => {
    setIsLoadingTables(true);
    try {
      const res = await fetchFruit67TableRecords();
      if (res.success) {
        setTablesData(res.tables || {});
        setTableCounts(res.counts || {});
      }
    } catch (err: any) {
      console.error('Error loading tables:', err);
    } finally {
      setIsLoadingTables(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTables();
    }
  }, [isOpen]);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ar-EG';

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage(null);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setSpokenText(currentTranscript.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
    } else {
      setErrorMessage(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 200);
        }
      } else {
        setErrorMessage('المتصفح الحالي لا يدعم Web Speech. يمكنك كتابة النص أو اختيار أحد النماذج الجاهزة أدناه.');
      }
    }
  };

  // Execute Step-by-Step Voice Ingestion
  const handleExecuteStep = async (stepToRun?: ActiveStep, textToUse?: string) => {
    const targetStep = stepToRun || activeStepTab;
    const text = (textToUse || spokenText).trim();

    if (!text) {
      setErrorMessage('يرجى التحدث بالصوت أو كتابة النص أولاً قبل التنفيذ.');
      return;
    }

    setIsIngesting(true);
    setErrorMessage(null);

    try {
      const res = await voiceStepIngestFruit67({
        step: targetStep,
        spokenText: text,
        context: {
          supplierName: context.supplierName,
          farmName: context.farmName,
          catName: context.catName,
          catCode: context.catCode,
          byaaa: context.byaaa,
          byaaaKhassa: context.byaaaKhassa,
          naklaName: context.naklaName,
        },
      });

      if (res.success) {
        setIngestResult(res);
        await loadTables();

        // Update context based on the executed step
        setContext((prev) => ({
          ...prev,
          supplierName: res.supplierName || prev.supplierName,
          farmName: res.farmName || res.supplierName || prev.farmName,
          catName: res.catName || prev.catName,
          catCode: res.catCode || prev.catCode,
          byaaa: res.byaaa !== undefined ? res.byaaa : prev.byaaa,
          byaaaKhassa: res.byaaaKhassa !== undefined ? res.byaaaKhassa : prev.byaaaKhassa,
          naklaName: res.naklaName || prev.naklaName,
          sequenceNumber: res.sequenceNumber || prev.sequenceNumber,
        }));

        // Advance to next step automatically if in sequential flow
        if (targetStep === 'supplier_farm') {
          setActiveStepTab('category');
          setSpokenText('صنف جديد مانجو فص بياعة 3 خاصة 1.5');
        } else if (targetStep === 'category') {
          setActiveStepTab('nakla');
          setSpokenText(`نقلة من المورد ${res.supplierName || context.supplierName} صنف ${res.catName || context.catName} عدد مستلم 120 قفص نولون 500 وهبة 50`);
        } else if (targetStep === 'nakla') {
          setActiveStepTab('sales');
          setSpokenText('بيع 30 وزن 450 بسعر 40 نقدي وبيع 40 وزن 600 بسعر 40 زمام للعميل عماد الطوخي جديد');
        }
      } else {
        setErrorMessage(res.error || 'حدث خطأ أثناء معالجة الإدخال الصوتي.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشلت معالجة الإدخال الصوتي.');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('هل أنت متأكد من إعادة ضبط بيانات جداول fruit67 إلى الحالة النموذجية الأولية؟')) {
      return;
    }
    setIsLoadingTables(true);
    try {
      await resetFruit67Store();
      await loadTables();
      setIngestResult(null);
      setContext({
        supplierName: 'أحمد جابر',
        farmName: 'أحمد جابر',
        catName: 'مانجو فص',
        catCode: 104,
        byaaa: 3.0,
        byaaaKhassa: 1.5,
        naklaName: 'أحمد جابر 1',
        sequenceNumber: 1,
      });
    } catch (err: any) {
      alert('فشل إعادة الضبط: ' + err.message);
    } finally {
      setIsLoadingTables(false);
    }
  };

  const handleCopySql = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const TABLE_TABS = [
    { id: 'fatora_f', name: 'fatora_f (المبيعات المعتمد)', icon: FileText, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { id: 'nakla', name: 'nakla (النقلات والترتيب)', icon: Truck, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    { id: 'nakla_cat', name: 'nakla_cat (أصناف النقلة)', icon: Layers, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { id: 'category', name: 'category (دليل الأصناف MAX+1)', icon: Tag, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'suppliers', name: 'suppliers (الموردين)', icon: Building2, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { id: 'farm', name: 'farm (المزارع باسم المورد)', icon: Building2, color: 'text-lime-400 bg-lime-500/10 border-lime-500/30' },
    { id: 'customers', name: 'customers (الزبائن الجدد)', icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { id: 'zemam', name: 'zemam (الذمم والمتبقي)', icon: DollarSign, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { id: 'nakla_exps', name: 'nakla_exps (نولون ووهبة)', icon: TrendingUp, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  ];

  const currentTableRows = tablesData[activeTableTab] || [];
  const currentTableCols = currentTableRows.length > 0
    ? Object.keys(currentTableRows[0]).filter((k) => !k.startsWith('_'))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-7xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  نظام التتابع الصوتي المتسلسل لقاعدة بيانات fruit67
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SQL Server - تسكين آلي
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تتابع الـ 4 خطوات: <span className="text-purple-300 font-semibold">1. مورد ومزرعة</span> ➔ <span className="text-amber-300 font-semibold">2. صنف وبياعة (MAX+1)</span> ➔ <span className="text-indigo-300 font-semibold">3. نقلات متسلسلة (أحمد جابر 1، 2..)</span> ➔ <span className="text-emerald-300 font-semibold">4. مبيعات fatora_f (عدد، وزن، سعر، نقدي/زمام)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={isLoadingTables}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
              title="إعادة ضبط الجداول إلى السجلات الأولية النموذجية"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTables ? 'animate-spin' : ''}`} />
              إعادة ضبط البيانات
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Workflow Context Strip (Current Active Chain) */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              السلسلة النشطة الحالية:
            </span>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
              <Building2 className="w-3.5 h-3.5" />
              <span>المورد: <strong>{context.supplierName}</strong></span>
              <span className="text-purple-400/50">|</span>
              <span>المزرعة: <strong>{context.farmName}</strong></span>
            </div>

            <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <Tag className="w-3.5 h-3.5" />
              <span>الصنف: <strong>{context.catName}</strong></span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 font-mono text-[10px]">كود {context.catCode}</span>
              <span className="text-[10px] text-amber-400">(بياعة {context.byaaa} / خاصة {context.byaaaKhassa})</span>
            </div>

            <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              <Truck className="w-3.5 h-3.5" />
              <span>النقلة: <strong>{context.naklaName}</strong></span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 font-mono text-[10px]">ترتيب {context.sequenceNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('workflow')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'workflow'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              مسار التتابع الصوتي
            </button>
            <button
              onClick={() => setViewMode('tables')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'tables'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              معاينة الجداول ({Object.keys(tablesData).length})
            </button>
            {ingestResult?.tSqlScript && (
              <button
                onClick={() => setViewMode('sql')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  viewMode === 'sql'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                كود T-SQL
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* VIEW MODE 1: 4-STEP SEQUENTIAL VOICE PIPELINE */}
          {viewMode === 'workflow' && (
            <div className="space-y-6">
              
              {/* Step Navigation Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                
                {/* Step 1 Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStepTab('supplier_farm');
                    setSpokenText('سجل المورد أحمد جابر مزرعة أحمد جابر');
                  }}
                  className={`p-3 rounded-xl border text-right transition flex flex-col justify-between ${
                    activeStepTab === 'supplier_farm'
                      ? 'bg-purple-950/50 border-purple-500 ring-2 ring-purple-500/30 text-white shadow-lg shadow-purple-950/50'
                      : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      الخطوة 1
                    </span>
                    <Building2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-xs font-bold text-purple-200">الموردين والمزارع</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">البحث أو إضافة مورد جديد ومزرعته</div>
                </button>

                {/* Step 2 Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStepTab('category');
                    setSpokenText('صنف جديد مانجو فص بياعة 3 خاصة 1.5');
                  }}
                  className={`p-3 rounded-xl border text-right transition flex flex-col justify-between ${
                    activeStepTab === 'category'
                      ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/30 text-white shadow-lg shadow-amber-950/50'
                      : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      الخطوة 2 🎙️
                    </span>
                    <Tag className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xs font-bold text-amber-200">زر صوتي للأصناف</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">صنف جديد (MAX+1) وبياعة عادية وخاصة</div>
                </button>

                {/* Step 3 Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStepTab('nakla');
                    setSpokenText(`نقلة من المورد ${context.supplierName} صنف ${context.catName} عدد مستلم 120 قفص نولون 500 وهبة 50`);
                  }}
                  className={`p-3 rounded-xl border text-right transition flex flex-col justify-between ${
                    activeStepTab === 'nakla'
                      ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/30 text-white shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      الخطوة 3
                    </span>
                    <Truck className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-xs font-bold text-indigo-200">جدول النقلات وأصنافها</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">ترتيب النقلة (أحمد جابر 1، 2..) وتسكين nakla_cat</div>
                </button>

                {/* Step 4 Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStepTab('sales');
                    setSpokenText('بيع 30 وزن 450 بسعر 40 نقدي وبيع 40 وزن 600 بسعر 40 زمام للعميل عماد الطوخي جديد');
                  }}
                  className={`p-3 rounded-xl border text-right transition flex flex-col justify-between ${
                    activeStepTab === 'sales'
                      ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      الخطوة 4 ★
                    </span>
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs font-bold text-emerald-200">جدول المبيعات fatora_f</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">عدد ➔ وزن ➔ سعر ➔ نقدي أو زمام لزبون</div>
                </button>

                {/* Full Sequence Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveStepTab('all');
                    setSpokenText('سجل المورد أحمد جابر مزرعة أحمد جابر صنف جديد مانجو فص بياعة 3 خاصة 1.5 نقلة عدد مستلم 120 قفص نولون 500 وهبة 50 بيع 30 وزن 450 بسعر 40 نقدي وبيع 40 وزن 600 بسعر 40 زمام للعميل عماد الطوخي جديد');
                  }}
                  className={`p-3 rounded-xl border text-right transition flex flex-col justify-between ${
                    activeStepTab === 'all'
                      ? 'bg-sky-950/50 border-sky-500 ring-2 ring-sky-500/30 text-white shadow-lg shadow-sky-950/50'
                      : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                      التتابع الشامل
                    </span>
                    <Sparkles className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-xs font-bold text-sky-200">الدورة الكاملة دفعة واحدة</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">تشغيل الـ 4 خطوات معاً بأمر صوتي واحد</div>
                </button>

              </div>

              {/* Step Input Panel */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
                
                {/* Step Banner Explaining Current Task & Rules */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {activeStepTab === 'supplier_farm' && 'الخطوة 1: فحص واستخراج المورد وإضافة مزرعته في farm'}
                        {activeStepTab === 'category' && 'الخطوة 2: زر صوتي للأصناف والبياعة (قاعدة: كود الصنف = MAX + 1)'}
                        {activeStepTab === 'nakla' && `الخطوة 3: تحديد النقلة وأصنافها وترتيبها تسلسلياً (${context.supplierName} 1، ${context.supplierName} 2..)`}
                        {activeStepTab === 'sales' && 'الخطوة 4: تسجيل مبيعات fatora_f بالترتيب (عدد ➔ وزن ➔ سعر ➔ نقدي / زمام للزبون)'}
                        {activeStepTab === 'all' && 'التتابع الشامل: تشغيل كافة المراحل الأربعة بالترتيب الصوتي المعتمد'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeStepTab === 'supplier_farm' && 'يتم البحث في الموردين؛ إن كان مسجلاً يُربط به وبمزرعته، وإن كان جديداً يضاف مع إنشاء مزرعة بنفس اسمه.'}
                        {activeStepTab === 'category' && 'يتم فحص الصنف؛ وإن كان جديداً يضاف بكود تسلسلي أعلى من أكبر كود، وتحدد البياعة العادية والخاصة.'}
                        {activeStepTab === 'nakla' && `يتم ترقيم النقلة تلقائياً بحساب عدد نقلات المورد السابقة، وتسكين أصنافها المستلمة في nakla_cat ونولون/وهبة في nakla_exps.`}
                        {activeStepTab === 'sales' && 'يتم تسجيل كل صنف في fatora_f، وفي حالة زمام يُسجل الزبون تلقائياً في customers إن كان غير موجود وترحل المديونية لـ zemam.'}
                        {activeStepTab === 'all' && 'دورة كاملة تحاكي الوارد الفعلي بسوق الجملة من النقلة حتى المبيعات النقدية والآجلة.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Voice Recording Button */}
                    <button
                      onClick={handleToggleListening}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                        isListening
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span>إيقاف المايكروفون</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span>تسجيل صوتي حي 🎙️</span>
                        </>
                      )}
                    </button>

                    {/* Execute Button */}
                    <button
                      onClick={() => handleExecuteStep()}
                      disabled={isIngesting || (!spokenText.trim() && !isListening)}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      {isIngesting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري التسكين...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>تنفيذ وتسجيل الخطوة ⚡</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Spoken Text Box */}
                <div className="relative">
                  <textarea
                    value={spokenText}
                    onChange={(e) => setSpokenText(e.target.value)}
                    placeholder="تحدث بالمايك أو اكتب هنا للتحليل والتسكين..."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
                  />
                  {isListening && (
                    <div className="absolute left-3 bottom-3 flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>جاري الاستماع لصوتك بالعامية/الفصحى...</span>
                    </div>
                  )}
                </div>

                {/* Quick Interactive Samples for This Step */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    نماذج جاهزة للاختبار الفوري لهذه الخطوة بنقرة واحدة:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {STEP_SAMPLES[activeStepTab].map((sample, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => {
                          setSpokenText(sample.text);
                          handleExecuteStep(activeStepTab, sample.text);
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-700/70 border border-slate-700/70 text-right transition flex flex-col justify-between gap-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-300 group-hover:text-indigo-200">
                            {sample.title}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                            تنفيذ فوراً ⚡
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{sample.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

              </div>

              {/* Execution Result & Chronological Step Logs */}
              {ingestResult && (
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-sm font-bold text-emerald-200 block">
                          {ingestResult.summary}
                        </span>
                        <span className="text-xs text-slate-400">
                          النص المنطوق: "{ingestResult.transcript}"
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        +{ingestResult.recordsAddedCount} سجل تم تسكينه
                      </span>
                      <button
                        onClick={() => setViewMode('tables')}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1"
                      >
                        <span>استعراض الجداول</span>
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Step Logs List */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {ingestResult.stepLogs?.map((log, lIdx) => (
                      <div
                        key={lIdx}
                        className="text-xs font-mono py-1.5 px-3 rounded-lg bg-slate-900/80 text-slate-200 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <span>{log}</span>
                        <span className="text-[10px] text-emerald-400 font-sans font-bold shrink-0">تم التسكين ✓</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pipeline Architectural Flow Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Flow 1: Suppliers & Farm */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  activeStepTab === 'supplier_farm'
                    ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/30'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        1. الموردين والمزارع
                      </span>
                      <Building2 className="w-4 h-4 text-purple-400" />
                    </div>
                    <h5 className="text-xs font-bold text-white mb-1">suppliers & farm</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      فحص المورد بالاسم. إذا كان جديداً يضاف بكود تسلسلي جديد، وتضاف مزرعة له بنفس اسمه.
                    </p>
                  </div>
                  <div className="p-2 rounded bg-slate-900/90 text-[10px] font-mono text-purple-300 border border-slate-800">
                    <div>suppliers: {context.supplierName}</div>
                    <div>farm: {context.farmName}</div>
                  </div>
                </div>

                {/* Flow 2: Category & Byaaa */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  activeStepTab === 'category'
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/30'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        2. زر صوتي للأصناف
                      </span>
                      <Tag className="w-4 h-4 text-amber-400" />
                    </div>
                    <h5 className="text-xs font-bold text-white mb-1">category (MAX+1)</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      إذا كان الصنف جديداً يسجل بكود <strong className="text-amber-300">MAX(cat_code) + 1</strong> مع بياعته وبياعته الخاصة.
                    </p>
                  </div>
                  <div className="p-2 rounded bg-slate-900/90 text-[10px] font-mono text-amber-300 border border-slate-800">
                    <div>الصنف: {context.catName}</div>
                    <div>كود: {context.catCode} | بياعة: {context.byaaa}</div>
                  </div>
                </div>

                {/* Flow 3: Sequential Nakla */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  activeStepTab === 'nakla'
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/30'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        3. ترتيب النقلات
                      </span>
                      <Truck className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h5 className="text-xs font-bold text-white mb-1">nakla & nakla_cat</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      ترتيب النقلات تسلسلياً لكل مورد: <strong className="text-indigo-300">{context.supplierName} 1</strong> ثم <strong className="text-indigo-300">{context.supplierName} 2</strong>.
                    </p>
                  </div>
                  <div className="p-2 rounded bg-slate-900/90 text-[10px] font-mono text-indigo-300 border border-slate-800">
                    <div>اسم النقلة: {context.naklaName}</div>
                    <div>تسكين أصناف: nakla_cat</div>
                  </div>
                </div>

                {/* Flow 4: Sales fatora_f */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  activeStepTab === 'sales'
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        4. المبيعات fatora_f
                      </span>
                      <FileText className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h5 className="text-xs font-bold text-white mb-1">fatora_f & zemam</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      ادخال: <strong className="text-emerald-300">عدد ➔ وزن ➔ سعر ➔ نقدي/زمام</strong>. الزبون الجديد يضاف لـ customers ويرحل لـ zemam.
                    </p>
                  </div>
                  <div className="p-2 rounded bg-slate-900/90 text-[10px] font-mono text-emerald-300 border border-slate-800">
                    <div>fatora_f: sobata_num, net_weight</div>
                    <div>سداد: cash / zemam</div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW MODE 2: Database Tables Viewer */}
          {viewMode === 'tables' && (
            <div className="space-y-4">
              {/* Tab Buttons matching SQL tables */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
                {TABLE_TABS.map((tab) => {
                  const count = tableCounts[tab.id] || 0;
                  const isSelected = activeTableTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTableTab(tab.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border ${
                        isSelected
                          ? tab.color + ' ring-2 ring-indigo-500/30'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-slate-700/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.name}</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900 text-slate-300 font-mono">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Table Data View */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">الجدول المستعرض:</span>
                    <strong className="text-sm font-mono text-emerald-400 font-bold">[dbo].[{activeTableTab}]</strong>
                    <span className="text-xs text-slate-400">({currentTableRows.length} سجل محلي)</span>
                  </div>
                  {activeTableTab === 'fatora_f' && (
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ★ جدول المبيعات المعتمد
                    </span>
                  )}
                </div>

                {currentTableRows.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 text-xs">
                    لا توجد سجلات حالياً في هذا الجدول. قم بتجربة أحد النماذج الصوتية أعلاه لتسكين البيانات فوراً!
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-900 text-slate-300 font-mono text-[11px] sticky top-0 z-10 border-b border-slate-800">
                        <tr>
                          <th className="p-2.5 text-center">#</th>
                          {currentTableCols.map((col) => (
                            <th key={col} className="p-2.5 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                          <th className="p-2.5 text-center">حالة المزامنة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {currentTableRows.map((row, rIdx) => {
                          const isPending = row._syncStatus === 'pending';
                          return (
                            <tr
                              key={rIdx}
                              className={`hover:bg-slate-800/40 transition ${
                                isPending ? 'bg-indigo-950/20' : ''
                              }`}
                            >
                              <td className="p-2.5 text-center text-slate-500 font-mono">
                                {rIdx + 1}
                              </td>
                              {currentTableCols.map((col) => {
                                const val = row[col];
                                const isCashCol = col === 'cash';
                                const isZemamCol = col === 'zemam' || col === 'safi_zemam';
                                const isCodeCol = col === 'cat_code' || col === 'customer_code';

                                return (
                                  <td key={col} className="p-2.5 whitespace-nowrap text-slate-200">
                                    {isCashCol ? (
                                      val === 1 || val === true ? (
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                          نقدي 💵
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                          زمام (آجل) ⏳
                                        </span>
                                      )
                                    ) : isCodeCol ? (
                                      <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                        {val}
                                      </span>
                                    ) : isZemamCol && val ? (
                                      <span className="font-mono font-bold text-rose-300">
                                        {Number(val).toLocaleString()} ج.م
                                      </span>
                                    ) : val !== null && val !== undefined ? (
                                      typeof val === 'number' ? (
                                        <span className="font-mono">{val}</span>
                                      ) : (
                                        String(val)
                                      )
                                    ) : (
                                      <span className="text-slate-600 font-mono text-[10px]">NULL</span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="p-2.5 text-center">
                                {isPending ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    محلي جاهز للتصدير
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    متزامن
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Generated T-SQL Script */}
          {viewMode === 'sql' && ingestResult?.tSqlScript && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-amber-400" />
                    كود T-SQL المتولد تلقائياً للنقلة والمبيعات
                  </h4>
                  <p className="text-xs text-slate-400">
                    يمكن نسخ هذا الكود ولصقه مباشرة في Microsoft SQL Server Management Studio (SSMS) على كمبيوترك.
                  </p>
                </div>
                <button
                  onClick={() => handleCopySql(ingestResult.tSqlScript!)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 transition flex items-center gap-1.5"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ كود SQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[500px] leading-relaxed">
                  {ingestResult.tSqlScript}
                </pre>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
