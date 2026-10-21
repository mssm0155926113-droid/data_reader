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

// 5. Parse Voice Input Endpoint (العدد، الوزن، الاسم، السعر، اسم النقلة)
app.post('/api/voice-parse', async (req: Request, res: Response) => {
  try {
    const { spokenText, audioBase64, mimeType } = req.body;

    if (!spokenText && !audioBase64) {
      return res.status(400).json({ error: 'النص الصوتي أو ملف الصوت مطلوب (Voice text or audio is required)' });
    }

    const systemPrompt = `
أنت مساعد محاسبي ذكي متخصص في استخراج بيانات حركات النقل والحمولات والتوريدات من الصوت المنطوق باللغة العربية (سواء كانت فصحى أو لهجات عامية مثل المصرية والخليجية والشامية).

المطلوب بدقة شديدة استخراج الحقول الخمسة التالية:
1. "count" (العدد): عدد النقلات، الأكياس، الكراتين، القطع (رقم صحيح integer). مثال: "عشرين" -> 20، "خمسة وثلاثين" -> 35.
2. "weight" (الوزن): الوزن بالطن أو الكيلو (رقم عشري number/float). مثال: "طن ونص" -> 1.5، "خمسة طن" -> 5.0، "750 كيلو" -> 750.
3. "name" (الاسم): اسم الشخص، العميل، السائق، المقاول أو الشركة (نص String). مثال: "الحاج محمد عبد الله"، "شركة النيل".
4. "price" (السعر): المبلغ الإجمالي أو السعر (رقم عشري number/float). مثال: "ألفين ونص" -> 2500، "ثلاثة آلاف ومائتين" -> 3200.
5. "tripName" (اسم النقلة): نوع النقلة، اسم المادة المنقولة، أو الحمولة (نص String). مثال: "نقلة رمل أحمر"، "نقلة سن 2"، "توريد حديد 10 مم".

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
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
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

function readFruit67Store(): Fruit67LocalRecord[] {
  try {
    if (!fs.existsSync(FRUIT67_STORE_FILE)) {
      fs.mkdirSync(path.dirname(FRUIT67_STORE_FILE), { recursive: true });
      fs.writeFileSync(FRUIT67_STORE_FILE, JSON.stringify([]), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(FRUIT67_STORE_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Error reading fruit67 store:', e);
    return [];
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
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
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

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
