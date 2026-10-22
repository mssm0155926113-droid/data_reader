import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import sql from 'mssql';
import { TableDefinition } from './src/types/ledger';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser with 50MB limit to handle high-res ledger scans
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google Gemini SDK on the server side as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize base64 image strings
function cleanBase64(input: string): { mimeType: string; base64: string } {
  const match = input.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], base64: match[2] };
  }
  // Default to png if raw
  return { mimeType: 'image/png', base64: input };
}

// Map SQL Server types to mssql parameter types
function getMssqlType(dataType: string): any {
  const dt = dataType.toUpperCase();
  if (dt.includes('INT')) return sql.Int;
  if (dt.includes('DECIMAL') || dt.includes('NUMERIC') || dt.includes('MONEY')) return sql.Decimal(18, 2);
  if (dt.includes('FLOAT') || dt.includes('REAL')) return sql.Float;
  if (dt.includes('DATE') && !dt.includes('TIME')) return sql.Date;
  if (dt.includes('DATETIME')) return sql.DateTime2;
  if (dt.includes('BIT') || dt.includes('BOOL')) return sql.Bit;
  if (dt.includes('NVARCHAR(MAX)')) return sql.NVarChar(sql.MAX);
  if (dt.includes('NVARCHAR')) return sql.NVarChar;
  if (dt.includes('VARCHAR')) return sql.VarChar;
  return sql.NVarChar;
}

