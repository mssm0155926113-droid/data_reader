import { PresetLedger } from '../types/ledger';

// Helper to generate realistic high-resolution SVG ledger sheet data URIs
function createLedgerSvgDataUrl(
  title: string,
  headers: string[],
  rows: string[][],
  dateNote: string
): string {
  const width = 1000;
  const height = 700;
  const colWidth = Math.floor((width - 80) / headers.length);

  let headerCells = '';
  headers.forEach((h, i) => {
    const x = width - 40 - (i + 1) * colWidth;
    headerCells += `
      <rect x="${x}" y="80" width="${colWidth}" height="42" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5" />
      <text x="${x + colWidth / 2}" y="106" font-family="'Cairo', 'Amiri', 'Traditional Arabic', sans-serif" font-weight="bold" font-size="16" fill="#1e293b" text-anchor="middle">${h}</text>
    `;
  });

  let rowCells = '';
  rows.forEach((row, rIdx) => {
    const y = 122 + rIdx * 45;
    const bg = rIdx % 2 === 0 ? '#fafafa' : '#ffffff';
    // Lined notebook horizontal rule
    rowCells += `<line x1="30" y1="${y + 45}" x2="${width - 30}" y2="${y + 45}" stroke="#cbd5e1" stroke-dasharray="2,2" stroke-width="1" />`;

    row.forEach((val, cIdx) => {
      const x = width - 40 - (cIdx + 1) * colWidth;
      // Slight handwritten rotation and organic font styling
      const jitterRot = ((rIdx * 7 + cIdx * 13) % 5) - 2;
      const jitterY = ((rIdx * 3 + cIdx * 5) % 4) - 2;

      rowCells += `
        <rect x="${x}" y="${y}" width="${colWidth}" height="45" fill="${bg}" fill-opacity="0.6" stroke="#e2e8f0" stroke-width="1" />
        <g transform="rotate(${jitterRot * 0.4} ${x + colWidth / 2} ${y + 28})">
          <text x="${x + colWidth / 2}" y="${y + 28 + jitterY}" font-family="'Amiri', 'Cairo', 'Reem Kufi', cursive, sans-serif" font-size="16" fill="#0f172a" text-anchor="middle">${val}</text>
        </g>
      `;
    });
  });

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <pattern id="ledgerGrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="0.8"/>
      </pattern>
      <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fffef8" />
        <stop offset="100%" stop-color="#fefce8" />
      </linearGradient>
    </defs>
    
    <!-- Paper Sheet Background -->
    <rect width="${width}" height="${height}" fill="url(#paperGrad)" />
    <rect width="${width}" height="${height}" fill="url(#ledgerGrid)" />
    
    <!-- Notebook red margin lines -->
    <line x1="35" y1="0" x2="35" y2="${height}" stroke="#fca5a5" stroke-width="2" />
    <line x1="${width - 35}" y1="0" x2="${width - 35}" y2="${height}" stroke="#fca5a5" stroke-width="2" />
    <line x1="0" y1="65" x2="${width}" y2="65" stroke="#93c5fd" stroke-width="2" />

    <!-- Ledger Header Hand written title -->
    <rect x="300" y="16" width="400" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
    <text x="${width / 2}" y="42" font-family="'Amiri', 'Cairo', cursive, sans-serif" font-size="22" font-weight="bold" fill="#0369a1" text-anchor="middle">📓 ${title}</text>
    <text x="60" y="42" font-family="'Cairo', sans-serif" font-size="14" fill="#64748b">${dateNote}</text>
    <text x="${width - 60}" y="42" font-family="'Cairo', sans-serif" font-size="14" fill="#64748b" text-anchor="end">صفحة رقم: ١٤</text>

    <!-- Table Content -->
    ${headerCells}
    ${rowCells}

    <!-- Bottom Stamp / Handwritten Sign -->
    <text x="${width - 150}" y="${height - 35}" font-family="'Amiri', cursive" font-size="16" fill="#334155" text-anchor="middle">توقيع المسؤول: أحمد فتحي</text>
    <text x="160" y="${height - 35}" font-family="'Cairo', sans-serif" font-size="13" fill="#64748b">تمت المراجعة والتسوية اليومية</text>
  </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const PRESET_LEDGERS: PresetLedger[] = [
  {
    id: 'daily-sales-expenses',
    titleAr: 'دفتر يومية المبيعات والمصروفات',
    descriptionAr: 'دفتر يدوي لتسجيل حركة المقبوضات والمدفوعات النقدية اليومية ورصيد الخزينة',
    suggestedNotes: 'يرجى تحويل الأرقام إلى قيم رقمية صحيحة واستخراج كل حركة كصف مستقل.',
    sampleImage: createLedgerSvgDataUrl(
      'دفتر المقبوضات والمصروفات اليومية',
      ['م', 'التاريخ', 'البيان والتفاصيل', 'الوارد (مدين)', 'المنصرف (دائن)', 'طريقة الدفع', 'الملاحظات'],
      [
        ['1', '2024-10-01', 'مبيعات نقدية فاتورة 104', '3500.00', '0.00', 'نقداً', 'مستلم من الكاشير'],
        ['2', '2024-10-01', 'سداد فاتورة كهرباء الفرع', '0.00', '420.50', 'نقداً', 'وصل رقم 8892'],
        ['3', '2024-10-02', 'دفعة عميل شركة الأمل', '8200.00', '0.00', 'تحويل بنكي', 'شيك رقم 4410'],
        ['4', '2024-10-02', 'شراء أدوات نظافة وضيافة', '0.00', '165.00', 'نقداً', 'عهدة المحل'],
        ['5', '2024-10-03', 'مبيعات منتجات ورقية وجملة', '5400.00', '0.00', 'شبكة مدى', 'عملية 7721'],
        ['6', '2024-10-03', 'مصاريف صيانة مكيف', '0.00', '350.00', 'نقداً', 'ورشة السلام'],
        ['7', '2024-10-04', 'دفعة مورد أقمشة ومواد خام', '0.00', '4500.00', 'شيك', 'استحقاق 10 أكتوبر'],
        ['8', '2024-10-04', 'إيراد مبيعات تجزئة مسائي', '2850.75', '0.00', 'نقداً', 'وردية المساء'],
      ],
      'التاريخ: أكتوبر 2024'
    ),
    table: {
      id: 'daily_ledger',
      name: 'DailyLedgerTransactions',
      schemaName: 'dbo',
      descriptionAr: 'جدول حركات اليومية والمقبوضات والمصروفات',
      columns: [
        { id: 'c1', name: 'TransactionDate', labelAr: 'تاريخ الحركة', dataType: 'DATE', isNullable: false, sampleValue: '2024-10-01' },
        { id: 'c2', name: 'Description', labelAr: 'البيان والشرح', dataType: 'NVARCHAR(255)', isNullable: false, sampleValue: 'مبيعات نقدية' },
        { id: 'c3', name: 'CreditAmount', labelAr: 'المبلغ الوارد (مدين)', dataType: 'DECIMAL(18,2)', isNullable: false, sampleValue: '3500.00' },
        { id: 'c4', name: 'DebitAmount', labelAr: 'المبلغ المنصرف (دائن)', dataType: 'DECIMAL(18,2)', isNullable: false, sampleValue: '420.50' },
        { id: 'c5', name: 'PaymentMethod', labelAr: 'طريقة الدفع', dataType: 'NVARCHAR(50)', isNullable: true, sampleValue: 'نقداً' },
        { id: 'c6', name: 'Notes', labelAr: 'ملاحظات وتفاصيل', dataType: 'NVARCHAR(255)', isNullable: true, sampleValue: 'وصل رقم 8892' },
      ],
    },
  },
  {
    id: 'customer-debts',
    titleAr: 'دفتر حسابات العملاء والديون',
    descriptionAr: 'دفتر يدوي لمتابعة مديونيات العملاء، المدفوع، المتبقي ورقم الهاتف',
    suggestedNotes: 'استخرج أسماء العملاء باللغة العربية بدقة مع المبالغ ورقم الهاتف.',
    sampleImage: createLedgerSvgDataUrl(
      'سجل حسابات العملاء والمديونيات',
      ['كود', 'اسم العميل', 'رقم الجوال', 'إجمالي الفاتورة', 'المسدد نقداً', 'الرصيد المتبقي', 'تاريخ الاستحقاق'],
      [
        ['101', 'محمد إبراهيم حسنين', '01012345678', '14500.00', '5000.00', '9500.00', '2024-11-15'],
        ['102', 'مؤسسة النور للتجارة', '0559876543', '28000.00', '28000.00', '0.00', '2024-10-01'],
        ['103', 'خالد عبد الرحمن السعيد', '0504433221', '6750.00', '2000.00', '4750.00', '2024-12-01'],
        ['104', 'شركة البركة للمقاولات', '01234567890', '42000.00', '15000.00', '27000.00', '2024-11-30'],
        ['105', 'طارق محمود علام', '01122334455', '3200.00', '3200.00', '0.00', '2024-10-10'],
        ['106', 'سعيد فوزي الشريف', '0567788990', '9800.00', '4000.00', '5800.00', '2024-11-20'],
      ],
      'دفتر ديون الفرع الرئيسي'
    ),
    table: {
      id: 'customer_debts',
      name: 'CustomerAccounts',
      schemaName: 'dbo',
      descriptionAr: 'جدول حسابات العملاء ومتابعة الديون',
      columns: [
        { id: 'c1', name: 'CustomerCode', labelAr: 'كود العميل', dataType: 'NVARCHAR(50)', isNullable: true, sampleValue: '101' },
        { id: 'c2', name: 'CustomerName', labelAr: 'اسم العميل', dataType: 'NVARCHAR(150)', isNullable: false, sampleValue: 'محمد إبراهيم حسنين' },
        { id: 'c3', name: 'PhoneNumber', labelAr: 'رقم الجوال', dataType: 'NVARCHAR(50)', isNullable: true, sampleValue: '01012345678' },
        { id: 'c4', name: 'TotalBill', labelAr: 'إجمالي الفاتورة', dataType: 'DECIMAL(18,2)', isNullable: false, sampleValue: '14500.00' },
        { id: 'c5', name: 'PaidAmount', labelAr: 'المسدد نقداً', dataType: 'DECIMAL(18,2)', isNullable: false, sampleValue: '5000.00' },
        { id: 'c6', name: 'BalanceRemaining', labelAr: 'الرصيد المتبقي', dataType: 'DECIMAL(18,2)', isNullable: false, sampleValue: '9500.00' },
        { id: 'c7', name: 'DueDate', labelAr: 'تاريخ الاستحقاق', dataType: 'DATE', isNullable: true, sampleValue: '2024-11-15' },
      ],
    },
  },
  {
    id: 'inventory-movements',
    titleAr: 'دفتر حركة المخزن والوارد/المنصرف',
    descriptionAr: 'دفتر يدوي لجرد الأصناف، الكميات الواردة والصادرة ورصيد المخزن',
    suggestedNotes: 'يرجى تحويل الكميات إلى أرقام صحيحة، مع اسم الصنف والوحدة.',
    sampleImage: createLedgerSvgDataUrl(
      'دفتر حركة المخازن والأصناف',
      ['كود الصنف', 'اسم الصنف', 'الوحدة', 'رصيد سابق', 'الوارد (+)', 'المنصرف (-)', 'الرصيد الحالي'],
      [
        ['SKU-01', 'أرز مصري درجة أولى 5كجم', 'كيس', '150', '80', '45', '185'],
        ['SKU-02', 'زيت طعام عباد الشمس 1 لتر', 'كرتونة', '90', '50', '30', '110'],
        ['SKU-03', 'سكر أبيض ناعم 10كجم', 'شيكارة', '40', '60', '25', '75'],
        ['SKU-04', 'شاي أحمر فاخر 250جم', 'كرتونة', '120', '0', '35', '85'],
        ['SKU-05', 'دقيق قمح ممتاز 25كجم', 'شيكارة', '65', '40', '50', '55'],
        ['SKU-06', 'مكرونة أصناف مشكلة 400جم', 'كرتونة', '200', '100', '80', '220'],
      ],
      'مستودع البضائع - المنطقة ج'
    ),
    table: {
      id: 'warehouse_movements',
      name: 'WarehouseInventoryTransactions',
      schemaName: 'dbo',
      descriptionAr: 'حركات المخزن والوارد والمنصرف',
      columns: [
        { id: 'c1', name: 'ItemCode', labelAr: 'كود الصنف', dataType: 'NVARCHAR(50)', isNullable: false, sampleValue: 'SKU-01' },
        { id: 'c2', name: 'ItemName', labelAr: 'اسم الصنف', dataType: 'NVARCHAR(150)', isNullable: false, sampleValue: 'أرز مصري' },
        { id: 'c3', name: 'Unit', labelAr: 'وحدة القياس', dataType: 'NVARCHAR(50)', isNullable: true, sampleValue: 'كيس' },
        { id: 'c4', name: 'PreviousStock', labelAr: 'رصيد سابق', dataType: 'INT', isNullable: false, sampleValue: '150' },
        { id: 'c5', name: 'QuantityIn', labelAr: 'الوارد (+)', dataType: 'INT', isNullable: false, sampleValue: '80' },
        { id: 'c6', name: 'QuantityOut', labelAr: 'المنصرف (-)', dataType: 'INT', isNullable: false, sampleValue: '45' },
        { id: 'c7', name: 'CurrentStock', labelAr: 'الرصيد الحالي', dataType: 'INT', isNullable: false, sampleValue: '185' },
      ],
    },
  },
  {
    id: 'trips-ledger',
    titleAr: 'دفتر النقلات والحمولات (العدد، الوزن، الاسم، السعر، النقلة)',
    descriptionAr: 'دفتر يدوي لحركات النقل والحمولات متوافق مع الإدخال الصوتي (العدد، الوزن، الاسم، السعر، اسم النقلة)',
    suggestedNotes: 'استخرج بيانات النقلة: العدد، الوزن (بالطن أو الكيلو)، اسم العميل أو السائق، السعر الإجمالي، واسم النقلة.',
    sampleImage: createLedgerSvgDataUrl(
      'سجل حركة النقلات والتوريدات',
      ['م', 'تاريخ النقلة', 'اسم النقلة', 'اسم العميل / السائق', 'العدد', 'الوزن (طن)', 'السعر (ج.م)'],
      [
        ['1', '2024-10-01', 'نقلة رمل أحمر مباني', 'محمود عاشور', '40', '12.50', '3500.00'],
        ['2', '2024-10-01', 'نقلة سن 2 خرسانة', 'شركة المقاولون', '25', '8.00', '2800.00'],
        ['3', '2024-10-02', 'نقلة حديد تسليح 12مم', 'الحاج رمضان الدسوقي', '10', '15.00', '18500.00'],
        ['4', '2024-10-02', 'نقلة أسمنت بورتلاندي', 'مؤسسة السلام', '100', '5.00', '4200.00'],
        ['5', '2024-10-03', 'نقلة طوب أحمر دبل', 'أحمد سامي النجار', '5000', '9.20', '6500.00'],
        ['6', '2024-10-03', 'نقلة جبس تشطيب', 'محسن عبد الهادي', '60', '3.00', '1950.00'],
      ],
      'دفتر ميزان البسكول والنقلات'
    ),
    table: {
      id: 'trips_movements',
      name: 'CargoTripsLedger',
      schemaName: 'dbo',
      descriptionAr: 'جدول حركات النقلات والحمولات والأوزان والأسعار',
      columns: [
        { id: 'c1', name: 'TripName', labelAr: 'اسم النقلة', dataType: 'NVARCHAR(150)', isNullable: false, sampleValue: 'نقلة رمل أحمر' },
        { id: 'c2', name: 'ClientName', labelAr: 'الاسم (العميل / السائق)', dataType: 'NVARCHAR(150)', isNullable: false, sampleValue: 'محمود عاشور' },
        { id: 'c3', name: 'ItemCount', labelAr: 'العدد', dataType: 'INT', isNullable: false, sampleValue: '40' },
        { id: 'c4', name: 'Weight', labelAr: 'الوزن (طن / كجم)', dataType: 'DECIMAL(18,2)', isNullable: false, sampleValue: '12.50' },
        { id: 'c5', name: 'Price', labelAr: 'السعر (ج.م)', dataType: 'DECIMAL(18,2)', isNullable: false, sampleValue: '3500.00' },
        { id: 'c6', name: 'TripDate', labelAr: 'تاريخ النقلة', dataType: 'DATE', isNullable: true, sampleValue: '2024-10-01' },
      ],
    },
  },
];
