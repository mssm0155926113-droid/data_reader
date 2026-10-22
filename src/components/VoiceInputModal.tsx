import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Volume2, 
  Plus, 
  RefreshCw,
  Hash,
  Scale,
  User,
  DollarSign,
  Truck
} from 'lucide-react';
import { TableDefinition, ExtractedRow } from '../types/ledger';
import { parseVoiceInput } from '../services/api';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableSchema: TableDefinition;
  onAddRow: (newRow: ExtractedRow) => void;
  onSyncColumnsIfNeeded: () => void;
  onOpenFruit67Workflow?: () => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  tableSchema,
  onAddRow,
  onSyncColumnsIfNeeded,
  onOpenFruit67Workflow,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted values
  const [extractedCount, setExtractedCount] = useState<string>('');
  const [extractedWeight, setExtractedWeight] = useState<string>('');
  const [extractedName, setExtractedName] = useState<string>('');
  const [extractedPrice, setExtractedPrice] = useState<string>('');
  const [extractedTripName, setExtractedTripName] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Sample phrases for quick testing (General Ledger & Wholesale Fruit Market)
  const SAMPLE_VOICE_PHRASES = [
    'سجل نقلة عنب بناتي من المورد المعلم فوزي رضوان مزرعة الإسماعيلية 1 نولون 500 وهبة 50 صنف عنب بناتي أصفر عدد 120 قفص وزن 1800 كيلو بسعر 35 نقدي للعميل فتحي',
    'نقلة مانجو عويس من المعلم فوزي مزرعة الإسماعيلية نولون 700 وهبة 100 صنف مانجو عويس جديد عدد 150 وزن 2250 بسعر 50 زمام للعميل عماد الطوخي',
    'العدد 40 والوزن 12 طن ونص والاسم الحاج محمود عاشور والسعر 3500 واسم النقلة نقلة رمل أحمر مباني',
    'نقلة سن 2 خرسانة الاسم شركة المقاولون العرب العدد 25 والوزن 8 طن والسعر 2800 جنيه',
    'سجل نقلة حديد تسليح 12 مم لعميل رمضان الدسوقي العدد 10 والوزن 15 طن والسعر 18500',
    'نقلة أسمنت بورتلاندي العدد 100 شيكارة الوزن 5 طن الاسم مؤسسة السلام السعر 4200',
  ];

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ar-EG'; // Egyptian & Standard Arabic

        recognition.onstart = () => {
          setIsListening(true);
          setStatusMessage('جاري الاستماع لصوتك باللغة العربية... تحدث الآن');
          setErrorMessage(null);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setErrorMessage('يرجى السماح بالوصول إلى الميكروفون في المتصفح.');
          }
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

  // Toggle voice listening
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
      setStatusMessage('تم إيقاف التسجيل. يمكنك الضغط على "تحليل واستخراج الحقول"');
      if (transcript.trim()) {
        handleProcessVoiceText(transcript);
      }
    } else {
      setTranscript('');
      setErrorMessage(null);
      setStatusMessage('جاري بدء التسجيل...');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err: any) {
          console.error(err);
          // If already started or failed, restart
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 200);
        }
      } else {
        // Fallback prompt
        setErrorMessage('المتصفح لا يدعم التعرف الصوتي المباشر Web Speech. يمكنك كتابة أو لصق العبارة أو تجربة أحد النماذج السريعة أدناه.');
      }
    }
  };

  // Process text using Gemini backend endpoint
  const handleProcessVoiceText = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('جاري تحليل الصوت بالذكاء الاصطناعي واستخراج الحقول الخمسة...');

    try {
      const res = await parseVoiceInput({ spokenText: textToProcess });
      if (res.success && res.data) {
        const d = res.data;
        setExtractedCount(d.count !== null && d.count !== undefined ? String(d.count) : '');
        setExtractedWeight(d.weight !== null && d.weight !== undefined ? String(d.weight) : '');
        setExtractedName(d.name || '');
        setExtractedPrice(d.price !== null && d.price !== undefined ? String(d.price) : '');
        setExtractedTripName(d.tripName || '');

        setStatusMessage('تم استخراج (العدد، الوزن، الاسم، السعر، اسم النقلة) بنجاح!');
      } else {
        setErrorMessage(res.error || 'تعذر استخراج الحقول من العبارة الصوتية');
      }
    } catch (err: any) {
      setErrorMessage('حدث خطأ أثناء معالجة الصوت: ' + (err.message || String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  // Add the extracted record to the ledger data
  const handleInsertRow = () => {
    if (!extractedName && !extractedTripName && !extractedCount) {
      setErrorMessage('يرجى التأكد من استخراج البيانات قبل الإدراج');
      return;
    }

    // Map fields smartly to existing table columns
    const cells: Record<string, any> = {};

    tableSchema.columns.forEach((col) => {
      const colLower = col.name.toLowerCase();
      const labelLower = (col.labelAr || '').toLowerCase();

      if (colLower.includes('trip') || labelLower.includes('نقلة')) {
        cells[col.name] = { columnName: col.name, value: extractedTripName, confidence: 0.99 };
      } else if (colLower.includes('name') || colLower.includes('client') || labelLower.includes('اسم') || labelLower.includes('عميل')) {
        cells[col.name] = { columnName: col.name, value: extractedName, confidence: 0.99 };
      } else if (colLower.includes('count') || colLower.includes('qty') || labelLower.includes('عدد') || labelLower.includes('كمية')) {
        cells[col.name] = { columnName: col.name, value: extractedCount || '1', confidence: 0.99 };
      } else if (colLower.includes('weight') || labelLower.includes('وزن')) {
        cells[col.name] = { columnName: col.name, value: extractedWeight || '0.00', confidence: 0.99 };
      } else if (colLower.includes('price') || colLower.includes('amount') || colLower.includes('credit') || labelLower.includes('سعر') || labelLower.includes('مبلغ')) {
        cells[col.name] = { columnName: col.name, value: extractedPrice || '0.00', confidence: 0.99 };
      } else if (colLower.includes('date') || labelLower.includes('تاريخ')) {
        cells[col.name] = { columnName: col.name, value: new Date().toISOString().slice(0, 10), confidence: 1 };
      } else {
        // default fallback
        cells[col.name] = { columnName: col.name, value: col.isNullable ? null : '', confidence: 1 };
      }
    });

    const newRow: ExtractedRow = {
      id: `voice-row-${Date.now()}`,
      rowNumber: Date.now() % 1000,
      cells: cells,
      rawLineText: `[إدخال صوتي]: ${transcript || `${extractedTripName} - ${extractedName} - ${extractedCount} - ${extractedWeight} طن - ${extractedPrice} ج.م`}`,
      confidence: 0.99,
      status: 'valid',
    };

    onAddRow(newRow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl shadow-indigo-950/50">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
            }`}>
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                الإدخال الصوتي الذكي لحركات النقل والحمولات
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ذكاء اصطناعي صوتي
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                تحدث بحرية باللغة العربية وسيتم استخراج (العدد، الوزن، الاسم، السعر، اسم النقلة) تلقائياً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-right">
          {/* fruit67 Relational Workflow Shortcut */}
          {onOpenFruit67Workflow && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/50 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-200">
                  هل تريد إدخال نقلة متعددة الأصناف والمبيعات مع ترحيل <strong className="text-emerald-300">fatora_f والذمم</strong>؟
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFruit67Workflow();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shrink-0 cursor-pointer shadow"
              >
                فتح نموذج الجداول المتقدم ➔
              </button>
            </div>
          )}

          {/* Main Voice Activation Area */}
          <div className={`relative p-6 rounded-2xl border text-center transition-all ${
            isListening
              ? 'bg-rose-950/30 border-rose-500/50 shadow-inner'
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
          }`}>
            <button
              type="button"
              onClick={handleToggleListening}
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white ring-8 ring-rose-500/20 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 shadow-indigo-600/30'
              }`}
            >
              {isListening ? (
                <MicOff className="w-9 h-9" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>

            <div className="mt-3">
              <div className="text-sm font-bold text-white">
                {isListening ? 'جاري الاستماع الآن... تكلم بحرية' : 'اضغط على الميكروفون لبدء التحدث'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {statusMessage || 'قل مثلاً: "العدد عشرين والوزن خمسة طن والاسم شركة الأهرام والسعر 3500 واسم النقلة نقلة حديد"'}
              </div>
            </div>

            {/* Live Waveform Pulse when listening */}
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 mt-3 h-6">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-rose-400 rounded-full animate-bounce"
                    style={{
                      animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                      height: `${12 + (i % 4) * 5}px`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Transcript Display Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                النص الصوتي المسموع:
              </span>
              {transcript && (
                <button
                  onClick={() => handleProcessVoiceText(transcript)}
                  disabled={isProcessing}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>إعادة التحليل</span>
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="سيظهر الكلام المنطوق هنا مباشرة، أو يمكنك كتابته ولصقه هنا..."
              className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium leading-relaxed"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Extracted 5 Fields Box */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                الحقول المستخرجة بالذكاء الاصطناعي (قابلة للتعديل):
              </span>
              {isProcessing && (
                <span className="text-xs text-sky-400 flex items-center gap-1 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  جاري التحليل...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* 1. اسم النقلة */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-sky-400" />
                  <span>اسم النقلة (الحمولة / المادة):</span>
                </label>
                <input
                  type="text"
                  value={extractedTripName}
                  onChange={(e) => setExtractedTripName(e.target.value)}
                  placeholder="مثال: نقلة رمل أحمر مباني"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 2. الاسم */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الاسم (العميل / السائق):</span>
                </label>
                <input
                  type="text"
                  value={extractedName}
                  onChange={(e) => setExtractedName(e.target.value)}
                  placeholder="مثال: محمود عاشور"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 3. العدد */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-indigo-400" />
                  <span>العدد:</span>
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={extractedCount}
                  onChange={(e) => setExtractedCount(e.target.value)}
                  placeholder="مثال: 40"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono font-medium focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>

              {/* 4. الوزن */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>الوزن (طن / كجم):</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={extractedWeight}
                  onChange={(e) => setExtractedWeight(e.target.value)}
                  placeholder="مثال: 12.50"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono font-medium focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>

              {/* 5. السعر */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>السعر (ج.م):</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={extractedPrice}
                  onChange={(e) => setExtractedPrice(e.target.value)}
                  placeholder="مثال: 3500.00"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-emerald-300 font-mono font-bold focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>
            </div>
          </div>

          {/* Quick Examples Pills for Testing */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium text-slate-400">
              💡 أو انقر على أحد النماذج الصوتية الجاهزة للاختبار الفوري بنقرة واحدة:
            </div>
            <div className="space-y-1.5">
              {SAMPLE_VOICE_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTranscript(phrase);
                    handleProcessVoiceText(phrase);
                  }}
                  className="w-full text-right p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 text-slate-300 text-xs transition-colors flex items-center justify-between gap-2"
                >
                  <span className="truncate">"{phrase}"</span>
                  <span className="shrink-0 text-[10px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10">
                    تجربة
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleInsertRow}
              disabled={!extractedTripName && !extractedName && !extractedCount}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إدراج السجل في الجدول و SQL Server</span>
            </button>

            <button
              onClick={onSyncColumnsIfNeeded}
              className="px-3 py-2 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-colors"
              title="تحديث أعمدة الجدول لتشمل العدد والوزن والاسم والسعر واسم النقلة"
            >
              مزامنة أعمدة الجدول
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
