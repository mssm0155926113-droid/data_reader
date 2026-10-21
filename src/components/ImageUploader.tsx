import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Sparkles, ZoomIn, ZoomOut, RotateCw, Contrast, Image as ImageIcon, Loader2, AlertCircle, FileText } from 'lucide-react';

interface ImageUploaderProps {
  imageSrc: string | null;
  onImageChange: (base64: string, triggerAutoTest?: boolean) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  customNotes: string;
  setCustomNotes: (notes: string) => void;
  tableColsCount: number;
  autoTestOnUpload: boolean;
  setAutoTestOnUpload: (val: boolean) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageSrc,
  onImageChange,
  onAnalyze,
  isAnalyzing,
  customNotes,
  setCustomNotes,
  tableColsCount,
  autoTestOnUpload,
  setAutoTestOnUpload,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [filterMode, setFilterMode] = useState<'normal' | 'contrast' | 'invert'>('normal');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle global paste event (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                const imgData = event.target.result as string;
                onImageChange(imgData, autoTestOnUpload);
                setZoomLevel(1);
                setRotation(0);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageChange, autoTestOnUpload]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const imgData = e.target.result as string;
        onImageChange(imgData, autoTestOnUpload);
        setZoomLevel(1);
        setRotation(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const getFilterStyle = () => {
    if (filterMode === 'contrast') {
      return 'contrast-200 grayscale brightness-95';
    }
    if (filterMode === 'invert') {
      return 'invert contrast-150 brightness-90';
    }
    return '';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Title & Auto-Test Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-white">
            صورة الدفتر اليدوي (ورقة السجل)
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer bg-slate-950/90 px-2.5 py-1 rounded-lg border border-indigo-500/30 text-xs shadow-sm">
            <input
              type="checkbox"
              checked={autoTestOnUpload}
              onChange={(e) => setAutoTestOnUpload(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
            />
            <span className="font-semibold text-emerald-300">
              ⚡ استخراج واختبار فوري في الملف عند الرفع
            </span>
          </label>
          <span className="text-[11px] text-slate-500 hidden md:inline">
            يدعم السحب والإفلات أو اللصق (Ctrl+V)
          </span>
        </div>
      </div>

      {/* Image Preview & Upload Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all bg-slate-950/70 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-950/20'
            : 'border-slate-800 hover:border-slate-700'
        } min-h-[320px] flex flex-col items-center justify-center`}
      >
        {imageSrc ? (
          <div className="relative w-full h-[380px] flex items-center justify-center overflow-hidden bg-slate-950">
            {/* Action Bar Floating Overlay */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="تكبير الصورة"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="تصغير الصورة"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="تدوير 90 درجة"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode((m) => (m === 'normal' ? 'contrast' : m === 'contrast' ? 'invert' : 'normal'));
                }}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                  filterMode !== 'normal'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="فلتر توضيح الخط والتباين"
              >
                <Contrast className="w-4 h-4" />
                <span className="text-[10px] hidden sm:inline">
                  {filterMode === 'contrast' ? 'تباين عالي' : filterMode === 'invert' ? 'معكوس' : 'توضيح'}
                </span>
              </button>
            </div>

            {/* Replace Button */}
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md rounded-xl border border-slate-700/60 shadow-lg transition-colors"
              >
                تغيير الصورة
              </button>
            </div>

            {/* Rendered Image */}
            <div
              className="w-full h-full flex items-center justify-center p-4 transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              }}
            >
              <img
                src={imageSrc}
                alt="ورقة الدفتر اليدوي"
                className={`max-w-full max-h-full object-contain rounded-lg shadow-xl transition-all ${getFilterStyle()}`}
              />
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                ارفع صورة أو التقط صورة لدفتر الحسابات اليدوي
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                اسحب ملف الصورة وأفلته هنا، أو الصقه من الحافظة مباشرة
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>اختيار صورة من الجهاز</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('capture', 'environment');
                    fileInputRef.current.click();
                  }
                }}
                className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-sky-400" />
                <span>التقاط بالكاميرا</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* AI Custom Guidance Notes */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>ملاحظات إضافية موجهة للذكاء الاصطناعي (اختياري):</span>
        </label>
        <input
          type="text"
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder="مثال: تجاهل السطور المشطوبة بالقلم الأحمر، أو ركز على أسماء العملاء في العمود الثالث..."
          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Submit / Analyze CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!imageSrc || isAnalyzing || tableColsCount === 0}
          className="w-full py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-700 hover:from-sky-500 hover:via-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري قراءة خط اليد وتعيين البيانات على جدول SQL Server...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-sky-300" />
              <span>بدء قراءة الدفتر واستخراج السجلات بالذكاء الاصطناعي</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