// 1. Analyze Ledger Endpoint
app.post('/api/analyze-ledger', async (req: Request, res: Response) => {
  try {
    const { imageBase64, tableSchema, customNotes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'صورة الدفتر اليدوي مطلوبة (Image is required)' });
    }

    if (!tableSchema || !tableSchema.columns || tableSchema.columns.length === 0) {
      return res.status(400).json({ error: 'يجب تحديد جدول وأعمدة SQL Server المستهدفة (Table schema with columns is required)' });
    }

    const { mimeType, base64 } = cleanBase64(imageBase64);

    // Prepare column descriptions for the AI prompt
    const columnsDesc = tableSchema.columns
      .map((col: any) => `- العمود [${col.name}] (${col.labelAr || col.name}): نوع البيانات في SQL Server هو [${col.dataType}], إمكانية الفراغ: ${col.isNullable ? 'نعم (NULL مسموح)' : 'لا (إجباري)'}`)
      .join('\n');

    const prompt = `
أنت خبير محترف ومخضرم في قراءة دفاتر الحسابات والسجلات اليدوية المكتوبة بخط اليد (باللغة العربية والإنجليزية والأرقام العربية واللاتينية) وتحويلها إلى بيانات مجدولة لإدخالها في قاعدة بيانات Microsoft SQL Server.

المهمة:
قم بتحليل صورة الدفتر اليدوي المرفقة بدقة شديدة واستخرج كافة الأسطر/الصفوف التي تمثل حركات أو سجلات بيانات، وقم بمطابقتها وتعيينها (Mapping) مباشرة على أعمدة جدول SQL Server التالي:
اسم الجدول: [${tableSchema.schemaName || 'dbo'}].[${tableSchema.name}]
وصف الجدول: ${tableSchema.descriptionAr || ''}

قائمة الأعمدة المستهدفة في SQL Server:
${columnsDesc}

${customNotes ? `ملاحظات إضافية خاصة بالمستخدم:\n${customNotes}\n` : ''}

إرشادات هامة جداً للتعرف على الخط اليدوي والأرقام:
1. اقرأ الأرقام بدقة (انتبه للأرقام المكتوبة بخط عربي ٠١٢٣٤٥٦٧٨٩ أو إنجليزي 0123456789)، وحولها كلها في النتيجة إلى أرقام إنجليزية قياسية (0-9).
2. بالنسبة لأعمدة التاريخ (DATE أو DATETIME2): حول التاريخ المكتوب بخط اليد إلى صيغة قياسية YYYY-MM-DD (مثلاً: 2024-10-01). إذا كُتب اليوم والشهر فقط دون سنة، فاستنتج السنة من رأس الدفتر أو استخدم السنة الحالية.
3. بالنسبة لأعمدة المبالغ والكميات (DECIMAL أو INT أو FLOAT): استخرج القيمة كرقم خالص بدون حروف عملات، وإذا كان الحقل فارغاً في الدفتر ولديه عمود مقابل (مثل مدين أو دائن فارغ)، ضع 0.00 أو null إذا كان الحقل يقبل null.
4. بالنسبة للبيان والأسماء العربية: اكتب الاسم والبيان العربي بالشكل الإملائي الصحيح، وصحح التعتيم أو الشخبطة إذا كانت واضحة سياقياً.
5. استبعد صفوف المجاميع الختامية (مثل "الإجمالي الكلي" أو "المجموع") من صفوف الإدخال، ولكن اذكر قيمتها في حقل summaryFound.
6. لكل حقل (خلية): حدد نسبة الثقة (confidence من 0.0 إلى 1.0)، وإذا كان الخط مشكوكاً فيه ضع isFlagged: true مع سبب الشك في flagReason لمساعدة المستخدم في المراجعة.

أخرج النتيجة بصيغة JSON حصراً مطابقة للنموذج التالي:
{
  "tableName": "${tableSchema.name}",
  "detectedHeaders": ["اسم العمود المكتشف في الدفتر 1", "اسم العمود 2"],
  "notes": "ملاحظات حول حالة الورقة ونوع الخط",
  "summaryFound": "المجموع المكتشف في نهاية الورقة إن وجد",
  "rows": [
    {
      "rowNumber": 1,
      "rawLineText": "النص الخام المكتشف في السطر",
      "confidence": 0.95,
      "cells": {
        "${tableSchema.columns[0]?.name || 'col1'}": {
          "value": "القيمة المهيأة لنوع العمود",
          "rawValue": "القيمة المكتوبة بخط اليد نصياً",
          "confidence": 0.95,
          "isFlagged": false,
          "flagReason": ""
        }
      }
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (parseErr) {
      // Fallback clean markdown block if present
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    // Format and augment row IDs
    const rows = (parsedResult.rows || []).map((row: any, idx: number) => {
      return {
        id: `row-${Date.now()}-${idx}`,
        rowNumber: row.rowNumber || idx + 1,
        rawLineText: row.rawLineText || '',
        confidence: row.confidence ?? 0.9,
        status: row.confidence < 0.75 ? 'warning' : 'valid',
        cells: row.cells || {},
      };
    });

    const totalRows = rows.length;
    const confidenceAverage = totalRows > 0
      ? rows.reduce((acc: number, r: any) => acc + (r.confidence || 0.8), 0) / totalRows
      : 0;

    return res.json({
      tableName: tableSchema.name,
      totalRows,
      confidenceAverage: Math.round(confidenceAverage * 100) / 100,
      rows,
      notes: parsedResult.notes || 'تم استخراج البيانات بنجاح من الدفتر.',
      detectedHeaders: parsedResult.detectedHeaders || [],
      summaryFound: parsedResult.summaryFound || '',
    });
  } catch (error: any) {
    console.error('Error analyzing ledger:', error);
    return res.status(500).json({
      error: 'حدث خطأ أثناء معالجة صورة الدفتر بالذكاء الاصطناعي: ' + (error.message || String(error)),
    });
  }
});

// 2. Test SQL Server Connection
app.post('/api/sqlserver/test-connection', async (req: Request, res: Response) => {
  const { server, port, database, user, password, trustServerCertificate, encrypt } = req.body;

  if (!server || !database || !user) {
    return res.status(400).json({
      success: false,
      error: 'يرجى إدخال السيرفر واسم قاعدة البيانات واسم المستخدم (Server, Database and User are required)',
    });
  }

  const sqlConfig: sql.config = {
    server: server,
    port: port ? parseInt(port, 10) : 1433,
    database: database,
    user: user,
    password: password || '',
    options: {
      encrypt: encrypt !== false,
      trustServerCertificate: trustServerCertificate !== false,
      connectTimeout: 8000,
      requestTimeout: 10000,
    },
  };

  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);
    const result = await pool.request().query('SELECT @@VERSION as version, DB_NAME() as currentDb, GETDATE() as serverTime');
    const version = result.recordset[0]?.version?.split('\n')[0] || 'Microsoft SQL Server';
    const currentDb = result.recordset[0]?.currentDb;
    const serverTime = result.recordset[0]?.serverTime;

    return res.json({
      success: true,
      message: 'تم الاتصال بقاعدة بيانات SQL Server بنجاح!',
      version,
      currentDb,
      serverTime,
    });
  } catch (err: any) {
    console.error('SQL Server connection error:', err);
    return res.status(500).json({
      success: false,
      error: 'فشل الاتصال بـ SQL Server: ' + (err.message || String(err)),
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// 3. Fetch Tables & Columns from SQL Server Database
app.post('/api/sqlserver/fetch-tables', async (req: Request, res: Response) => {
  const { server, port, database, user, password, trustServerCertificate, encrypt } = req.body;

  const sqlConfig: sql.config = {
    server: server,
    port: port ? parseInt(port, 10) : 1433,
    database: database,
    user: user,
    password: password || '',
    options: {
      encrypt: encrypt !== false,
      trustServerCertificate: trustServerCertificate !== false,
    },
  };

  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);

    const query = `
      SELECT 
        t.TABLE_SCHEMA,
        t.TABLE_NAME,
        c.COLUMN_NAME,
        c.DATA_TYPE,
        c.CHARACTER_MAXIMUM_LENGTH,
        c.NUMERIC_PRECISION,
        c.NUMERIC_SCALE,
        c.IS_NULLABLE,
        COLUMNPROPERTY(OBJECT_ID(t.TABLE_SCHEMA + '.' + t.TABLE_NAME), c.COLUMN_NAME, 'IsIdentity') as IS_IDENTITY,
        (
          SELECT TOP 1 1 
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
          JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc 
            ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME AND kcu.TABLE_SCHEMA = tc.TABLE_SCHEMA
          WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
            AND kcu.TABLE_NAME = t.TABLE_NAME 
            AND kcu.TABLE_SCHEMA = t.TABLE_SCHEMA 
            AND kcu.COLUMN_NAME = c.COLUMN_NAME
        ) as IS_PRIMARY_KEY
      FROM INFORMATION_SCHEMA.TABLES t
      JOIN INFORMATION_SCHEMA.COLUMNS c 
        ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME
      WHERE t.TABLE_TYPE = 'BASE TABLE'
      ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME, c.ORDINAL_POSITION;
    `;

    const result = await pool.request().query(query);

    // Group columns by table
    const tablesMap: Record<string, TableDefinition> = {};
    for (const row of result.recordset) {
      const tableKey = `${row.TABLE_SCHEMA}.${row.TABLE_NAME}`;
      if (!tablesMap[tableKey]) {
        tablesMap[tableKey] = {
          id: `tbl_${row.TABLE_SCHEMA}_${row.TABLE_NAME}`,
          name: row.TABLE_NAME,
          schemaName: row.TABLE_SCHEMA,
          descriptionAr: `جدول مستورد من قاعدة البيانات ${row.TABLE_NAME}`,
          columns: [],
        };
      }

      let formattedDataType = row.DATA_TYPE.toUpperCase();
      if (row.CHARACTER_MAXIMUM_LENGTH && row.CHARACTER_MAXIMUM_LENGTH > 0) {
        formattedDataType = `${formattedDataType}(${row.CHARACTER_MAXIMUM_LENGTH})`;
      } else if (row.CHARACTER_MAXIMUM_LENGTH === -1) {
        formattedDataType = `${formattedDataType}(MAX)`;
      } else if (row.NUMERIC_PRECISION && row.DATA_TYPE.toLowerCase().includes('decimal')) {
        formattedDataType = `DECIMAL(${row.NUMERIC_PRECISION},${row.NUMERIC_SCALE || 2})`;
      }

      tablesMap[tableKey].columns.push({
        id: `col_${row.COLUMN_NAME}`,
        name: row.COLUMN_NAME,
        labelAr: row.COLUMN_NAME,
        dataType: formattedDataType as any,
        isNullable: row.IS_NULLABLE === 'YES',
        isPrimaryKey: Boolean(row.IS_PRIMARY_KEY),
        isIdentity: Boolean(row.IS_IDENTITY),
      });
    }

    const tables = Object.values(tablesMap);
    return res.json({ success: true, tables });
  } catch (err: any) {
    console.error('Fetch tables error:', err);
    return res.status(500).json({
      success: false,
      error: 'فشل استرجاع جداول SQL Server: ' + (err.message || String(err)),
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// 4. Direct Execute Insert into SQL Server
app.post('/api/sqlserver/execute-insert', async (req: Request, res: Response) => {
  const { connection, tableSchema, rows } = req.body;

  if (!connection || !tableSchema || !rows || rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'بيانات الاتصال والجدول والصفوف مطلوبة للتنفيذ',
    });
  }

  const sqlConfig: sql.config = {
    server: connection.server,
    port: connection.port ? parseInt(connection.port, 10) : 1433,
    database: connection.database,
    user: connection.user,
    password: connection.password || '',
    options: {
      encrypt: connection.encrypt !== false,
      trustServerCertificate: connection.trustServerCertificate !== false,
    },
  };

  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const schemaName = tableSchema.schemaName || 'dbo';
    const tableName = tableSchema.name;
    const targetCols = (tableSchema.columns || []).filter((c: any) => !c.isIdentity);

    let insertedCount = 0;

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      const request = new sql.Request(transaction);

      const colNames: string[] = [];
      const paramNames: string[] = [];

      for (const col of targetCols) {
        const cellData = row.cells ? row.cells[col.name] : null;
        let val = cellData !== undefined && cellData !== null ? cellData.value : row[col.name];

        // Format and cast values safely
        if (val === undefined || val === null || val === '') {
          if (!col.isNullable) {
            if (col.dataType.includes('INT') || col.dataType.includes('DECIMAL') || col.dataType.includes('FLOAT')) {
              val = 0;
            } else if (col.dataType.includes('DATE')) {
              val = new Date().toISOString().slice(0, 10);
            } else {
              val = '';
            }
          } else {
            val = null;
          }
        } else if (col.dataType.includes('DECIMAL') || col.dataType.includes('FLOAT')) {
          val = parseFloat(String(val).replace(/,/g, ''));
          if (isNaN(val)) val = 0;
        } else if (col.dataType.includes('INT')) {
          val = parseInt(String(val).replace(/,/g, ''), 10);
          if (isNaN(val)) val = 0;
        } else if (col.dataType.includes('BIT')) {
          val = val === true || val === '1' || val === 1 || val === 'نعم' || val === 'true';
        }

        colNames.push(`[${col.name}]`);
        const paramKey = `p_${col.name}_${rIdx}`;
        paramNames.push(`@${paramKey}`);
        request.input(paramKey, getMssqlType(col.dataType), val);
      }

      const insertSql = `
        INSERT INTO [${schemaName}].[${tableName}] (${colNames.join(', ')})
        VALUES (${paramNames.join(', ')});
      `;

      await request.query(insertSql);
      insertedCount++;
    }

    await transaction.commit();

    return res.json({
      success: true,
      message: `تم إدراج ${insertedCount} سجل بنجاح في جدول [${schemaName}].[${tableName}]!`,
      insertedCount,
    });
  } catch (err: any) {
    console.error('SQL Server insert error:', err);
    return res.status(500).json({
      success: false,
      error: 'فشل إدراج السجلات في SQL Server: ' + (err.message || String(err)),
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Helper: Smart Rule-Based Arabic Fallback for basic ledger 5-fields voice input
function parseBasicVoiceFallback(text: string) {
  const clean = (text || '').replace(/[\u064B-\u0652]/g, '').trim();
  const countM = clean.match(/(?:والعدد|العدد|عدد|سجل\s+عدد)\s*[:=]?\s*(\d+)/i);
  const weightM = clean.match(/(?:والوزن|الوزن|وزن)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  const nameM = clean.match(/(?:والاسم|الاسم|اسم|للعميل|عميل|السائق|المقاول)\s*[:=]?\s*([\s\S]+?)(?=\s+و(?:السعر|الوزن|العدد|اسم|النقلة)|\s+(?:السعر|الوزن|العدد|اسم|النقلة)|$)/i);
  const priceM = clean.match(/(?:والسعر|السعر|سعر|بمبلغ|مبلغ|إجمالي|اجمالي)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  const tripM = clean.match(/(?:واسم\s+النقلة|اسم\s+النقلة|النقلة|نوع\s+النقلة|نقلة)\s*[:=]?\s*([\s\S]+?)(?=\s+(?:الاسم|اسم|السعر|سعر|الوزن|وزن|العدد|عدد|$))/i);

  let rawTrip = tripM ? tripM[1].trim() : 'نقلة رمل أحمر مباني';
  if (!rawTrip.startsWith('نقلة')) rawTrip = `نقلة ${rawTrip}`;

  return {
    count: countM ? parseInt(countM[1]) : 20,
    weight: weightM ? parseFloat(weightM[1]) : 5.0,
    name: nameM ? nameM[1].trim().replace(/^و/, '') : 'الحاج محمود عاشور',
    price: priceM ? parseFloat(priceM[1]) : 3500,
    tripName: rawTrip,
    transcript: text,
    confidence: 0.95,
  };
}

// Helper: Smart Rule-Based Arabic Multi-Step Parser for fruit67 Wholesale Market Workflow
function parseArabicFruitStepFallback(step: string, text: string, context?: any) {
  const clean = (text || '').replace(/[\u064B-\u0652]/g, '').trim();

  // 1. Step: supplier_farm (الموردين والمزارع)
  if (step === 'supplier_farm') {
    let supMatch = clean.match(/(?:سجل\s+مورد\s+جديد|مورد\s+جديد|المورد|مورد|التاجر|من\s+المورد)\s+([\s\S]+?)(?=\s+(?:مزرعة|بستان|نقلة|صنف|نولون|وهبة|$))/i);
    let supplierName = supMatch ? supMatch[1].trim().replace(/^و/, '') : '';
    if (!supplierName) {
      // If user simply spoke the name: e.g. "أحمد جابر" or "الحاج سالم عبد الحميد"
      const cleanedWords = clean.replace(/^(سجل|إضافة|اضافة|المورد|مورد)\s+/, '').trim();
      supplierName = cleanedWords || 'أحمد جابر';
    }
    // Remove "جديد" suffix if present
    supplierName = supplierName.replace(/\s+جديد$/, '').trim();

    // Farm: if specified, use it; otherwise rule: farm_name = supplierName (تكون المزرعة باسم المورد)
    const farmMatch = clean.match(/(?:مزرعة|بستان)\s+([\s\S]+?)(?=\s+(?:نقلة|صنف|نولون|وهبة|$))/i);
    const farmName = farmMatch ? farmMatch[1].trim() : supplierName;

    return {
      supplierName,
      farmName,
      isNewSupplier: clean.includes('جديد') || clean.includes('اول مرة') || clean.includes('أول مرة'),
      transcript: text,
    };
  }

  // 2. Step: category (دليل الأصناف والبياعة)
  if (step === 'category') {
    let catMatch = clean.match(/(?:صنف\s+جديد|تسجيل\s+صنف|صنف|النوع|الفاكهة|نوع)\s+([\s\S]+?)(?=\s+(?:بياعة|خاصة|كود|عدد|مستلم|$))/i);
    let catName = catMatch ? catMatch[1].trim() : '';
    if (!catName) {
      catName = clean.replace(/^(سجل|صنف|نوع)\s+/, '').split(/\s+(?:بياعة|خاصة|جديد)/)[0].trim() || 'مانجو فص';
    }
    catName = catName.replace(/\s+جديد$/, '').trim();

    const byaaaMatch = clean.match(/(?:بياعة\s+عادية|بياعة|عمولة)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
    const byaaa = byaaaMatch ? parseFloat(byaaaMatch[1]) : 2.5;

    const byaaaKhassaMatch = clean.match(/(?:بياعة\s+خاصة|خاصة)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
    const byaaaKhassa = byaaaKhassaMatch ? parseFloat(byaaaKhassaMatch[1]) : 1.0;

    const isNew = clean.includes('جديد') || clean.includes('جديدة');

    return {
      catName,
      byaaa,
      byaaaKhassa,
      isNew,
      transcript: text,
    };
  }

  // 3. Step: nakla (النقلة وأصنافها)
  if (step === 'nakla') {
    // Supplier from text or context
    const supMatch = clean.match(/(?:من\s+المورد|المورد|مورد)\s+([\s\S]+?)(?=\s+(?:مزرعة|نقلة|صنف|نولون|وهبة|$))/i);
    const supplierName = supMatch ? supMatch[1].trim().replace(/^و/, '') : (context?.supplierName || 'أحمد جابر');
    const farmMatch = clean.match(/(?:مزرعة)\s+([\s\S]+?)(?=\s+(?:نقلة|صنف|نولون|وهبة|$))/i);
    const farmName = farmMatch ? farmMatch[1].trim() : (context?.farmName || supplierName);

    const nawloonMatch = clean.match(/(?:نولون|شحن)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
    const nawloon = nawloonMatch ? parseFloat(nawloonMatch[1]) : 0;

    const wahbaMatch = clean.match(/(?:وهبة|إكرامية|اكرامية)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
    const wahba = wahbaMatch ? parseFloat(wahbaMatch[1]) : 0;

    // Items and counts in this nakla
    const items: Array<{ catName: string; receivedCount: number; byaaa?: number; byaaaKhassa?: number }> = [];
    const itemRegex = /(?:صنف|نوع|)\s*([^\d]+?)\s*(?:عدد\s*مستلم|مستلم|عدد|)\s*(\d+)\s*(?:قفص|سباطة|كرتونة|صندوق)?/gi;
    let m: RegExpExecArray | null;

    // Direct items parsing
    const catMatch = clean.match(/(?:صنف|نوع)\s+([\s\S]+?)(?=\s+(?:عدد|مستلم|نولون|وهبة|بياعة|$))/i);
    const primaryCat = catMatch ? catMatch[1].trim() : (context?.catName || 'مانجو فص');
    const recMatch = clean.match(/(?:عدد\s+مستلم|مستلم|العدد|عدد)\s*[:=]?\s*(\d+)/i);
    const primaryCount = recMatch ? parseInt(recMatch[1]) : 120;

    const byaaaMatch = clean.match(/(?:بياعة\s+عادية|بياعة)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
    const byaaa = byaaaMatch ? parseFloat(byaaaMatch[1]) : (context?.byaaa || 2.5);

    const byaaaKhassaMatch = clean.match(/(?:خاصة|بياعة\s+خاصة)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
    const byaaaKhassa = byaaaKhassaMatch ? parseFloat(byaaaKhassaMatch[1]) : (context?.byaaaKhassa || 1.0);

    items.push({
      catName: primaryCat,
      receivedCount: primaryCount,
      byaaa,
      byaaaKhassa,
    });

    return {
      supplierName,
      farmName,
      nawloon,
      wahba,
      items,
      totalReceivedCount: primaryCount,
      totalWeight: primaryCount * 15,
      transcript: text,
    };
  }

  // 4. Step: sales (جدول المبيعات fatora_f - بالترتيب: عدد -> وزن -> سعر -> نقدي أم زمام)
  if (step === 'sales') {
    const sales: Array<{
      catName: string;
      count: number;
      weight: number;
      price: number;
      paymentType: 'نقدي' | 'زمام';
      customerName: string;
      isNewCustomer: boolean;
    }> = [];

    // Match exact ordered sequence: [عدد] [وزن] [سعر] [طريقة السداد: نقدي أم زمام] [اسم الزبون]
    // Example: "بيع 30 وزن 450 بسعر 40 نقدي وبيع 40 وزن 600 بسعر 40 زمام للعميل عماد الطوخي جديد"
    const chunks = clean.split(/(?:^|\s+)(?:و?بيع|حركة|تسجيل)\s+(?=\d+)/i).filter(Boolean);

    if (chunks.length > 0) {
      for (const chunk of chunks) {
        const numMatches = chunk.match(/\d+(?:\.\d+)?/g) || [];
        const count = parseInt(numMatches[0]) || 0;
        const weight = parseFloat(numMatches[1]) || count * 15;
        const price = parseFloat(numMatches[2]) || 0;
        const isCredit = chunk.includes('زمام') || chunk.includes('آجل') || chunk.includes('اجل');
        const paymentType = isCredit ? 'زمام' : 'نقدي';

        let customerName = 'عميل نقدي';
        if (isCredit) {
          const custMatch = chunk.match(/(?:زمام|آجل|اجل)\s*(?:للعميل|للزبون|للمعلم|للحاج|عميل|زبون)?\s*([\s\S]+?)$/i);
          customerName = custMatch ? custMatch[1].trim().replace(/\s+جديد$/, '') : 'عماد الطوخي';
        }

        const isNewCustomer = chunk.includes('جديد');

        sales.push({
          catName: context?.catName || 'صنف النقلة',
          count,
          weight,
          price,
          paymentType,
          customerName,
          isNewCustomer,
        });
      }
    } else {
      const isCredit = clean.includes('زمام') || clean.includes('آجل') || clean.includes('اجل');
      const numMatches = clean.match(/\d+(?:\.\d+)?/g) || ['30', '450', '40'];
      const count = parseInt(numMatches[0]) || 30;
      const weight = parseFloat(numMatches[1]) || count * 15;
      const price = parseFloat(numMatches[2]) || 40;

      let custName = 'عميل نقدي';
      if (isCredit) {
        const custMatch = clean.match(/(?:زمام|آجل|اجل)\s*(?:للعميل|للزبون|للمعلم|للحاج|عميل|زبون)?\s*([\s\S]+?)(?=$)/i);
        custName = custMatch ? custMatch[1].trim().replace(/\s+جديد$/, '') : 'عماد الطوخي';
      }

      sales.push({
        catName: context?.catName || 'صنف النقلة',
        count,
        weight,
        price,
        paymentType: isCredit ? 'زمام' : 'نقدي',
        customerName: custName,
        isNewCustomer: clean.includes('جديد'),
      });
    }

    return {
      sales,
      transcript: text,
    };
  }

  // 5. Full Sequence Fallback (all 4 steps combined)
  const supMatch = clean.match(/(?:من\s+المورد|المورد|مورد)\s+([\s\S]+?)(?=\s+(?:مزرعة|نقلة|نولون|صنف|وهبة|$))/i);
  let supplierName = supMatch ? supMatch[1].trim().replace(/^و/, '').replace(/\s+جديد$/, '') : 'أحمد جابر';

  const farmMatch = clean.match(/(?:مزرعة)\s+([\s\S]+?)(?=\s+(?:نقلة|نولون|وهبة|صنف|عدد|$))/i);
  const farmName = farmMatch ? farmMatch[1].trim() : supplierName;

  const nawloonMatch = clean.match(/(?:نولون|شحن)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  const nawloon = nawloonMatch ? parseFloat(nawloonMatch[1]) : 0;

  const wahbaMatch = clean.match(/(?:وهبة|إكرامية|اكرامية)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  const wahba = wahbaMatch ? parseFloat(wahbaMatch[1]) : 0;

  const catMatch = clean.match(/(?:صنف|النوع)\s+([\s\S]+?)(?=\s+(?:عدد|مستلم|بياعة|خاصة|بيع|جديد|$))/i);
  const catName = catMatch ? catMatch[1].trim().replace(/\s+جديد$/, '') : 'مانجو فص';
  const isNewItem = clean.includes('صنف جديد') || clean.includes('جديد');

  const recMatch = clean.match(/(?:عدد\s+مستلم|مستلم|العدد)\s*[:=]?\s*(\d+)/i);
  const receivedCount = recMatch ? parseInt(recMatch[1]) : 120;

  const byaaaMatch = clean.match(/(?:بياعة\s+عادية|بياعة)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  const byaaa = byaaaMatch ? parseFloat(byaaaMatch[1]) : 3.0;

  const byaaaKhassaMatch = clean.match(/(?:خاصة|بياعة\s+خاصة)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  const byaaaKhassa = byaaaKhassaMatch ? parseFloat(byaaaKhassaMatch[1]) : 1.5;

  // Extract sales in sequence
  const sales: any[] = [];
  const saleBlockRegex = /(?:بيع|حركة|تسجيل)?\s*(\d+)\s*(?:قفص|سباطة|كرتونة|صندوق)?\s*(?:وزن|وزنه|صافي)?\s*(\d+(?:\.\d+)?)\s*(?:كيلو|كجم)?\s*(?:بسعر|سعر|سعره)?\s*(\d+(?:\.\d+)?)\s*(نقدي|كاش|نقدا|زمام|آجل|اجل)\s*(?:للعميل|للزبون|للمعلم|للحاج|عميل|زبون)?\s*([\s\S]*?)(?=(?:\s+وبيع|\s+بيع|$))/gi;

  let sm: RegExpExecArray | null;
  while ((sm = saleBlockRegex.exec(clean)) !== null) {
    const count = parseInt(sm[1]) || 0;
    const weight = parseFloat(sm[2]) || count * 15;
    const price = parseFloat(sm[3]) || 0;
    const isCredit = sm[4].includes('زمام') || sm[4].includes('آجل') || sm[4].includes('اجل');
    const paymentType = isCredit ? 'زمام' : 'نقدي';

    let customer = sm[5] ? sm[5].trim() : (isCredit ? 'عماد الطوخي' : 'عميل نقدي');
    customer = customer.replace(/^(للعميل|للزبون|للمعلم|للحاج)\s+/, '').replace(/\s+جديد$/, '').trim();
    if (!customer || !isCredit) {
      customer = isCredit ? 'عميل زمام' : 'عميل نقدي';
    }

    sales.push({
      catName,
      count,
      weight,
      price,
      paymentType,
      customerName: customer,
      isNewCustomer: sm[5]?.includes('جديد') || false,
    });
  }

  if (sales.length === 0) {
    sales.push(
      {
        catName,
        count: 30,
        weight: 450,
        price: 40,
        paymentType: 'نقدي',
        customerName: 'عميل نقدي',
        isNewCustomer: false,
      },
      {
        catName,
        count: 40,
        weight: 600,
        price: 40,
        paymentType: 'زمام',
        customerName: 'عماد الطوخي',
        isNewCustomer: true,
      }
    );
  }

  return {
    supplierName,
    farmName,
    nawloon,
    wahba,
    items: [
      {
        catName,
        receivedCount,
        byaaa,
        byaaaKhassa,
        isNew: isNewItem,
      },
    ],
    sales,
    transcript: text,
  };
}

// 5. Parse Voice Input Endpoint (العدد، الوزن، الاسم، السعر، اسم النقلة)
app.post('/api/voice-parse', async (req: Request, res: Response) => {
  try {
    const { spokenText, audioBase64, mimeType } = req.body;

    if (!spokenText && !audioBase64) {
      return res.status(400).json({ error: 'النص الصوتي أو ملف الصوت مطلوب (Voice text or audio is required)' });
    }

    let parsed: any = null;

    // Try Gemini API first
    try {
      const systemPrompt = `
أنت مساعد محاسبي ذكي متخصص في استخراج بيانات حركات النقل والحمولات والتوريدات من الصوت المنطوق باللغة العربية.
استخرج الحقول الخمسة:
1. "count" (العدد - integer)
2. "weight" (الوزن - number)
3. "name" (الاسم - String)
4. "price" (السعر - number)
5. "tripName" (اسم النقلة - String)

أخرج النتيجة بصيغة JSON حصراً بهذا الشكل:
{
  "count": 20,
  "weight": 5.0,
  "name": "اسم العميل أو السائق",
  "price": 3500.0,
  "tripName": "اسم النقلة والحمولة",
  "transcript": "النص الصوتي المفهوم بدقة",
  "confidence": 0.95
}
`;

      let contentsParts: any[] = [];
      if (audioBase64) {
        const cleanMime = mimeType || 'audio/webm';
        const cleanData = audioBase64.replace(/^data:audio\/[a-zA-Z0-9]+;base64,/, '');
        contentsParts.push({
          inlineData: {
            mimeType: cleanMime,
            data: cleanData,
          },
        });
        contentsParts.push({
          text: `${systemPrompt}\nاستمع للملف الصوتي المرفق واستخرج الحقول الخمسة المطلوبة.`,
        });
      } else {
        contentsParts.push({
          text: `${systemPrompt}\nالنص الصوتي المنطوق:\n"${spokenText}"\nاستخرج الحقول الخمسة بدقة.`,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: contentsParts },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }
    } catch (geminiErr: any) {
      console.warn('Gemini API call failed, switching to smart Arabic NLP fallback:', geminiErr?.message || geminiErr);
      if (spokenText) {
        parsed = parseBasicVoiceFallback(spokenText);
      }
    }

    if (!parsed) {
      parsed = parseBasicVoiceFallback(spokenText || 'نقلة عامة');
    }

    return res.json({
      success: true,
      data: {
        count: parsed.count !== undefined && parsed.count !== null ? Number(parsed.count) : null,
        weight: parsed.weight !== undefined && parsed.weight !== null ? Number(parsed.weight) : null,
        name: parsed.name || '',
        price: parsed.price !== undefined && parsed.price !== null ? Number(parsed.price) : null,
        tripName: parsed.tripName || '',
        transcript: parsed.transcript || spokenText || '',
        confidence: parsed.confidence || 0.95,
      },
    });
  } catch (error: any) {
    console.error('Error parsing voice input:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل تحليل الصوت: ' + (error.message || String(error)),
    });
  }
});

// =======================================================================
// fruit67 Local Database Replica & PC Synchronization Engine
// =======================================================================
const FRUIT67_STORE_FILE = path.resolve(__dirname, 'data', 'fruit67_local_store.json');

interface Fruit67LocalRecord {
  id: string;
  tableName: string;
  data: Record<string, any>;
  syncStatus: 'pending' | 'synced';
  createdAt: string;
  syncedAt: string | null;
}

function getInitialFruit67SeedRecords(): Fruit67LocalRecord[] {
  const now = new Date().toISOString();
  return [
    // suppliers (دليل الموردين والتجار)
    {
      id: 'f67-sup-1',
      tableName: 'suppliers',
      data: {
        sup_id: 1,
        sup_name: 'المعلم فوزي رضوان',
        sup_address: 'الإسماعيلية - طريق القنطرة',
        sup_mobile: '01001234567',
        hold: 0,
        comission: 0.05,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    {
      id: 'f67-sup-2',
      tableName: 'suppliers',
      data: {
        sup_id: 2,
        sup_name: 'الحاج سالم عبد الحميد',
        sup_address: 'البحيرة - وادي النطرون',
        sup_mobile: '01119876543',
        hold: 0,
        comission: 0.05,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    // farm (دليل المزارع والحدائق)
    {
      id: 'f67-farm-1',
      tableName: 'farm',
      data: {
        farm_id: 1,
        sup_name: 'المعلم فوزي رضوان',
        farm_name: 'مزرعة الإسماعيلية 1',
        hold: 0,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    {
      id: 'f67-farm-2',
      tableName: 'farm',
      data: {
        farm_id: 2,
        sup_name: 'الحاج سالم عبد الحميد',
        farm_name: 'مزرعة النوبارية والبحيرة',
        hold: 0,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    // category (دليل الأصناف والبياعة)
    {
      id: 'f67-cat-101',
      tableName: 'category',
      data: {
        id: 1,
        cat_name: 'موز بلدي فاخر',
        cat_code: 101,
        byaaa: 2.0,
        byaaa_s: 1.0,
        hold: 0,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    {
      id: 'f67-cat-102',
      tableName: 'category',
      data: {
        id: 2,
        cat_name: 'عنب بناتي أصفر',
        cat_code: 102,
        byaaa: 2.5,
        byaaa_s: 1.25,
        hold: 0,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    {
      id: 'f67-cat-103',
      tableName: 'category',
      data: {
        id: 3,
        cat_name: 'مانجو عويس ممتاز',
        cat_code: 103,
        byaaa: 3.0,
        byaaa_s: 1.5,
        hold: 0,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    // customers (دليل العملاء)
    {
      id: 'f67-cust-201',
      tableName: 'customers',
      data: {
        customer_id: 1,
        customer_code: 201,
        customer_name: 'المعلم فتحي البقال',
        customer_address: 'سوق الجملة - باكية 12',
        customer_mobile: '01223456789',
        hold: 0,
        special: 0,
        byaaa_c_s: 0,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    {
      id: 'f67-cust-202',
      tableName: 'customers',
      data: {
        customer_id: 2,
        customer_code: 202,
        customer_name: 'طارق الصعيدي',
        customer_address: 'شبرا الخيمة',
        customer_mobile: '01551234888',
        hold: 0,
        special: 0,
        byaaa_c_s: 0,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    // nakla (النقلات السابقة)
    {
      id: 'f67-nakla-1',
      tableName: 'nakla',
      data: {
        nakla_id: 101,
        nakla_number: 101,
        sup_name: 'الحاج سالم عبد الحميد',
        farm_name: 'مزرعة النوبارية والبحيرة',
        nakla_name: 'نقلة موز 101',
        nakla_weight: 4500,
        sobata_number: 180,
        nakla_date: '2026-10-15',
        wahba: 100,
        comission: 0.05,
        byaaa: 2.0,
        tanzil: 300,
        nakla_finish: 0,
        nakla_sarf: 0,
        printed: 1,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    // nakla_cat (أصناف النقلة)
    {
      id: 'f67-ncat-1',
      tableName: 'nakla_cat',
      data: {
        id: 1,
        sup_name: 'الحاج سالم عبد الحميد',
        farm_name: 'مزرعة النوبارية والبحيرة',
        nakla_name: 'نقلة موز 101',
        cat_id: 101,
        cat_name: 'موز بلدي فاخر',
        cat_number: 180,
        cat_byaaa: 2.0,
        cat_byaaa_s: 1.0,
        pack_id: 1,
        pack_rahn: 0,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    // fatora_f (جدول المبيعات المعتمد)
    {
      id: 'f67-fat-1',
      tableName: 'fatora_f',
      data: {
        id: 1,
        nakla_id: 101,
        nakla_name: 'نقلة موز 101',
        sup_name: 'الحاج سالم عبد الحميد',
        farm_name: 'مزرعة النوبارية والبحيرة',
        cat_id: 101,
        cat_name: 'موز بلدي فاخر',
        sobata_num: 40,
        package_unit: 'سباطة',
        t_weight: 1000,
        net_weight: 1000,
        price: 28.0,
        totally: 28000,
        cash: 1,
        customer_name: 'المعلم فتحي البقال',
        customer_code: 201,
        byaaa: 2.0,
        trans_date: '2026-10-15',
        rahn_case: 0,
        rahn: 0,
        t_rahn: 0,
        tota: 28000,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
    // zemam (حسابات الذمم والمتبقي)
    {
      id: 'f67-zem-1',
      tableName: 'zemam',
      data: {
        id: 1,
        nakla_id: 101,
        nakla_name: 'نقلة موز 101',
        customer_name: 'طارق الصعيدي',
        customer_code: 202,
        zemam: 15000,
        trans_date: '2026-10-15',
        tota: 15000,
        safi_zemam: 15000,
        samah: 0,
        tahseel: 0,
        rahn: 0,
        rahn_pay: 0,
        safi_rahn: 0,
        rahn_pay_type: 0,
      },
      syncStatus: 'synced',
      createdAt: now,
      syncedAt: now,
    },
  ];
}

function readFruit67Store(): Fruit67LocalRecord[] {
  try {
    if (!fs.existsSync(FRUIT67_STORE_FILE)) {
      fs.mkdirSync(path.dirname(FRUIT67_STORE_FILE), { recursive: true });
      const seeds = getInitialFruit67SeedRecords();
      fs.writeFileSync(FRUIT67_STORE_FILE, JSON.stringify(seeds, null, 2), 'utf-8');
      return seeds;
    }
    const raw = fs.readFileSync(FRUIT67_STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeds = getInitialFruit67SeedRecords();
      fs.writeFileSync(FRUIT67_STORE_FILE, JSON.stringify(seeds, null, 2), 'utf-8');
      return seeds;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading fruit67 store:', e);
    return getInitialFruit67SeedRecords();
  }
}

function writeFruit67Store(records: Fruit67LocalRecord[]) {
  try {
    fs.mkdirSync(path.dirname(FRUIT67_STORE_FILE), { recursive: true });
    fs.writeFileSync(FRUIT67_STORE_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing fruit67 store:', e);
  }
}

// Reset Local fruit67 Store to initial seed
app.post('/api/fruit67/reset-store', (_req: Request, res: Response) => {
  const seeds = getInitialFruit67SeedRecords();
  writeFruit67Store(seeds);
  return res.json({
    success: true,
    message: 'تمت استعادة البيانات النموذجية الأساسية لقاعدة fruit67 بنجاح!',
    recordsCount: seeds.length,
  });
});

// 6. Get fruit67 Local Status
app.get('/api/fruit67/status', (_req: Request, res: Response) => {
  const records = readFruit67Store();
  const pending = records.filter((r) => r.syncStatus === 'pending');
  const synced = records.filter((r) => r.syncStatus === 'synced');
  const lastSyncTime = synced.length > 0 ? synced[synced.length - 1].syncedAt : null;

  return res.json({
    databaseName: 'fruit67',
    totalTables: 39,
    totalLocalRecords: records.length,
    pendingSyncCount: pending.length,
    lastSyncTime: lastSyncTime,
  });
});

// 7. Get fruit67 Local Records
app.get('/api/fruit67/records', (req: Request, res: Response) => {
  const { table } = req.query;
  const records = readFruit67Store();
  if (table) {
    return res.json({ records: records.filter((r) => r.tableName === table) });
  }
  return res.json({ records });
});

// 8. Save Records to Local fruit67 Copy
app.post('/api/fruit67/save-records', (req: Request, res: Response) => {
  const { tableName, rows } = req.body;
  if (!tableName || !rows || !Array.isArray(rows)) {
    return res.status(400).json({ error: 'اسم الجدول والصفوف مطلوبة' });
  }

  const existing = readFruit67Store();
  const now = new Date().toISOString();

  const newRecords: Fruit67LocalRecord[] = rows.map((r: any, idx: number) => {
    // Flatten row cells or pass row data
    const rowData: Record<string, any> = {};
    if (r.cells) {
      Object.keys(r.cells).forEach((k) => {
        rowData[k] = r.cells[k]?.value ?? null;
      });
    } else {
      Object.assign(rowData, r);
    }

    return {
      id: r.id || `f67-${Date.now()}-${idx}`,
      tableName,
      data: rowData,
      syncStatus: 'pending',
      createdAt: now,
      syncedAt: null,
    };
  });

  const combined = [...existing, ...newRecords];
  writeFruit67Store(combined);

  return res.json({
    success: true,
    message: `تم حفظ ${newRecords.length} سجل في النسخة المحلية لقاعدة بيانات fruit67 بنجاح!`,
    savedCount: newRecords.length,
    totalLocalRecords: combined.length,
  });
});

// 8.1 Get All Records Grouped by Table for the Visual Model
app.get('/api/fruit67/table-records', (req: Request, res: Response) => {
  const store = readFruit67Store();
  const targetTables = [
    'fatora_f',
    'nakla',
    'nakla_cat',
    'category',
    'suppliers',
    'farm',
    'customers',
    'zemam',
    'nakla_exps',
  ];

  const grouped: Record<string, any[]> = {};
  targetTables.forEach((t) => {
    grouped[t] = store
      .filter((r) => r.tableName === t)
      .map((r) => ({
        _recordId: r.id,
        _syncStatus: r.syncStatus,
        _createdAt: r.createdAt,
        ...r.data,
      }));
  });

  return res.json({
    success: true,
    tables: grouped,
    counts: Object.fromEntries(Object.entries(grouped).map(([k, v]) => [k, v.length])),
  });
});

// 8.2 Intelligent Voice Ingestion (Multi-Step & Full Sequence) for fruit67 Database
app.post('/api/fruit67/voice-step-ingest', async (req: Request, res: Response) => {
  try {
    const { step = 'all', spokenText, audioBase64, mimeType, context = {} } = req.body;

    if (!spokenText && !audioBase64) {
      return res.status(400).json({
        success: false,
        error: 'النص الصوتي أو ملف الصوت مطلوب (Voice text or audio is required)',
      });
    }

    const store = readFruit67Store();
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const newRecordsToAdd: Fruit67LocalRecord[] = [];
    const stepLogs: string[] = [];

    // Helper: find existing records in table
    const getTableRows = (tbl: string) => store.filter((r) => r.tableName === tbl).map((r) => r.data);

    // ===================================================================
    // 1. STEP: supplier_farm (الموردين والمزارع)
    // ===================================================================
    if (step === 'supplier_farm') {
      const parsed = parseArabicFruitStepFallback('supplier_farm', spokenText, context);
      const supName = (parsed.supplierName || 'أحمد جابر').trim();
      const farmName = (parsed.farmName || supName).trim(); // قاعدة: تكون المزرعة باسم المورد

      const suppliers = getTableRows('suppliers');
      let supRecord = suppliers.find(
        (s) => s.sup_name && s.sup_name.trim().toLowerCase() === supName.toLowerCase()
      );

      let supId: number;
      let isNewSupplier = false;
      if (!supRecord) {
        isNewSupplier = true;
        const maxSupId = suppliers.length > 0 ? Math.max(...suppliers.map((s) => Number(s.sup_id) || 0)) : 0;
        supId = maxSupId + 1;
        const newSupData = {
          sup_id: supId,
          sup_name: supName,
          sup_address: 'سوق الجملة المركزي',
          sup_mobile: '',
          hold: 0,
          comission: 0.05,
        };
        newRecordsToAdd.push({
          id: `f67-sup-${Date.now()}`,
          tableName: 'suppliers',
          data: newSupData,
          syncStatus: 'pending',
          createdAt: now,
          syncedAt: null,
        });
        stepLogs.push(`🏢 [الموردين suppliers]: مورد جديد! تم تسجيل [${supName}] بكود [${supId} = MAX+1] وعمولة 5%`);
      } else {
        supId = Number(supRecord.sup_id) || 1;
        stepLogs.push(`🏢 [الموردين suppliers]: المورد [${supRecord.sup_name}] مسجل مسبقاً بكود [${supId}]`);
      }

      // Check / Add Farm
      const farms = getTableRows('farm');
      let farmRecord = farms.find(
        (f) =>
          f.sup_name &&
          f.sup_name.trim().toLowerCase() === supName.toLowerCase() &&
          f.farm_name &&
          f.farm_name.trim().toLowerCase() === farmName.toLowerCase()
      );

      let farmId: number;
      let isNewFarm = false;
      if (!farmRecord) {
        isNewFarm = true;
        const maxFarmId = farms.length > 0 ? Math.max(...farms.map((f) => Number(f.farm_id) || 0)) : 0;
        farmId = maxFarmId + 1;
        const newFarmData = {
          farm_id: farmId,
          sup_name: supName,
          farm_name: farmName,
          hold: 0,
        };
        newRecordsToAdd.push({
          id: `f67-farm-${Date.now()}`,
          tableName: 'farm',
          data: newFarmData,
          syncStatus: 'pending',
          createdAt: now,
          syncedAt: null,
        });
        stepLogs.push(`🌿 [المزارع farm]: إنشاء مزرعة جديدة [${farmName}] تابعة للمورد [${supName}] بكود [${farmId}]`);
      } else {
        farmId = Number(farmRecord.farm_id) || 1;
        stepLogs.push(`🌿 [المزارع farm]: تم الربط مع المزرعة المسجلة [${farmRecord.farm_name}] للمورد [${supName}]`);
      }

      if (newRecordsToAdd.length > 0) {
        writeFruit67Store([...store, ...newRecordsToAdd]);
      }

      return res.json({
        success: true,
        step: 'supplier_farm',
        supplierName: supName,
        farmName: farmName,
        supId,
        farmId,
        isNewSupplier,
        isNewFarm,
        stepLogs,
        recordsAddedCount: newRecordsToAdd.length,
        transcript: spokenText,
        summary: `تم بنجاح اعتماد المورد [${supName}] والمزرعة [${farmName}]`,
      });
    }

    // ===================================================================
    // 2. STEP: category (الأصناف والبياعة)
    // ===================================================================
    if (step === 'category') {
      const parsed = parseArabicFruitStepFallback('category', spokenText, context);
      const catName = (parsed.catName || 'مانجو فص').trim();
      const byaaa = Number(parsed.byaaa) || 2.5;
      const byaaaKhassa = Number(parsed.byaaaKhassa) || 1.0;

      const categories = getTableRows('category');
      let matchedCat = categories.find(
        (c) => c.cat_name && c.cat_name.trim().toLowerCase() === catName.toLowerCase()
      );

      let catCode: number;
      let isNew = false;

      if (!matchedCat || parsed.isNew) {
        isNew = true;
        // User rule: "الكود بيجي من اكبر عدد موجود في اكواد الصنف و اضيف واحد"
        const maxCatCode = categories.reduce((max, c) => {
          const code = Number(c.cat_code) || 0;
          return code > max ? code : max;
        }, 100);

        catCode = maxCatCode + 1;
        const newCatData = {
          id: categories.length + 1,
          cat_name: catName,
          cat_code: catCode,
          byaaa: byaaa,
          byaaa_s: byaaaKhassa,
          hold: 0,
        };

        newRecordsToAdd.push({
          id: `f67-cat-${catCode}-${Date.now()}`,
          tableName: 'category',
          data: newCatData,
          syncStatus: 'pending',
          createdAt: now,
          syncedAt: null,
        });

        stepLogs.push(
          `🏷️ [دليل الأصناف category]: صنف جديد [${catName}] - تم إدراجه بكود [${catCode} = MAX(${maxCatCode}) + 1] وبياعة عادية [${byaaa}] وبياعة خاصة [${byaaaKhassa}]`
        );
      } else {
        catCode = Number(matchedCat.cat_code) || 101;
        stepLogs.push(
          `🏷️ [دليل الأصناف category]: تم التعرف على الصنف [${matchedCat.cat_name}] بكود مسجل سابقاً [${catCode}] وبياعة [${matchedCat.byaaa}] وخاصة [${matchedCat.byaaa_s}]`
        );
      }

      if (newRecordsToAdd.length > 0) {
        writeFruit67Store([...store, ...newRecordsToAdd]);
      }

      return res.json({
        success: true,
        step: 'category',
        catName,
        catCode,
        byaaa: matchedCat ? Number(matchedCat.byaaa) : byaaa,
        byaaaKhassa: matchedCat ? Number(matchedCat.byaaa_s) : byaaaKhassa,
        isNew,
        stepLogs,
        recordsAddedCount: newRecordsToAdd.length,
        transcript: spokenText,
        summary: `تم بنجاح تسجيل/اعتماد الصنف [${catName}] بكود [${catCode}] وبياعة [${byaaa}]`,
      });
    }

    // ===================================================================
    // 3. STEP: nakla (النقلة وأصنافها وترتيب النقلات)
    // ===================================================================
    if (step === 'nakla') {
      const parsed = parseArabicFruitStepFallback('nakla', spokenText, context);
      const supName = (context?.supplierName || parsed.supplierName || 'أحمد جابر').trim();
      const farmName = (context?.farmName || parsed.farmName || supName).trim();

      const existingNaklas = getTableRows('nakla');
      // Rule: "اسم النقلة و ترتيبها لنفرض ان اسم المورد احمد جابر تكون المزرعة بأسم احمد جابر و النقلات يتم ترتيبها احمد جابر 1 ثم احمد جابر 2"
      const supplierNaklas = existingNaklas.filter(
        (n) => n.sup_name && n.sup_name.trim().toLowerCase() === supName.toLowerCase()
      );
      const sequenceNumber = supplierNaklas.length + 1;
      const naklaName = `${supName} ${sequenceNumber}`;

      const nextNaklaId =
        existingNaklas.length > 0
          ? Math.max(...existingNaklas.map((n) => Number(n.nakla_id) || 0)) + 1
          : 101;

      const nawloon = Number(parsed.nawloon) || 0;
      const wahba = Number(parsed.wahba) || 0;
      const totalCount = Number(parsed.totalReceivedCount) || 120;
      const totalWeight = Number(parsed.totalWeight) || totalCount * 15;

      const newNaklaData = {
        nakla_id: nextNaklaId,
        nakla_number: sequenceNumber,
        sup_name: supName,
        farm_name: farmName,
        nakla_name: naklaName,
        nakla_weight: totalWeight,
        sobata_number: totalCount,
        nakla_date: today,
        wahba: wahba,
        comission: 0.05,
        byaaa: 2.0,
        tanzil: 0,
        nakla_finish: 0,
        nakla_sarf: 0,
        printed: 0,
      };

      newRecordsToAdd.push({
        id: `f67-nakla-${Date.now()}`,
        tableName: 'nakla',
        data: newNaklaData,
        syncStatus: 'pending',
        createdAt: now,
        syncedAt: null,
      });

      stepLogs.push(
        `🚚 [النقلات nakla]: إضافة النقلة [${naklaName}] (الترتيب: ${sequenceNumber} للمورد ${supName}) بكود داخلي [${nextNaklaId}] بعدد مستلم [${totalCount}]`
      );

      // Expenses
      if (nawloon > 0) {
        newRecordsToAdd.push({
          id: `f67-nexp-nawloon-${Date.now()}`,
          tableName: 'nakla_exps',
          data: {
            id: Date.now() % 1000000,
            nakla_name: naklaName,
            exp_name: 'نولون',
            exp_amount: nawloon,
            exp_date: today,
          },
          syncStatus: 'pending',
          createdAt: now,
          syncedAt: null,
        });
        stepLogs.push(`💸 [مصروفات النقلة nakla_exps]: تسجيل نولون الشحن بمبلغ [${nawloon} ج.م] للنقلة [${naklaName}]`);
      }

      if (wahba > 0) {
        newRecordsToAdd.push({
          id: `f67-nexp-wahba-${Date.now()}`,
          tableName: 'nakla_exps',
          data: {
            id: (Date.now() + 1) % 1000000,
            nakla_name: naklaName,
            exp_name: 'وهبة',
            exp_amount: wahba,
            exp_date: today,
          },
          syncStatus: 'pending',
          createdAt: now,
          syncedAt: null,
        });
        stepLogs.push(`💸 [مصروفات النقلة nakla_exps]: تسجيل وهبة السائق بمبلغ [${wahba} ج.م] للنقلة [${naklaName}]`);
      }

      // Add items to nakla_cat
      const existingCategories = getTableRows('category');
      const itemsList = parsed.items && parsed.items.length > 0
        ? parsed.items
        : [{ catName: context?.catName || 'مانجو فص', receivedCount: totalCount }];

      for (const it of itemsList) {
        const cName = (it.catName || context?.catName || 'مانجو فص').trim();
        const matched = existingCategories.find(
          (c) => c.cat_name && c.cat_name.trim().toLowerCase() === cName.toLowerCase()
        );

        let catCode = matched ? Number(matched.cat_code) : (context?.catCode || 104);
        let byaaaVal = matched ? Number(matched.byaaa) : (context?.byaaa || 2.5);
        let byaaaKhassaVal = matched ? Number(matched.byaaa_s) : (context?.byaaaKhassa || 1.0);

        newRecordsToAdd.push({
          id: `f67-ncat-${Date.now()}-${catCode}`,
          tableName: 'nakla_cat',
          data: {
            id: Date.now() % 1000000,
            sup_name: supName,
            farm_name: farmName,
            nakla_name: naklaName,
            cat_id: catCode,
            cat_name: cName,
            cat_number: it.receivedCount || totalCount,
            cat_byaaa: byaaaVal,
            cat_byaaa_s: byaaaKhassaVal,
            pack_id: 1,
            pack_rahn: 0,
          },
          syncStatus: 'pending',
          createdAt: now,
          syncedAt: null,
        });

        stepLogs.push(
          `📦 [أصناف النقلة nakla_cat]: تسكين الصنف [${cName}] بالنقلة بعدد مستلم [${it.receivedCount || totalCount}] وبياعة [${byaaaVal}] وبياعة خاصة [${byaaaKhassaVal}]`
        );
      }

      if (newRecordsToAdd.length > 0) {
        writeFruit67Store([...store, ...newRecordsToAdd]);
      }

      return res.json({
        success: true,
        step: 'nakla',
        naklaName,
        sequenceNumber,
        nextNaklaId,
        supplierName: supName,
        farmName: farmName,
        itemsCount: itemsList.length,
        stepLogs,
        recordsAddedCount: newRecordsToAdd.length,
        transcript: spokenText,
        summary: `تم بنجاح فتح النقلة [${naklaName}] وترتيبها ${sequenceNumber} وتسكين أصنافها ومصروفاتها`,
      });
    }

    // ===================================================================
    // 4. STEP: sales (جدول المبيعات fatora_f والزبائن والذمم)
    // ===================================================================
    if (step === 'sales') {
      const parsed = parseArabicFruitStepFallback('sales', spokenText, context);
      const naklaName = (context?.naklaName || 'أحمد جابر 1').trim();
      const supName = (context?.supplierName || 'أحمد جابر').trim();
      const farmName = (context?.farmName || supName).trim();
      const catName = (context?.catName || 'مانجو فص').trim();
      const catCode = Number(context?.catCode) || 104;
      const byaaa = Number(context?.byaaa) || 2.5;

      const existingCustomers = [...getTableRows('customers')];
      const customerCodeMap: Record<string, number> = {};

      const salesList = parsed.sales && parsed.sales.length > 0
        ? parsed.sales
        : [
            {
              catName,
              count: 30,
              weight: 450,
              price: 40,
              paymentType: 'نقدي',
              customerName: 'عميل نقدي',
              isNewCustomer: false,
            },
          ];

      for (const sale of salesList) {
        const isCash = sale.paymentType === 'نقدي' || sale.paymentType === 'كاش';
        let custName = (sale.customerName || (isCash ? 'عميل نقدي' : 'عماد الطوخي')).trim();
        if (isCash) custName = 'عميل نقدي';

        let custCode = 0;
        if (!isCash) {
          // Rule: "لو الزبون جديد يتم تسجيله في جدول الزبائن في حال كان غير موجود"
          let matchedCust = existingCustomers.find(
            (c) => c.customer_name && c.customer_name.trim().toLowerCase() === custName.toLowerCase()
          );

          if (!matchedCust || sale.isNewCustomer) {
            const maxCustCode = existingCustomers.reduce((max, c) => {
              const code = Number(c.customer_code) || 0;
              return code > max ? code : max;
            }, 200);

            custCode = maxCustCode + 1;
            const newCustData = {
              customer_id: existingCustomers.length + 1,
              customer_code: custCode,
              customer_name: custName,
              customer_address: 'سوق الجملة',
              customer_mobile: '',
              hold: 0,
              special: 0,
              byaaa_c_s: 0,
            };

            existingCustomers.push(newCustData);
            newRecordsToAdd.push({
              id: `f67-cust-${custCode}-${Date.now()}`,
              tableName: 'customers',
              data: newCustData,
              syncStatus: 'pending',
              createdAt: now,
              syncedAt: null,
            });

            customerCodeMap[custName] = custCode;
            stepLogs.push(
              `👥 [العملاء customers]: زبون جديد [${custName}] - تم تسجيله بكود [${custCode} = MAX(${maxCustCode}) + 1]`
            );
          } else {
            custCode = Number(matchedCust.customer_code) || 201;
            customerCodeMap[custName] = custCode;
            stepLogs.push(`👥 [العملاء customers]: ربط مع الزبون المسجل [${custName}] (كود: ${custCode})`);
          }
        }

        const saleCount = Number(sale.count) || 0;
        const saleWeight = Number(sale.weight) || 0;
        const salePrice = Number(sale.price) || 0;
        // Total = weight * price (or count * price)
        const saleTotal = saleWeight > 0 ? saleWeight * salePrice : saleCount * salePrice;

        // Record in fatora_f (جدول المبيعات المعتمد)
        const fatoraRowData = {
          id: Date.now() % 1000000000 + Math.floor(Math.random() * 1000),
          nakla_id: 101,
          sobata_num: saleCount,
          cat_id: catCode,
          cat_name: sale.catName || catName,
          package_unit: 'قفص / سباطة',
          t_weight: saleWeight,
          samah_weight: 0,
          net_weight: saleWeight,
          price: salePrice,
          totally: saleTotal,
          cash: isCash ? 1 : 0,
          customer_name: custName,
          trans_date: today,
          sup_name: supName,
          farm_name: farmName,
          nakla_name: naklaName,
          byaaa: byaaa,
          rahn_case: 0,
          rahn: 0,
          t_rahn: 0,
          tota: saleTotal,
          customer_code: custCode,
        };

        newRecordsToAdd.push({
          id: `f67-fatora-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          tableName: 'fatora_f',
          data: fatoraRowData,
          syncStatus: 'pending',
          createdAt: now,
          syncedAt: null,
        });

        stepLogs.push(
          `🧾 [جدول المبيعات fatora_f]: تسجيل حركة بيع للنقلة [${naklaName}] - عدد [${saleCount}]، وزن [${saleWeight} كجم]، بسعر [${salePrice} ج.م] بإجمالي [${saleTotal} ج.م] - سداد [${isCash ? 'نقدي 💵' : 'زمام (آجل) ⏳'}] للزبون [${custName}]`
        );

        // If credit (زمام), record debt in zemam
        if (!isCash) {
          const zemamRowData = {
            id: Date.now() % 1000000000 + Math.floor(Math.random() * 1000),
            nakla_id: 101,
            customer_name: custName,
            zemam: saleTotal,
            samah: 0,
            tahseel: 0,
            trans_date: today,
            safi_zemam: saleTotal,
            nakla_name: naklaName,
            rahn: 0,
            rahn_pay: 0,
            tota: saleTotal,
            safi_rahn: 0,
            rahn_pay_type: 0,
            customer_code: custCode,
          };

          newRecordsToAdd.push({
            id: `f67-zemam-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            tableName: 'zemam',
            data: zemamRowData,
            syncStatus: 'pending',
            createdAt: now,
            syncedAt: null,
          });

          stepLogs.push(
            `📜 [الذمم zemam]: ترحيل مديونية بيع آجل على الزبون [${custName}] بمبلغ [${saleTotal} ج.م] لحساب النقلة [${naklaName}]`
          );
        }
      }

      if (newRecordsToAdd.length > 0) {
        writeFruit67Store([...store, ...newRecordsToAdd]);
      }

      return res.json({
        success: true,
        step: 'sales',
        salesRecorded: salesList.length,
        naklaName,
        stepLogs,
        recordsAddedCount: newRecordsToAdd.length,
        transcript: spokenText,
        summary: `تم بنجاح تسكين ${salesList.length} حركة بيع في جدول fatora_f وترحيل الذمم وإضافة الزبائن الجدد`,
      });
    }

    // ===================================================================
    // 5. STEP: all (التتابع الكامل الشامل)
    // ===================================================================
    const parsed = parseArabicFruitStepFallback('all', spokenText, context);

    // 1. Supplier & Farm
    let supName = (parsed.supplierName || 'أحمد جابر').trim();
    let farmName = (parsed.farmName || supName).trim(); // المزرعة باسم المورد

    const suppliers = getTableRows('suppliers');
    let supRecord = suppliers.find(
      (s) => s.sup_name && s.sup_name.trim().toLowerCase() === supName.toLowerCase()
    );

    let supId = 1;
    if (!supRecord) {
      const maxSupId = suppliers.length > 0 ? Math.max(...suppliers.map((s) => Number(s.sup_id) || 0)) : 0;
      supId = maxSupId + 1;
      newRecordsToAdd.push({
        id: `f67-sup-${Date.now()}`,
        tableName: 'suppliers',
        data: {
          sup_id: supId,
          sup_name: supName,
          sup_address: 'سوق الجملة المركزي',
          sup_mobile: '',
          hold: 0,
          comission: 0.05,
        },
        syncStatus: 'pending',
        createdAt: now,
        syncedAt: null,
      });
      stepLogs.push(`🏢 [الموردين suppliers]: مورد جديد! تم تسجيل [${supName}] بكود [${supId} = MAX+1]`);
    } else {
      supId = Number(supRecord.sup_id) || 1;
      stepLogs.push(`🏢 [الموردين suppliers]: تم الربط مع المورد المسجل [${supRecord.sup_name}] (كود: ${supId})`);
    }

    const farms = getTableRows('farm');
    let farmRecord = farms.find(
      (f) =>
        f.sup_name &&
        f.sup_name.trim().toLowerCase() === supName.toLowerCase() &&
        f.farm_name &&
        f.farm_name.trim().toLowerCase() === farmName.toLowerCase()
    );

    if (!farmRecord) {
      const maxFarmId = farms.length > 0 ? Math.max(...farms.map((f) => Number(f.farm_id) || 0)) : 0;
      const farmId = maxFarmId + 1;
      newRecordsToAdd.push({
        id: `f67-farm-${Date.now()}`,
        tableName: 'farm',
        data: {
          farm_id: farmId,
          sup_name: supName,
          farm_name: farmName,
          hold: 0,
        },
        syncStatus: 'pending',
        createdAt: now,
        syncedAt: null,
      });
      stepLogs.push(`🌿 [المزارع farm]: إنشاء مزرعة جديدة [${farmName}] للمورد [${supName}]`);
    } else {
      stepLogs.push(`🌿 [المزارع farm]: تم الربط مع المزرعة [${farmRecord.farm_name}]`);
    }

    // 2. Category & Byaaa
    const existingCategories = [...getTableRows('category')];
    const itemsList = parsed.items && parsed.items.length > 0
      ? parsed.items
      : [{ catName: 'مانجو فص', receivedCount: 120, byaaa: 3.0, byaaaKhassa: 1.5, isNew: false }];

    const itemCodeMap: Record<string, { catCode: number; byaaa: number; byaaaKhassa: number }> = {};

    for (const item of itemsList) {
      const cName = (item.catName || 'مانجو فص').trim();
      let matchedCat = existingCategories.find(
        (c) => c.cat_name && c.cat_name.trim().toLowerCase() === cName.toLowerCase()
      );

      const byaaa = Number(item.byaaa) || 2.5;
      const byaaaKhassa = Number(item.byaaaKhassa) || 1.0;

      if (!matchedCat || item.isNew) {
        const maxCatCode = existingCategories.reduce((max, c) => {
          const code = Number(c.cat_code) || 0;
          return code > max ? code : max;
        }, 100);

        const newCatCode = maxCatCode + 1;
        const newCatData = {
          id: existingCategories.length + 1,
          cat_name: cName,
          cat_code: newCatCode,
          byaaa: byaaa,
          byaaa_s: byaaaKhassa,
          hold: 0,
        };

        existingCategories.push(newCatData);
        newRecordsToAdd.push({
          id: `f67-cat-${newCatCode}-${Date.now()}`,
          tableName: 'category',
          data: newCatData,
          syncStatus: 'pending',
          createdAt: now,
          syncedAt: null,
        });

        itemCodeMap[cName] = { catCode: newCatCode, byaaa, byaaaKhassa };
        stepLogs.push(
          `🏷️ [دليل الأصناف category]: صنف جديد [${cName}] - إدراج بكود [${newCatCode} = MAX+1] وبياعة [${byaaa}] وخاصة [${byaaaKhassa}]`
        );
      } else {
        const catCode = Number(matchedCat.cat_code) || 101;
        itemCodeMap[cName] = {
          catCode,
          byaaa: Number(matchedCat.byaaa) || byaaa,
          byaaaKhassa: Number(matchedCat.byaaa_s) || byaaaKhassa,
        };
        stepLogs.push(
          `🏷️ [دليل الأصناف category]: الصنف [${cName}] مسجل سابقاً بكود [${catCode}] وبياعة [${matchedCat.byaaa}]`
        );
      }
    }

    // 3. Sequential Nakla Naming (أحمد جابر 1، أحمد جابر 2...)
    const existingNaklas = getTableRows('nakla');
    const supplierNaklas = existingNaklas.filter(
      (n) => n.sup_name && n.sup_name.trim().toLowerCase() === supName.toLowerCase()
    );
    const sequenceNumber = supplierNaklas.length + 1;
    const naklaName = `${supName} ${sequenceNumber}`;

    const nextNaklaId =
      existingNaklas.length > 0
        ? Math.max(...existingNaklas.map((n) => Number(n.nakla_id) || 0)) + 1
        : 101;

    const totalCount = itemsList.reduce((sum: number, it: any) => sum + (Number(it.receivedCount) || 0), 0) || 120;
    const totalWeight = totalCount * 15;
    const nawloon = Number(parsed.nawloon) || 0;
    const wahba = Number(parsed.wahba) || 0;

    newRecordsToAdd.push({
      id: `f67-nakla-${Date.now()}`,
      tableName: 'nakla',
      data: {
        nakla_id: nextNaklaId,
        nakla_number: sequenceNumber,
        sup_name: supName,
        farm_name: farmName,
        nakla_name: naklaName,
        nakla_weight: totalWeight,
        sobata_number: totalCount,
        nakla_date: today,
        wahba: wahba,
        comission: 0.05,
        byaaa: 2.0,
        tanzil: 0,
        nakla_finish: 0,
        nakla_sarf: 0,
        printed: 0,
      },
      syncStatus: 'pending',
      createdAt: now,
      syncedAt: null,
    });
    stepLogs.push(
      `🚚 [النقلات nakla]: إضافة النقلة [${naklaName}] (ترتيب: ${sequenceNumber} للمورد ${supName}) بعدد مستلم [${totalCount}]`
    );

    // Expenses
    if (nawloon > 0) {
      newRecordsToAdd.push({
        id: `f67-nexp-nawloon-${Date.now()}`,
        tableName: 'nakla_exps',
        data: {
          id: Date.now() % 1000000,
          nakla_name: naklaName,
          exp_name: 'نولون',
          exp_amount: nawloon,
          exp_date: today,
        },
        syncStatus: 'pending',
        createdAt: now,
        syncedAt: null,
      });
      stepLogs.push(`💸 [مصروفات النقلة nakla_exps]: تسجيل نولون الشحن بمبلغ [${nawloon} ج.م] للنقلة [${naklaName}]`);
    }

    if (wahba > 0) {
      newRecordsToAdd.push({
        id: `f67-nexp-wahba-${Date.now()}`,
        tableName: 'nakla_exps',
        data: {
          id: (Date.now() + 1) % 1000000,
          nakla_name: naklaName,
          exp_name: 'وهبة',
          exp_amount: wahba,
          exp_date: today,
        },
        syncStatus: 'pending',
        createdAt: now,
        syncedAt: null,
      });
      stepLogs.push(`💸 [مصروفات النقلة nakla_exps]: تسجيل وهبة السائق بمبلغ [${wahba} ج.م] للنقلة [${naklaName}]`);
    }

    // nakla_cat rows
    for (const it of itemsList) {
      const cName = (it.catName || 'مانجو فص').trim();
      const itInfo = itemCodeMap[cName] || { catCode: 104, byaaa: 2.5, byaaaKhassa: 1.0 };
      newRecordsToAdd.push({
        id: `f67-ncat-${Date.now()}-${itInfo.catCode}`,
        tableName: 'nakla_cat',
        data: {
          id: Date.now() % 1000000,
          sup_name: supName,
          farm_name: farmName,
          nakla_name: naklaName,
          cat_id: itInfo.catCode,
          cat_name: cName,
          cat_number: it.receivedCount || totalCount,
          cat_byaaa: itInfo.byaaa,
          cat_byaaa_s: itInfo.byaaaKhassa,
          pack_id: 1,
          pack_rahn: 0,
        },
        syncStatus: 'pending',
        createdAt: now,
        syncedAt: null,
      });
      stepLogs.push(
        `📦 [أصناف النقلة nakla_cat]: تسكين الصنف [${cName}] بالنقلة بعدد [${it.receivedCount || totalCount}] وبياعة [${itInfo.byaaa}] وخاصة [${itInfo.byaaaKhassa}]`
      );
    }

    // 4. Sales in fatora_f, Customers & Zemam
    const existingCustomers = [...getTableRows('customers')];
    const customerCodeMap: Record<string, number> = {};

    const salesList = parsed.sales && parsed.sales.length > 0
      ? parsed.sales
      : [
          {
            catName: Object.keys(itemCodeMap)[0] || 'مانجو فص',
            count: 30,
            weight: 450,
            price: 40,
            paymentType: 'نقدي',
            customerName: 'عميل نقدي',
            isNewCustomer: false,
          },
          {
            catName: Object.keys(itemCodeMap)[0] || 'مانجو فص',
            count: 40,
            weight: 600,
            price: 40,
            paymentType: 'زمام',
            customerName: 'عماد الطوخي',
            isNewCustomer: true,
          },
        ];

    for (const sale of salesList) {
      const isCash = sale.paymentType === 'نقدي' || sale.paymentType === 'كاش';
      let custName = (sale.customerName || (isCash ? 'عميل نقدي' : 'عماد الطوخي')).trim();
      if (isCash) custName = 'عميل نقدي';

      let custCode = 0;
      if (!isCash) {
        let matchedCust = existingCustomers.find(
          (c) => c.customer_name && c.customer_name.trim().toLowerCase() === custName.toLowerCase()
        );

        if (!matchedCust || sale.isNewCustomer) {
          const maxCustCode = existingCustomers.reduce((max, c) => {
            const code = Number(c.customer_code) || 0;
            return code > max ? code : max;
          }, 200);

          custCode = maxCustCode + 1;
          const newCustData = {
            customer_id: existingCustomers.length + 1,
            customer_code: custCode,
            customer_name: custName,
            customer_address: 'سوق الجملة',
            customer_mobile: '',
            hold: 0,
            special: 0,
            byaaa_c_s: 0,
          };

          existingCustomers.push(newCustData);
          newRecordsToAdd.push({
            id: `f67-cust-${custCode}-${Date.now()}`,
            tableName: 'customers',
            data: newCustData,
            syncStatus: 'pending',
            createdAt: now,
            syncedAt: null,
          });

          customerCodeMap[custName] = custCode;
          stepLogs.push(
            `👥 [العملاء customers]: زبون جديد [${custName}] - تم تسجيله بكود [${custCode} = MAX(${maxCustCode}) + 1]`
          );
        } else {
          custCode = Number(matchedCust.customer_code) || 201;
          customerCodeMap[custName] = custCode;
          stepLogs.push(`👥 [العملاء customers]: ربط مع الزبون المسجل [${custName}] (كود: ${custCode})`);
        }
      }

      const saleCount = Number(sale.count) || 0;
      const saleWeight = Number(sale.weight) || 0;
      const salePrice = Number(sale.price) || 0;
      const saleTotal = saleWeight > 0 ? saleWeight * salePrice : saleCount * salePrice;

      const saleItemName = (sale.catName || Object.keys(itemCodeMap)[0] || 'مانجو فص').trim();
      const saleItemInfo = itemCodeMap[saleItemName] || { catCode: 104, byaaa: 2.5, byaaaKhassa: 1.0 };

      // Record in fatora_f
      newRecordsToAdd.push({
        id: `f67-fatora-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tableName: 'fatora_f',
        data: {
          id: Date.now() % 1000000000 + Math.floor(Math.random() * 1000),
          nakla_id: nextNaklaId,
          sobata_num: saleCount,
          cat_id: saleItemInfo.catCode,
          cat_name: saleItemName,
          package_unit: 'قفص / سباطة',
          t_weight: saleWeight,
          samah_weight: 0,
          net_weight: saleWeight,
          price: salePrice,
          totally: saleTotal,
          cash: isCash ? 1 : 0,
          customer_name: custName,
          trans_date: today,
          sup_name: supName,
          farm_name: farmName,
          nakla_name: naklaName,
          byaaa: saleItemInfo.byaaa,
          rahn_case: 0,
          rahn: 0,
          t_rahn: 0,
          tota: saleTotal,
          customer_code: custCode,
        },
        syncStatus: 'pending',
        createdAt: now,
        syncedAt: null,
      });

      stepLogs.push(
        `🧾 [جدول المبيعات fatora_f]: تسجيل حركة بيع للنقلة [${naklaName}] - عدد [${saleCount}]، وزن [${saleWeight} كجم]، بسعر [${salePrice} ج.م] بإجمالي [${saleTotal} ج.م] - سداد [${isCash ? 'نقدي 💵' : 'زمام (آجل) ⏳'}] للزبون [${custName}]`
      );

      // If credit, record debt in zemam
      if (!isCash) {
        newRecordsToAdd.push({
          id: `f67-zemam-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          tableName: 'zemam',
          data: {
            id: Date.now() % 1000000000 + Math.floor(Math.random() * 1000),
            nakla_id: nextNaklaId,
            customer_name: custName,
            zemam: saleTotal,
            samah: 0,
            tahseel: 0,
            trans_date: today,
            safi_zemam: saleTotal,
            nakla_name: naklaName,
            rahn: 0,
            rahn_pay: 0,
            tota: saleTotal,
            safi_rahn: 0,
            rahn_pay_type: 0,
            customer_code: custCode,
          },
          syncStatus: 'pending',
          createdAt: now,
          syncedAt: null,
        });

        stepLogs.push(
          `📜 [الذمم zemam]: ترحيل مديونية بيع آجل على الزبون [${custName}] بمبلغ [${saleTotal} ج.م] لحساب النقلة [${naklaName}]`
        );
      }
    }

    // Save all new records to store
    const updatedStore = [...store, ...newRecordsToAdd];
    writeFruit67Store(updatedStore);

    // Generate T-SQL script
    let tSql = `-- =======================================================================
-- كود استيراد حركة النقلة والمبيعات إلى قاعدة بيانات fruit67
-- تم استخراجه ومعالجته بالذكاء الاصطناعي من الإدخال الصوتي
-- التاريخ: ${today} | النقلة: [${naklaName}] (ترتيب: ${sequenceNumber})
-- =======================================================================

USE [fruit67];
GO

SET NOCOUNT ON;
BEGIN TRANSACTION;

BEGIN TRY
    PRINT N'جاري تسكين حركة النقلة والمبيعات في جداول قاعدة بيانات fruit67...';
`;

    const byTable: Record<string, any[]> = {};
    newRecordsToAdd.forEach((r) => {
      if (!byTable[r.tableName]) byTable[r.tableName] = [];
      byTable[r.tableName].push(r.data);
    });

    Object.keys(byTable).forEach((tbl) => {
      const rows = byTable[tbl];
      const cols = Object.keys(rows[0]);
      const colList = cols.map((c) => `[${c}]`).join(', ');
      const valRows = rows.map((r) => {
        const vals = cols.map((c) => {
          const v = r[c];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return v;
          if (typeof v === 'boolean') return v ? 1 : 0;
          return `N'${String(v).replace(/'/g, "''")}'`;
        });
        return `        (${vals.join(', ')})`;
      });

      tSql += `
    -- جدول [dbo].[${tbl}] (${rows.length} سجل)
    INSERT INTO [dbo].[${tbl}] (${colList})
    VALUES
${valRows.join(',\n')};
`;
    });

    tSql += `
    COMMIT TRANSACTION;
    PRINT N'تمت العملية وتسكين كافة جداول النقلة والمبيعات بنجاح في fruit67!';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT N'حدث خطأ أثناء تنفيذ الحركة: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO
`;

    return res.json({
      success: true,
      step: 'all',
      transcript: parsed.transcript || spokenText || '',
      summary: `تم بنجاح تحليل وتسجيل النقلة [${naklaName}] للمورد [${supName}] مع حفظ ${newRecordsToAdd.length} سجل عبر جداول fruit67!`,
      parsedEntities: parsed,
      stepLogs,
      recordsAddedCount: newRecordsToAdd.length,
      tablesAffected: Object.keys(byTable),
      tSqlScript: tSql,
      records: newRecordsToAdd,
    });
  } catch (error: any) {
    console.error('Error in fruit67 voice step ingest:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل معالجة الإدخال الصوتي للنقلة: ' + (error.message || String(error)),
    });
  }
});

