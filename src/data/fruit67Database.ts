import { TableDefinition } from "../types/ledger";

// النسخة الكاملة المنسوخة من قاعدة بيانات fruit67 (قاعدة بيانات إدارة الفاكهة والحمولات والتوريدات)
export const FRUIT67_TABLES: TableDefinition[] = [
  {
    "id": "tbl_backuppath",
    "name": "backuppath",
    "schemaName": "dbo",
    "descriptionAr": "مسارات النسخ الاحتياطي",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_backuppath",
        "name": "backuppath",
        "labelAr": "backuppath",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_branch_exps",
    "name": "branch_exps",
    "schemaName": "dbo",
    "descriptionAr": "جدول branch_exps",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_exp_name",
        "name": "exp_name",
        "labelAr": "اسم المصروف",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_exp_amount",
        "name": "exp_amount",
        "labelAr": "قيمة المصروف",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_date",
        "name": "date",
        "labelAr": "التاريخ",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_c_exps",
    "name": "c_exps",
    "schemaName": "dbo",
    "descriptionAr": "جدول c_exps",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_exp_name",
        "name": "exp_name",
        "labelAr": "اسم المصروف",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_category",
    "name": "category",
    "schemaName": "dbo",
    "descriptionAr": "جدول category",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_cat_name",
        "name": "cat_name",
        "labelAr": "اسم الصنف",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_hold",
        "name": "hold",
        "labelAr": "hold",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_byaaa",
        "name": "byaaa",
        "labelAr": "البياعة / العمولة",
        "dataType": "DECIMAL(6,2)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cat_code",
        "name": "cat_code",
        "labelAr": "cat_code",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_byaaa_s",
        "name": "byaaa_s",
        "labelAr": "byaaa_s",
        "dataType": "DECIMAL(6,2)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_company_data",
    "name": "company_data",
    "schemaName": "dbo",
    "descriptionAr": "جدول company_data",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "NCHAR(10)",
        "isNullable": false,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_branch",
        "name": "branch",
        "labelAr": "branch",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_comission",
        "name": "comission",
        "labelAr": "العمولة",
        "dataType": "DECIMAL(2,2)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_byaaa",
        "name": "byaaa",
        "labelAr": "البياعة / العمولة",
        "dataType": "DECIMAL(4,2)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_tanzil",
        "name": "tanzil",
        "labelAr": "التنزيل / المشال",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_wahba",
        "name": "wahba",
        "labelAr": "الوهبة / الإكرامية",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_tel",
        "name": "tel",
        "labelAr": "tel",
        "dataType": "NVARCHAR(15)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_company_exps",
    "name": "company_exps",
    "schemaName": "dbo",
    "descriptionAr": "جدول company_exps",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_exp_name",
        "name": "exp_name",
        "labelAr": "اسم المصروف",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_exp_amont",
        "name": "exp_amont",
        "labelAr": "exp_amont",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_exp_date",
        "name": "exp_date",
        "labelAr": "exp_date",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_customers",
    "name": "customers",
    "schemaName": "dbo",
    "descriptionAr": "دليل العملاء وأرقام الهواتف",
    "columns": [
      {
        "id": "col_customer_id",
        "name": "customer_id",
        "labelAr": "كود العميل",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_customer_name",
        "name": "customer_name",
        "labelAr": "اسم العميل",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_customer_address",
        "name": "customer_address",
        "labelAr": "عنوان العميل",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_customer_mobile",
        "name": "customer_mobile",
        "labelAr": "موبايل العميل",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_hold",
        "name": "hold",
        "labelAr": "hold",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_special",
        "name": "special",
        "labelAr": "special",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_byaaa_c_s",
        "name": "byaaa_c_s",
        "labelAr": "byaaa_c_s",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_customer_code",
        "name": "customer_code",
        "labelAr": "رمز العميل",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_expenses",
    "name": "expenses",
    "schemaName": "dbo",
    "descriptionAr": "جدول expenses",
    "columns": [
      {
        "id": "col_exp_id",
        "name": "exp_id",
        "labelAr": "exp_id",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_exp_name",
        "name": "exp_name",
        "labelAr": "اسم المصروف",
        "dataType": "NVARCHAR(50)",
        "isNullable": false,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_farm",
    "name": "farm",
    "schemaName": "dbo",
    "descriptionAr": "دليل المزارع والحدائق",
    "columns": [
      {
        "id": "col_farm_id",
        "name": "farm_id",
        "labelAr": "كود المزرعة",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_name",
        "name": "farm_name",
        "labelAr": "اسم المزرعة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_hold",
        "name": "hold",
        "labelAr": "hold",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_farm_exps",
    "name": "farm_exps",
    "schemaName": "dbo",
    "descriptionAr": "مصروفات المزارع",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_name",
        "name": "farm_name",
        "labelAr": "اسم المزرعة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_exp_name",
        "name": "exp_name",
        "labelAr": "اسم المصروف",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_exp_amount",
        "name": "exp_amount",
        "labelAr": "قيمة المصروف",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_descrip",
        "name": "descrip",
        "labelAr": "descrip",
        "dataType": "NVARCHAR(100)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_fatora",
    "name": "fatora",
    "schemaName": "dbo",
    "descriptionAr": "فواتير المبيعات والحمولات (الرئيسية)",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "BIGINT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_nakla_id",
        "name": "nakla_id",
        "labelAr": "كود النقلة",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sobata_num",
        "name": "sobata_num",
        "labelAr": "sobata_num",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_banana_weight",
        "name": "banana_weight",
        "labelAr": "وزن الموز / البضاعة",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_safi_weight",
        "name": "safi_weight",
        "labelAr": "الوزن الصافي",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_free_wehigh",
        "name": "free_wehigh",
        "labelAr": "الوزن القائم / الحر",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_net_weight",
        "name": "net_weight",
        "labelAr": "الوزن الصافي",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_price",
        "name": "price",
        "labelAr": "السعر",
        "dataType": "DECIMAL(18,2)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_totally",
        "name": "totally",
        "labelAr": "الإجمالي الكلي",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cash",
        "name": "cash",
        "labelAr": "نقداً",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_customer_name",
        "name": "customer_name",
        "labelAr": "اسم العميل",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_name",
        "name": "farm_name",
        "labelAr": "اسم المزرعة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_fatora_f",
    "name": "fatora_f",
    "schemaName": "dbo",
    "descriptionAr": "تفاصيل فواتير الفاكهة والأصناف",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "BIGINT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_nakla_id",
        "name": "nakla_id",
        "labelAr": "كود النقلة",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sobata_num",
        "name": "sobata_num",
        "labelAr": "sobata_num",
        "dataType": "DECIMAL(6,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cat_id",
        "name": "cat_id",
        "labelAr": "كود الصنف",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cat_name",
        "name": "cat_name",
        "labelAr": "اسم الصنف",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_package_unit",
        "name": "package_unit",
        "labelAr": "وحدة التعبئة",
        "dataType": "NVARCHAR(20)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_t_weight",
        "name": "t_weight",
        "labelAr": "إجمالي الوزن",
        "dataType": "DECIMAL(10,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_samah_weight",
        "name": "samah_weight",
        "labelAr": "samah_weight",
        "dataType": "DECIMAL(3,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_net_weight",
        "name": "net_weight",
        "labelAr": "الوزن الصافي",
        "dataType": "DECIMAL(10,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_price",
        "name": "price",
        "labelAr": "السعر",
        "dataType": "DECIMAL(18,2)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_totally",
        "name": "totally",
        "labelAr": "الإجمالي الكلي",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cash",
        "name": "cash",
        "labelAr": "نقداً",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_customer_name",
        "name": "customer_name",
        "labelAr": "اسم العميل",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_name",
        "name": "farm_name",
        "labelAr": "اسم المزرعة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_byaaa",
        "name": "byaaa",
        "labelAr": "البياعة / العمولة",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_rahn_case",
        "name": "rahn_case",
        "labelAr": "rahn_case",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_rahn",
        "name": "rahn",
        "labelAr": "الرهن",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_t_rahn",
        "name": "t_rahn",
        "labelAr": "t_rahn",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_tota",
        "name": "tota",
        "labelAr": "tota",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_customer_code",
        "name": "customer_code",
        "labelAr": "رمز العميل",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_fatoraf_f_summary",
    "name": "fatoraf_f_summary",
    "schemaName": "dbo",
    "descriptionAr": "ملخص فواتير الأصناف",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_cat",
        "name": "cat",
        "labelAr": "cat",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_num",
        "name": "num",
        "labelAr": "num",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_package",
        "name": "package",
        "labelAr": "package",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_weight",
        "name": "weight",
        "labelAr": "weight",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_price",
        "name": "price",
        "labelAr": "السعر",
        "dataType": "DECIMAL(18,2)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_naklaid",
        "name": "naklaid",
        "labelAr": "naklaid",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_fatoraf_f_summary_save",
    "name": "fatoraf_f_summary_save",
    "schemaName": "dbo",
    "descriptionAr": "أرشيف ملخص الفواتير",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_cat",
        "name": "cat",
        "labelAr": "cat",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_num",
        "name": "num",
        "labelAr": "num",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_package",
        "name": "package",
        "labelAr": "package",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_weight",
        "name": "weight",
        "labelAr": "weight",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_price",
        "name": "price",
        "labelAr": "السعر",
        "dataType": "DECIMAL(18,2)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_naklaid",
        "name": "naklaid",
        "labelAr": "naklaid",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_khazina_debit",
    "name": "khazina_debit",
    "schemaName": "dbo",
    "descriptionAr": "حركات مدين الخزينة",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_owner_name",
        "name": "owner_name",
        "labelAr": "owner_name",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_owner_debit",
        "name": "owner_debit",
        "labelAr": "owner_debit",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_login",
    "name": "login",
    "schemaName": "dbo",
    "descriptionAr": "بيانات تسجيل الدخول والمستخدمين",
    "columns": [
      {
        "id": "col_user_name",
        "name": "user_name",
        "labelAr": "user_name",
        "dataType": "NVARCHAR(50)",
        "isNullable": false,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_password",
        "name": "password",
        "labelAr": "password",
        "dataType": "NVARCHAR(50)",
        "isNullable": false,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_nakla",
    "name": "nakla",
    "schemaName": "dbo",
    "descriptionAr": "حركات وسجلات النقلات",
    "columns": [
      {
        "id": "col_nakla_id",
        "name": "nakla_id",
        "labelAr": "كود النقلة",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_nakla_number",
        "name": "nakla_number",
        "labelAr": "رقم النقلة",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_name",
        "name": "farm_name",
        "labelAr": "اسم المزرعة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_weight",
        "name": "nakla_weight",
        "labelAr": "وزن النقلة",
        "dataType": "DECIMAL(5,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sobata_number",
        "name": "sobata_number",
        "labelAr": "عدد السوابط",
        "dataType": "DECIMAL(4,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_date",
        "name": "nakla_date",
        "labelAr": "nakla_date",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_comission",
        "name": "comission",
        "labelAr": "العمولة",
        "dataType": "DECIMAL(4,2)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_byaaa",
        "name": "byaaa",
        "labelAr": "البياعة / العمولة",
        "dataType": "DECIMAL(4,2)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_tanzil",
        "name": "tanzil",
        "labelAr": "التنزيل / المشال",
        "dataType": "DECIMAL(4,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_wahba",
        "name": "wahba",
        "labelAr": "الوهبة / الإكرامية",
        "dataType": "DECIMAL(4,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_finish",
        "name": "nakla_finish",
        "labelAr": "nakla_finish",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_sarf",
        "name": "nakla_sarf",
        "labelAr": "nakla_sarf",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_printed",
        "name": "printed",
        "labelAr": "printed",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_nakla_cat",
    "name": "nakla_cat",
    "schemaName": "dbo",
    "descriptionAr": "أصناف وتصنيفات النقلة",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_name",
        "name": "farm_name",
        "labelAr": "اسم المزرعة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cat_id",
        "name": "cat_id",
        "labelAr": "كود الصنف",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cat_name",
        "name": "cat_name",
        "labelAr": "اسم الصنف",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cat_number",
        "name": "cat_number",
        "labelAr": "cat_number",
        "dataType": "DECIMAL(6,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cat_byaaa",
        "name": "cat_byaaa",
        "labelAr": "cat_byaaa",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cat_byaaa_s",
        "name": "cat_byaaa_s",
        "labelAr": "cat_byaaa_s",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_pack_id",
        "name": "pack_id",
        "labelAr": "pack_id",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_pack_rahn",
        "name": "pack_rahn",
        "labelAr": "pack_rahn",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_nakla_exps",
    "name": "nakla_exps",
    "schemaName": "dbo",
    "descriptionAr": "مصروفات النقلة",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_exp_name",
        "name": "exp_name",
        "labelAr": "اسم المصروف",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_exp_amount",
        "name": "exp_amount",
        "labelAr": "قيمة المصروف",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_exp_date",
        "name": "exp_date",
        "labelAr": "exp_date",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_nakla_nakdia",
    "name": "nakla_nakdia",
    "schemaName": "dbo",
    "descriptionAr": "حركات نقدية النقلة والعهدة",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_name",
        "name": "farm_name",
        "labelAr": "اسم المزرعة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cash_advance",
        "name": "cash_advance",
        "labelAr": "cash_advance",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_dofaat",
        "name": "dofaat",
        "labelAr": "dofaat",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_exp",
        "name": "farm_exp",
        "labelAr": "farm_exp",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_exp_amount",
        "name": "farm_exp_amount",
        "labelAr": "farm_exp_amount",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sarf_khazina",
        "name": "sarf_khazina",
        "labelAr": "sarf_khazina",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_any_new",
        "name": "any_new",
        "labelAr": "any_new",
        "dataType": "DECIMAL(18,1)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_owner_sahb",
    "name": "owner_sahb",
    "schemaName": "dbo",
    "descriptionAr": "مسحوبات أصحاب العمل",
    "columns": [
      {
        "id": "col_trans_id",
        "name": "trans_id",
        "labelAr": "trans_id",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_owner_name",
        "name": "owner_name",
        "labelAr": "owner_name",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_owner_credit",
        "name": "owner_credit",
        "labelAr": "owner_credit",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_owners",
    "name": "owners",
    "schemaName": "dbo",
    "descriptionAr": "دليل الشركاء وأصحاب العمل",
    "columns": [
      {
        "id": "col_owner_id",
        "name": "owner_id",
        "labelAr": "owner_id",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_owner_name",
        "name": "owner_name",
        "labelAr": "owner_name",
        "dataType": "NVARCHAR(50)",
        "isNullable": false,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_pack_rahn",
    "name": "pack_rahn",
    "schemaName": "dbo",
    "descriptionAr": "رهونات الطرود",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_pack_name",
        "name": "pack_name",
        "labelAr": "pack_name",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_pack_rahn",
        "name": "pack_rahn",
        "labelAr": "pack_rahn",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_package_discount",
    "name": "package_discount",
    "schemaName": "dbo",
    "descriptionAr": "خصومات وتنزيلات الطرود",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_package_sup",
        "name": "package_sup",
        "labelAr": "package_sup",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_discounted",
        "name": "discounted",
        "labelAr": "discounted",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_pack_total",
        "name": "pack_total",
        "labelAr": "pack_total",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_descrip",
        "name": "descrip",
        "labelAr": "descrip",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_dis_code",
        "name": "dis_code",
        "labelAr": "dis_code",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sarf_khazina",
        "name": "sarf_khazina",
        "labelAr": "sarf_khazina",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_package_exp",
    "name": "package_exp",
    "schemaName": "dbo",
    "descriptionAr": "مصروفات الطرود والعبوات",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_package_sup",
        "name": "package_sup",
        "labelAr": "package_sup",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_exp_amount",
        "name": "exp_amount",
        "labelAr": "قيمة المصروف",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_decrip",
        "name": "decrip",
        "labelAr": "decrip",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_package_exp_name",
    "name": "package_exp_name",
    "schemaName": "dbo",
    "descriptionAr": "مسميات مصروفات الطرود",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_package_exp_name",
        "name": "package_exp_name",
        "labelAr": "package_exp_name",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_package_spec",
    "name": "package_spec",
    "schemaName": "dbo",
    "descriptionAr": "مواصفات الطرود والعبوات",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_package_sup",
        "name": "package_sup",
        "labelAr": "package_sup",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_package_exp_name",
        "name": "package_exp_name",
        "labelAr": "package_exp_name",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_pack_num",
        "name": "pack_num",
        "labelAr": "pack_num",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_pack_price",
        "name": "pack_price",
        "labelAr": "pack_price",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_pack_total",
        "name": "pack_total",
        "labelAr": "pack_total",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_dis_code",
        "name": "dis_code",
        "labelAr": "dis_code",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_vis",
        "name": "vis",
        "labelAr": "vis",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_discount",
        "name": "discount",
        "labelAr": "discount",
        "dataType": "NVARCHAR(15)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_package_sups",
    "name": "package_sups",
    "schemaName": "dbo",
    "descriptionAr": "موردي الطرود",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_package_sup",
        "name": "package_sup",
        "labelAr": "package_sup",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sup_adress",
        "name": "sup_adress",
        "labelAr": "sup_adress",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sup_mobile",
        "name": "sup_mobile",
        "labelAr": "موبايل المورد",
        "dataType": "NVARCHAR(20)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_package_unit",
    "name": "package_unit",
    "schemaName": "dbo",
    "descriptionAr": "وحدات قياس الطرود",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_package_unit",
        "name": "package_unit",
        "labelAr": "وحدة التعبئة",
        "dataType": "NVARCHAR(10)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_safi_fatora",
    "name": "safi_fatora",
    "schemaName": "dbo",
    "descriptionAr": "صافي الفواتير والتسويات",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_nakla_id",
        "name": "nakla_id",
        "labelAr": "كود النقلة",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_egmaly",
        "name": "egmaly",
        "labelAr": "الإجمالي",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_comission",
        "name": "comission",
        "labelAr": "العمولة",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_tanzil",
        "name": "tanzil",
        "labelAr": "التنزيل / المشال",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_wahba",
        "name": "wahba",
        "labelAr": "الوهبة / الإكرامية",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_exps",
        "name": "nakla_exps",
        "labelAr": "nakla_exps",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cash_advance",
        "name": "cash_advance",
        "labelAr": "cash_advance",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_dofaat",
        "name": "dofaat",
        "labelAr": "dofaat",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_exp",
        "name": "farm_exp",
        "labelAr": "farm_exp",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_any_new",
        "name": "any_new",
        "labelAr": "any_new",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_safi_fatora",
        "name": "safi_fatora",
        "labelAr": "صافي الفاتورة",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_harsh",
        "name": "harsh",
        "labelAr": "harsh",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_fatora_add",
        "name": "fatora_add",
        "labelAr": "fatora_add",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_safi_fatora_editing",
    "name": "safi_fatora_editing",
    "schemaName": "dbo",
    "descriptionAr": "تعديلات صافي الفاتورة",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_nakla_id",
        "name": "nakla_id",
        "labelAr": "كود النقلة",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_egmaly",
        "name": "egmaly",
        "labelAr": "الإجمالي",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_comission",
        "name": "comission",
        "labelAr": "العمولة",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_tanzil",
        "name": "tanzil",
        "labelAr": "التنزيل / المشال",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_wahba",
        "name": "wahba",
        "labelAr": "الوهبة / الإكرامية",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_exps",
        "name": "nakla_exps",
        "labelAr": "nakla_exps",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cash_advance",
        "name": "cash_advance",
        "labelAr": "cash_advance",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_dofaat",
        "name": "dofaat",
        "labelAr": "dofaat",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_exp",
        "name": "farm_exp",
        "labelAr": "farm_exp",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_any_new",
        "name": "any_new",
        "labelAr": "any_new",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_safi_fatora",
        "name": "safi_fatora",
        "labelAr": "صافي الفاتورة",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_harsh",
        "name": "harsh",
        "labelAr": "harsh",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_fatora_add",
        "name": "fatora_add",
        "labelAr": "fatora_add",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_safi_fatora_editing_save",
    "name": "safi_fatora_editing_save",
    "schemaName": "dbo",
    "descriptionAr": "أرشيف تعديلات صافي الفاتورة",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_nakla_id",
        "name": "nakla_id",
        "labelAr": "كود النقلة",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_egmaly",
        "name": "egmaly",
        "labelAr": "الإجمالي",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_comission",
        "name": "comission",
        "labelAr": "العمولة",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_tanzil",
        "name": "tanzil",
        "labelAr": "التنزيل / المشال",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_wahba",
        "name": "wahba",
        "labelAr": "الوهبة / الإكرامية",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_exps",
        "name": "nakla_exps",
        "labelAr": "nakla_exps",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cash_advance",
        "name": "cash_advance",
        "labelAr": "cash_advance",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_dofaat",
        "name": "dofaat",
        "labelAr": "dofaat",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_exp",
        "name": "farm_exp",
        "labelAr": "farm_exp",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_any_new",
        "name": "any_new",
        "labelAr": "any_new",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_safi_fatora",
        "name": "safi_fatora",
        "labelAr": "صافي الفاتورة",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_harsh",
        "name": "harsh",
        "labelAr": "harsh",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_fatora_add",
        "name": "fatora_add",
        "labelAr": "fatora_add",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_sarf_fatora",
    "name": "sarf_fatora",
    "schemaName": "dbo",
    "descriptionAr": "صرف وتسديد الفواتير",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_farm_name",
        "name": "farm_name",
        "labelAr": "اسم المزرعة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_id",
        "name": "nakla_id",
        "labelAr": "كود النقلة",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_safi_fatora",
        "name": "safi_fatora",
        "labelAr": "صافي الفاتورة",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_cash_advance",
        "name": "cash_advance",
        "labelAr": "cash_advance",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_dofaat",
        "name": "dofaat",
        "labelAr": "dofaat",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_any_new",
        "name": "any_new",
        "labelAr": "any_new",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_comission",
        "name": "comission",
        "labelAr": "العمولة",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_tanzil",
        "name": "tanzil",
        "labelAr": "التنزيل / المشال",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_wahba",
        "name": "wahba",
        "labelAr": "الوهبة / الإكرامية",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sarf_khazina",
        "name": "sarf_khazina",
        "labelAr": "sarf_khazina",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_fatora_date",
        "name": "fatora_date",
        "labelAr": "fatora_date",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_bur",
        "name": "bur",
        "labelAr": "bur",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_issue_date",
        "name": "issue_date",
        "labelAr": "issue_date",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_printed",
        "name": "printed",
        "labelAr": "printed",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_tax",
        "name": "tax",
        "labelAr": "tax",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_fatora_add",
        "name": "fatora_add",
        "labelAr": "fatora_add",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_byaaa",
        "name": "byaaa",
        "labelAr": "البياعة / العمولة",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_price_dif",
        "name": "price_dif",
        "labelAr": "price_dif",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_service",
    "name": "service",
    "schemaName": "dbo",
    "descriptionAr": "الخدمات",
    "columns": [
      {
        "id": "col_service_id",
        "name": "service_id",
        "labelAr": "service_id",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_service_name",
        "name": "service_name",
        "labelAr": "service_name",
        "dataType": "NVARCHAR(50)",
        "isNullable": false,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_service_income",
    "name": "service_income",
    "schemaName": "dbo",
    "descriptionAr": "إيرادات الخدمات",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_service_name",
        "name": "service_name",
        "labelAr": "service_name",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_service_amount",
        "name": "service_amount",
        "labelAr": "service_amount",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_sup_cashback",
    "name": "sup_cashback",
    "schemaName": "dbo",
    "descriptionAr": "استردادات الموردين",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sup_debit",
        "name": "sup_debit",
        "labelAr": "sup_debit",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_descrip",
        "name": "descrip",
        "labelAr": "descrip",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_sup_sahb",
    "name": "sup_sahb",
    "schemaName": "dbo",
    "descriptionAr": "مسحوبات الموردين",
    "columns": [
      {
        "id": "col_sahb_id",
        "name": "sahb_id",
        "labelAr": "sahb_id",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sup_credit",
        "name": "sup_credit",
        "labelAr": "sup_credit",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_descrip",
        "name": "descrip",
        "labelAr": "descrip",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_suppliers",
    "name": "suppliers",
    "schemaName": "dbo",
    "descriptionAr": "دليل الموردين والتجار",
    "columns": [
      {
        "id": "col_sup_id",
        "name": "sup_id",
        "labelAr": "كود المورد",
        "dataType": "INT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_sup_name",
        "name": "sup_name",
        "labelAr": "اسم المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sup_address",
        "name": "sup_address",
        "labelAr": "عنوان المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_sup_mobile",
        "name": "sup_mobile",
        "labelAr": "موبايل المورد",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_hold",
        "name": "hold",
        "labelAr": "hold",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_comission",
        "name": "comission",
        "labelAr": "العمولة",
        "dataType": "DECIMAL(2,2)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  },
  {
    "id": "tbl_zemam",
    "name": "zemam",
    "schemaName": "dbo",
    "descriptionAr": "حسابات الذمم والمتبقي",
    "columns": [
      {
        "id": "col_id",
        "name": "id",
        "labelAr": "المعرف",
        "dataType": "BIGINT",
        "isNullable": false,
        "isPrimaryKey": true,
        "isIdentity": true
      },
      {
        "id": "col_nakla_id",
        "name": "nakla_id",
        "labelAr": "كود النقلة",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_customer_name",
        "name": "customer_name",
        "labelAr": "اسم العميل",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_zemam",
        "name": "zemam",
        "labelAr": "الذمم / المتبقي",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_samah",
        "name": "samah",
        "labelAr": "samah",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_tahseel",
        "name": "tahseel",
        "labelAr": "التحصيل",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_trans_date",
        "name": "trans_date",
        "labelAr": "تاريخ الحركة",
        "dataType": "DATE",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_safi_zemam",
        "name": "safi_zemam",
        "labelAr": "صافي الذمم",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_nakla_name",
        "name": "nakla_name",
        "labelAr": "اسم النقلة",
        "dataType": "NVARCHAR(50)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_rahn",
        "name": "rahn",
        "labelAr": "الرهن",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_rahn_pay",
        "name": "rahn_pay",
        "labelAr": "rahn_pay",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_tota",
        "name": "tota",
        "labelAr": "tota",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_safi_rahn",
        "name": "safi_rahn",
        "labelAr": "safi_rahn",
        "dataType": "DECIMAL(18,0)",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_rahn_pay_type",
        "name": "rahn_pay_type",
        "labelAr": "rahn_pay_type",
        "dataType": "BIT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      },
      {
        "id": "col_customer_code",
        "name": "customer_code",
        "labelAr": "رمز العميل",
        "dataType": "INT",
        "isNullable": true,
        "isPrimaryKey": false,
        "isIdentity": false
      }
    ]
  }
];
