import React from 'react';
import { X, BookOpen, CheckCircle, Database, Sparkles, FileText, ArrowRight, ShieldAlert } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                دليل استخدام مستخرج الدفاتر اليدوية إلى SQL Server
              </h2>
              <p className="text-xs text-slate-400">
                خطوات تحويل دفاتر الحسابات والمبيعات الورقية إلى جداول قواعد بيانات
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-right text-xs leading-relaxed text-slate-300">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">
                1
              </span>
              <span>تحديد جدول وأعمدة SQL Server المستهدفة</span>
            </div>
            <p>
              حدد اسم الجدول (مثلاً <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">DailyLedger</code>) والأعمدة وأنواع البيانات المتوافقة مع Microsoft SQL Server مثل:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pr-2">
              <li><strong className="text-slate-200">NVARCHAR</strong>: للنصوص العربية والإنجليزية وأسماء العملاء والبيان.</li>
              <li><strong className="text-slate-200">DECIMAL(18,2)</strong>: للمبالغ المالية والأسعار والأرصدة والضرائب.</li>
              <li><strong className="text-slate-200">DATE أو DATETIME2</strong>: لتواريخ السجلات والحركات.</li>
              <li><strong className="text-slate-200">INT</strong>: للكميات والأرقام التسلسلية والكود.</li>
            </ul>
            <p className="text-slate-400 pt-1">
              يمكنك أيضاً استخدام نماذج الجداول الجاهزة (مبيعات، حسابات عملاء، مخازن) أو لصق استعلام <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">CREATE TABLE</code> وسيقوم التطبيق بتحليله تلقائياً.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-xs">
                2
              </span>
              <span>التقاط صورة الدفتر اليدوي ورفعها</span>
            </div>
            <p>
              قم بتصوير ورقة الدفتر بهاتفك أو رفع مسح ضوئي (Scan) أو اختيار أحد النماذج التجريبية الجاهزة.
            </p>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
              💡 <strong className="font-semibold">نصيحة لجودة أعلى:</strong> استخدم فلتر "التباين العالي" في شريط أدوات الصورة إذا كانت الكتابة بقلم رصاص خفيف أو باهت، واحرص على تسوية زوايا الورقة.
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">
                3
              </span>
              <span>التحليل بالذكاء الاصطناعي والمراجعة الفورية</span>
            </div>
            <p>
              يقوم الذكاء الاصطناعي (Gemini Multimodal Vision) بقراءة الخط اليدوي والأرقام (سواء كانت أرقام عربية ٠-٩ أو لاتينية 0-9) وترتيبها في الجدول.
            </p>
            <p>
              يتم تمييز أي قيمة مشكوك فيها برمز تحذيري برتقالي لتراجعها بالعين وتعديلها بنقرة واحدة داخل جدول المراجعة.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                4
              </span>
              <span>الإدخال في قاعدة بيانات SQL Server</span>
            </div>
            <p>لديك طريقتان لحفظ البيانات:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pr-2">
              <li>
                <strong className="text-slate-200">الإدخال المباشر (Direct Connect):</strong> أدخل بيانات سيرفرك (Server, Database, User, Password) واضغط "تنفيذ الإدخال"، ليتم ترحيل البيانات عبر Transaction آمنة.
              </li>
              <li>
                <strong className="text-slate-200">توليد ملف T-SQL:</strong> إذا كان السيرفر على شبكة داخلية بدون وصول إنترنت، اضغط "نسخ كود T-SQL" أو "تحميل .sql" وشغله مباشرة في SQL Server Management Studio (SSMS).
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
          >
            فهمت، ابدأ العمل
          </button>
        </div>
      </div>
    </div>
  );
};