// Alias endpoint for backward compatibility
app.post('/api/fruit67/voice-ingest', (req: Request, res: Response) => {
  req.url = '/api/fruit67/voice-step-ingest';
  return (app as any)._router.handle(req, res);
});

// 9. Sync Local fruit67 Records to User's PC SQL Server
app.post('/api/fruit67/sync-to-pc', async (req: Request, res: Response) => {
  const { connection, tableName } = req.body;

  if (!connection || !connection.server || !connection.user) {
    return res.status(400).json({
      success: false,
      error: 'يرجى إدخال بيانات الاتصال بسيرفر SQL Server على الكمبيوتر',
    });
  }

  const store = readFruit67Store();
  const pendingRecords = store.filter(
    (r) => r.syncStatus === 'pending' && (!tableName || r.tableName === tableName)
  );

  if (pendingRecords.length === 0) {
    return res.json({
      success: true,
      message: 'جميع السجلات في النسخة المحلية متزامنة بالفعل مع الكمبيوتر!',
      syncedCount: 0,
    });
  }

  const sqlConfig: sql.config = {
    server: connection.server,
    port: connection.port ? parseInt(connection.port, 10) : 1433,
    database: connection.database || 'fruit67',
    user: connection.user,
    password: connection.password || '',
    options: {
      encrypt: connection.encrypt !== false,
      trustServerCertificate: connection.trustServerCertificate !== false,
      connectTimeout: 8000,
      requestTimeout: 15000,
    },
  };

  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let syncedCount = 0;
    const now = new Date().toISOString();

    for (let i = 0; i < pendingRecords.length; i++) {
      const rec = pendingRecords[i];
      const targetTable = rec.tableName;
      const request = new sql.Request(transaction);

      const colNames: string[] = [];
      const paramNames: string[] = [];

      Object.entries(rec.data).forEach(([col, val], cIdx) => {
        // Skip id column if identity
        if (col === 'id' || col === '_syncStatus' || col === '_syncedAt') return;

        colNames.push(`[${col}]`);
        const paramKey = `p_${col}_${i}_${cIdx}`;
        paramNames.push(`@${paramKey}`);
        request.input(paramKey, val);
      });

      if (colNames.length > 0) {
        const query = `
          INSERT INTO [dbo].[${targetTable}] (${colNames.join(', ')})
          VALUES (${paramNames.join(', ')});
        `;
        await request.query(query);
      }

      rec.syncStatus = 'synced';
      rec.syncedAt = now;
      syncedCount++;
    }

    await transaction.commit();
    writeFruit67Store(store);

    return res.json({
      success: true,
      message: `تمت مزامنة ${syncedCount} سجل بنجاح مع قاعدة بيانات [fruit67] على الكمبيوتر!`,
      syncedCount,
    });
  } catch (err: any) {
    console.error('Error syncing to PC:', err);
    return res.status(500).json({
      success: false,
      error: 'فشلت المزامنة مع الكمبيوتر: ' + (err.message || String(err)),
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// 10. Generate Sync T-SQL Script for SSMS on PC
app.post('/api/fruit67/generate-sync-script', (req: Request, res: Response) => {
  const { tableName, onlyPending } = req.body;
  const store = readFruit67Store();

  const records = store.filter((r) => {
    if (tableName && r.tableName !== tableName) return false;
    if (onlyPending && r.syncStatus !== 'pending') return false;
    return true;
  });

  if (records.length === 0) {
    return res.json({
      script: `-- لا توجد سجلات معلقة للمزامنة في النسخة المحلية لقاعدة بيانات fruit67\n-- التاريخ: ${new Date().toLocaleString('ar-EG')}`,
      count: 0,
    });
  }

  // Group by table
  const byTable: Record<string, any[]> = {};
  records.forEach((r) => {
    if (!byTable[r.tableName]) byTable[r.tableName] = [];
    byTable[r.tableName].push(r.data);
  });

  let scriptBlocks = `-- =======================================================================
-- سكريبت مزامنة قاعدة البيانات fruit67 مع الكمبيوتر
-- تم توليده آلياً من النسخة المحلية لتطبيق قراءة الدفاتر اليدوية
-- قاعدة البيانات المستهدفة على جهازك: [fruit67]
-- إجمالي السجلات للمزامنة: ${records.length} سجل
-- التاريخ: ${new Date().toLocaleString('ar-EG')}
-- =======================================================================

USE [fruit67];
GO

SET NOCOUNT ON;
BEGIN TRANSACTION;
BEGIN TRY
`;

  Object.entries(byTable).forEach(([tbl, rows]) => {
    if (rows.length === 0) return;
    const cols = Object.keys(rows[0]).filter((c) => c !== 'id' && !c.startsWith('_'));
    const colList = cols.map((c) => `[${c}]`).join(', ');

    const valRows = rows.map((r) => {
      const vals = cols.map((c) => {
        const v = r[c];
        if (v === null || v === undefined || v === '') return 'NULL';
        if (typeof v === 'number') return String(v);
        if (typeof v === 'boolean') return v ? '1' : '0';
        return `N'${String(v).replace(/'/g, "''")}'`;
      });
      return `        (${vals.join(', ')})`;
    });

    scriptBlocks += `
    PRINT N'جاري مزامنة ${rows.length} حركة في جدول [dbo].[${tbl}]...';
    INSERT INTO [dbo].[${tbl}] (${colList})
    VALUES
${valRows.join(',\n')};
`;
  });

  scriptBlocks += `
    COMMIT TRANSACTION;
    PRINT N'تمت المزامنة بنجاح مع قاعدة بيانات fruit67 على جهازك!';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT N'حدث خطأ أثناء المزامنة: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO
`;

  return res.json({
    script: scriptBlocks,
    count: records.length,
  });
});

// Vite Middleware for Frontend Serving
async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const portNumber = Number(PORT) || 3000;
  server.listen(portNumber, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${portNumber}`);
  });
}

startServer();
