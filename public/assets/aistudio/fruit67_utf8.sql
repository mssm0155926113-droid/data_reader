USE [master]
GO
/****** Object:  Database [fruit67]    Script Date: 10/10/2026 01:17:50 م ******/
CREATE DATABASE [fruit67]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'db71', FILENAME = N'C:\Users\mssm\Desktop\fruit67\fruit67.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'db71_log', FILENAME = N'C:\Users\mssm\Desktop\fruit67\fruit67_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO
ALTER DATABASE [fruit67] SET COMPATIBILITY_LEVEL = 150
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [fruit67].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [fruit67] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [fruit67] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [fruit67] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [fruit67] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [fruit67] SET ARITHABORT OFF 
GO
ALTER DATABASE [fruit67] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [fruit67] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [fruit67] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [fruit67] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [fruit67] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [fruit67] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [fruit67] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [fruit67] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [fruit67] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [fruit67] SET  DISABLE_BROKER 
GO
ALTER DATABASE [fruit67] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [fruit67] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [fruit67] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [fruit67] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [fruit67] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [fruit67] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [fruit67] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [fruit67] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [fruit67] SET  MULTI_USER 
GO
ALTER DATABASE [fruit67] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [fruit67] SET DB_CHAINING OFF 
GO
ALTER DATABASE [fruit67] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [fruit67] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [fruit67] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [fruit67] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [fruit67] SET QUERY_STORE = OFF
GO
USE [fruit67]
GO
ALTER DATABASE SCOPED CONFIGURATION SET IDENTITY_CACHE = OFF;
GO
USE [fruit67]
GO
USE [fruit67]
GO
/****** Object:  Sequence [dbo].[id]    Script Date: 10/10/2026 01:17:50 م ******/
CREATE SEQUENCE [dbo].[id] 
 AS [int]
 START WITH 1
 INCREMENT BY 1
 MINVALUE -2147483648
 MAXVALUE 2147483647
 CACHE 
GO
/****** Object:  Table [dbo].[backuppath]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[backuppath](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[backuppath] [nvarchar](50) NULL,
 CONSTRAINT [PK_backup] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[branch_exps]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[branch_exps](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[exp_name] [nvarchar](50) NULL,
	[exp_amount] [numeric](18, 0) NULL,
	[date] [date] NULL,
 CONSTRAINT [PK_branch_exps] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[c_exps]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[c_exps](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[exp_name] [nvarchar](50) NULL,
 CONSTRAINT [PK_c_exps] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[category]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[category](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[cat_name] [nvarchar](50) NULL,
	[hold] [bit] NULL,
	[byaaa] [numeric](6, 2) NULL,
	[cat_code] [int] NULL,
	[byaaa_s] [numeric](6, 2) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[company_data]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[company_data](
	[id] [nchar](10) NOT NULL,
	[branch] [nvarchar](50) NULL,
	[comission] [numeric](2, 2) NULL,
	[byaaa] [numeric](4, 2) NULL,
	[tanzil] [numeric](18, 0) NULL,
	[wahba] [numeric](18, 0) NULL,
	[tel] [nvarchar](15) NULL,
 CONSTRAINT [PK_company_data] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[company_exps]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[company_exps](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[exp_name] [nvarchar](50) NULL,
	[exp_amont] [numeric](18, 0) NULL,
	[exp_date] [date] NULL,
 CONSTRAINT [PK_company_exps] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[customers]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[customers](
	[customer_id] [int] IDENTITY(1,1) NOT NULL,
	[customer_name] [nvarchar](50) NULL,
	[customer_address] [nvarchar](50) NULL,
	[customer_mobile] [nvarchar](50) NULL,
	[hold] [bit] NULL,
	[special] [bit] NULL,
	[byaaa_c_s] [numeric](18, 0) NULL,
	[customer_code] [int] NULL,
 CONSTRAINT [PK_customers] PRIMARY KEY CLUSTERED 
(
	[customer_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[expenses]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[expenses](
	[exp_id] [int] IDENTITY(1,1) NOT NULL,
	[exp_name] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_expenses] PRIMARY KEY CLUSTERED 
(
	[exp_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[farm]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[farm](
	[farm_id] [int] IDENTITY(1,1) NOT NULL,
	[sup_name] [nvarchar](50) NULL,
	[farm_name] [nvarchar](50) NULL,
	[hold] [bit] NULL,
 CONSTRAINT [PK_farm] PRIMARY KEY CLUSTERED 
(
	[farm_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[farm_exps]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[farm_exps](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[sup_name] [nvarchar](50) NULL,
	[farm_name] [nvarchar](50) NULL,
	[exp_name] [nvarchar](50) NULL,
	[exp_amount] [numeric](18, 0) NULL,
	[trans_date] [date] NULL,
	[descrip] [nvarchar](100) NULL,
 CONSTRAINT [PK_farm_exps] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[fatora]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[fatora](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nakla_id] [int] NULL,
	[sobata_num] [numeric](18, 0) NULL,
	[banana_weight] [numeric](18, 0) NULL,
	[safi_weight] [numeric](18, 0) NULL,
	[free_wehigh] [numeric](18, 0) NULL,
	[net_weight] [numeric](18, 0) NULL,
	[price] [numeric](18, 2) NULL,
	[totally] [numeric](18, 0) NULL,
	[cash] [bit] NULL,
	[customer_name] [nvarchar](50) NULL,
	[trans_date] [date] NULL,
	[sup_name] [nvarchar](50) NULL,
	[farm_name] [nvarchar](50) NULL,
	[nakla_name] [nvarchar](50) NULL,
 CONSTRAINT [PK_fatora_1] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[fatora_f]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[fatora_f](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nakla_id] [int] NULL,
	[sobata_num] [numeric](6, 0) NULL,
	[cat_id] [int] NULL,
	[cat_name] [nvarchar](50) NULL,
	[package_unit] [nvarchar](20) NULL,
	[t_weight] [numeric](10, 0) NULL,
	[samah_weight] [numeric](3, 0) NULL,
	[net_weight] [numeric](10, 0) NULL,
	[price] [decimal](18, 2) NULL,
	[totally] [numeric](18, 0) NULL,
	[cash] [bit] NULL,
	[customer_name] [nvarchar](50) NULL,
	[trans_date] [date] NULL,
	[sup_name] [nvarchar](50) NULL,
	[farm_name] [nvarchar](50) NULL,
	[nakla_name] [nvarchar](50) NULL,
	[byaaa] [numeric](18, 0) NULL,
	[rahn_case] [bit] NULL,
	[rahn] [numeric](18, 0) NULL,
	[t_rahn] [numeric](18, 0) NULL,
	[tota] [numeric](18, 0) NULL,
	[customer_code] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[fatoraf_f_summary]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[fatoraf_f_summary](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[cat] [nvarchar](50) NULL,
	[num] [numeric](18, 0) NULL,
	[package] [nvarchar](50) NULL,
	[weight] [numeric](18, 0) NULL,
	[price] [numeric](18, 2) NULL,
	[naklaid] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[fatoraf_f_summary_save]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[fatoraf_f_summary_save](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[cat] [nvarchar](50) NULL,
	[num] [numeric](18, 0) NULL,
	[package] [nvarchar](50) NULL,
	[weight] [numeric](18, 0) NULL,
	[price] [numeric](18, 2) NULL,
	[naklaid] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[khazina_debit]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[khazina_debit](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[owner_name] [nvarchar](50) NULL,
	[owner_debit] [numeric](18, 0) NULL,
	[trans_date] [date] NULL,
 CONSTRAINT [PK_khazina_debit] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[login]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[login](
	[user_name] [nvarchar](50) NOT NULL,
	[password] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_login] PRIMARY KEY CLUSTERED 
(
	[user_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[nakla]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[nakla](
	[nakla_id] [int] IDENTITY(1,1) NOT NULL,
	[nakla_number] [int] NULL,
	[sup_name] [nvarchar](50) NULL,
	[farm_name] [nvarchar](50) NULL,
	[nakla_name] [nvarchar](50) NULL,
	[nakla_weight] [numeric](5, 0) NULL,
	[sobata_number] [numeric](4, 0) NULL,
	[nakla_date] [date] NULL,
	[comission] [decimal](4, 2) NULL,
	[byaaa] [decimal](4, 2) NULL,
	[tanzil] [numeric](4, 0) NULL,
	[wahba] [numeric](4, 0) NULL,
	[nakla_finish] [bit] NULL,
	[nakla_sarf] [bit] NULL,
	[printed] [bit] NULL,
 CONSTRAINT [PK_nakla_1] PRIMARY KEY CLUSTERED 
(
	[nakla_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[nakla_cat]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[nakla_cat](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[sup_name] [nvarchar](50) NULL,
	[farm_name] [nvarchar](50) NULL,
	[nakla_name] [nvarchar](50) NULL,
	[cat_id] [int] NULL,
	[cat_name] [nvarchar](50) NULL,
	[cat_number] [numeric](6, 0) NULL,
	[cat_byaaa] [numeric](18, 0) NULL,
	[cat_byaaa_s] [numeric](18, 0) NULL,
	[pack_id] [int] NULL,
	[pack_rahn] [numeric](18, 0) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[nakla_exps]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[nakla_exps](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nakla_name] [nvarchar](50) NULL,
	[exp_name] [nvarchar](50) NULL,
	[exp_amount] [numeric](18, 0) NULL,
	[exp_date] [date] NULL,
 CONSTRAINT [PK_nakla_exps] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[nakla_nakdia]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[nakla_nakdia](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[sup_name] [nvarchar](50) NULL,
	[farm_name] [nvarchar](50) NULL,
	[nakla_name] [nvarchar](50) NULL,
	[cash_advance] [numeric](18, 0) NULL,
	[dofaat] [numeric](18, 0) NULL,
	[farm_exp] [nvarchar](50) NULL,
	[farm_exp_amount] [numeric](18, 0) NULL,
	[trans_date] [date] NULL,
	[sarf_khazina] [bit] NULL,
	[any_new] [numeric](18, 1) NULL,
 CONSTRAINT [PK_nakla_nakdia] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[owner_sahb]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[owner_sahb](
	[trans_id] [int] IDENTITY(1,1) NOT NULL,
	[owner_name] [nvarchar](50) NULL,
	[owner_credit] [numeric](18, 0) NULL,
	[trans_date] [date] NULL,
 CONSTRAINT [PK_owner_sahb] PRIMARY KEY CLUSTERED 
(
	[trans_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[owners]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[owners](
	[owner_id] [int] IDENTITY(1,1) NOT NULL,
	[owner_name] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_owners] PRIMARY KEY CLUSTERED 
(
	[owner_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[pack_rahn]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pack_rahn](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[pack_name] [nvarchar](50) NULL,
	[pack_rahn] [numeric](18, 0) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[package_discount]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[package_discount](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[sup_name] [nvarchar](50) NULL,
	[package_sup] [nvarchar](50) NULL,
	[discounted] [bit] NULL,
	[nakla_name] [nvarchar](50) NULL,
	[trans_date] [date] NULL,
	[pack_total] [numeric](18, 0) NULL,
	[descrip] [nvarchar](50) NULL,
	[dis_code] [int] NULL,
	[sarf_khazina] [bit] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[package_exp]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[package_exp](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[package_sup] [nvarchar](50) NULL,
	[exp_amount] [numeric](18, 0) NULL,
	[trans_date] [date] NULL,
	[decrip] [nvarchar](50) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[package_exp_name]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[package_exp_name](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[package_exp_name] [nvarchar](50) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[package_spec]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[package_spec](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[sup_name] [nvarchar](50) NULL,
	[package_sup] [nvarchar](50) NULL,
	[nakla_name] [nvarchar](50) NULL,
	[trans_date] [date] NULL,
	[package_exp_name] [nvarchar](50) NULL,
	[pack_num] [numeric](18, 0) NULL,
	[pack_price] [numeric](18, 0) NULL,
	[pack_total] [numeric](18, 0) NULL,
	[dis_code] [int] NULL,
	[vis] [numeric](18, 0) NULL,
	[discount] [nvarchar](15) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[package_sups]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[package_sups](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[package_sup] [nvarchar](50) NULL,
	[sup_adress] [nvarchar](50) NULL,
	[sup_mobile] [nvarchar](20) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[package_unit]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[package_unit](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[package_unit] [nvarchar](10) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[pbcatcol]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pbcatcol](
	[pbc_tnam] [char](129) NOT NULL,
	[pbc_tid] [int] NULL,
	[pbc_ownr] [char](129) NOT NULL,
	[pbc_cnam] [char](129) NOT NULL,
	[pbc_cid] [smallint] NULL,
	[pbc_labl] [varchar](254) NULL,
	[pbc_lpos] [smallint] NULL,
	[pbc_hdr] [varchar](254) NULL,
	[pbc_hpos] [smallint] NULL,
	[pbc_jtfy] [smallint] NULL,
	[pbc_mask] [varchar](31) NULL,
	[pbc_case] [smallint] NULL,
	[pbc_hght] [smallint] NULL,
	[pbc_wdth] [smallint] NULL,
	[pbc_ptrn] [varchar](31) NULL,
	[pbc_bmap] [char](1) NULL,
	[pbc_init] [varchar](254) NULL,
	[pbc_cmnt] [varchar](254) NULL,
	[pbc_edit] [varchar](31) NULL,
	[pbc_tag] [varchar](254) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[pbcatedt]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pbcatedt](
	[pbe_name] [varchar](30) NOT NULL,
	[pbe_edit] [varchar](254) NULL,
	[pbe_type] [smallint] NULL,
	[pbe_cntr] [int] NULL,
	[pbe_seqn] [smallint] NOT NULL,
	[pbe_flag] [int] NULL,
	[pbe_work] [char](32) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[pbcatfmt]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pbcatfmt](
	[pbf_name] [varchar](30) NOT NULL,
	[pbf_frmt] [varchar](254) NULL,
	[pbf_type] [smallint] NULL,
	[pbf_cntr] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[pbcattbl]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pbcattbl](
	[pbt_tnam] [char](129) NOT NULL,
	[pbt_tid] [int] NULL,
	[pbt_ownr] [char](129) NOT NULL,
	[pbd_fhgt] [smallint] NULL,
	[pbd_fwgt] [smallint] NULL,
	[pbd_fitl] [char](1) NULL,
	[pbd_funl] [char](1) NULL,
	[pbd_fchr] [smallint] NULL,
	[pbd_fptc] [smallint] NULL,
	[pbd_ffce] [char](18) NULL,
	[pbh_fhgt] [smallint] NULL,
	[pbh_fwgt] [smallint] NULL,
	[pbh_fitl] [char](1) NULL,
	[pbh_funl] [char](1) NULL,
	[pbh_fchr] [smallint] NULL,
	[pbh_fptc] [smallint] NULL,
	[pbh_ffce] [char](18) NULL,
	[pbl_fhgt] [smallint] NULL,
	[pbl_fwgt] [smallint] NULL,
	[pbl_fitl] [char](1) NULL,
	[pbl_funl] [char](1) NULL,
	[pbl_fchr] [smallint] NULL,
	[pbl_fptc] [smallint] NULL,
	[pbl_ffce] [char](18) NULL,
	[pbt_cmnt] [varchar](254) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[pbcatvld]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pbcatvld](
	[pbv_name] [varchar](30) NOT NULL,
	[pbv_vald] [varchar](254) NULL,
	[pbv_type] [smallint] NULL,
	[pbv_cntr] [int] NULL,
	[pbv_msg] [varchar](254) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[safi_fatora]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[safi_fatora](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nakla_id] [int] NULL,
	[nakla_name] [nvarchar](50) NULL,
	[egmaly] [numeric](18, 0) NULL,
	[comission] [numeric](18, 0) NULL,
	[tanzil] [numeric](18, 0) NULL,
	[wahba] [numeric](18, 0) NULL,
	[nakla_exps] [numeric](18, 0) NULL,
	[cash_advance] [numeric](18, 0) NULL,
	[dofaat] [numeric](18, 0) NULL,
	[farm_exp] [numeric](18, 0) NULL,
	[any_new] [numeric](18, 0) NULL,
	[safi_fatora] [numeric](18, 0) NULL,
	[harsh] [numeric](18, 0) NULL,
	[fatora_add] [numeric](18, 0) NULL,
 CONSTRAINT [PK_safi_fatora] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[safi_fatora_editing]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[safi_fatora_editing](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nakla_id] [int] NULL,
	[nakla_name] [nvarchar](50) NULL,
	[egmaly] [numeric](18, 0) NULL,
	[comission] [numeric](18, 0) NULL,
	[tanzil] [numeric](18, 0) NULL,
	[wahba] [numeric](18, 0) NULL,
	[nakla_exps] [numeric](18, 0) NULL,
	[cash_advance] [numeric](18, 0) NULL,
	[dofaat] [numeric](18, 0) NULL,
	[farm_exp] [numeric](18, 0) NULL,
	[any_new] [numeric](18, 0) NULL,
	[safi_fatora] [numeric](18, 0) NULL,
	[harsh] [numeric](18, 0) NULL,
	[fatora_add] [numeric](18, 0) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[safi_fatora_editing_save]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[safi_fatora_editing_save](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nakla_id] [int] NULL,
	[nakla_name] [nvarchar](50) NULL,
	[egmaly] [numeric](18, 0) NULL,
	[comission] [numeric](18, 0) NULL,
	[tanzil] [numeric](18, 0) NULL,
	[wahba] [numeric](18, 0) NULL,
	[nakla_exps] [numeric](18, 0) NULL,
	[cash_advance] [numeric](18, 0) NULL,
	[dofaat] [numeric](18, 0) NULL,
	[farm_exp] [numeric](18, 0) NULL,
	[any_new] [numeric](18, 0) NULL,
	[safi_fatora] [numeric](18, 0) NULL,
	[harsh] [numeric](18, 0) NULL,
	[fatora_add] [numeric](18, 0) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[sarf_fatora]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[sarf_fatora](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[sup_name] [nvarchar](50) NULL,
	[farm_name] [nvarchar](50) NULL,
	[nakla_id] [int] NULL,
	[nakla_name] [nvarchar](50) NULL,
	[safi_fatora] [numeric](18, 0) NULL,
	[cash_advance] [numeric](18, 0) NULL,
	[dofaat] [numeric](18, 0) NULL,
	[any_new] [numeric](18, 0) NULL,
	[comission] [numeric](18, 0) NULL,
	[tanzil] [numeric](18, 0) NULL,
	[wahba] [numeric](18, 0) NULL,
	[sarf_khazina] [bit] NULL,
	[fatora_date] [date] NULL,
	[bur] [bit] NULL,
	[issue_date] [date] NULL,
	[printed] [bit] NULL,
	[tax] [bit] NULL,
	[fatora_add] [numeric](18, 0) NULL,
	[byaaa] [numeric](18, 0) NULL,
	[price_dif] [numeric](18, 0) NULL,
 CONSTRAINT [PK_sarf_fatora] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[service]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[service](
	[service_id] [int] IDENTITY(1,1) NOT NULL,
	[service_name] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_service] PRIMARY KEY CLUSTERED 
(
	[service_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[service_income]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[service_income](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[service_name] [nvarchar](50) NULL,
	[service_amount] [numeric](18, 0) NULL,
	[trans_date] [date] NULL,
 CONSTRAINT [PK_service_income] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[sup_cashback]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[sup_cashback](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[sup_name] [nvarchar](50) NULL,
	[sup_debit] [numeric](18, 0) NULL,
	[trans_date] [date] NULL,
	[descrip] [nvarchar](50) NULL,
 CONSTRAINT [PK_sup_cashback] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[sup_sahb]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[sup_sahb](
	[sahb_id] [int] IDENTITY(1,1) NOT NULL,
	[sup_name] [nvarchar](50) NULL,
	[sup_credit] [numeric](18, 0) NULL,
	[trans_date] [date] NULL,
	[descrip] [nvarchar](50) NULL,
 CONSTRAINT [PK_sup_sahb] PRIMARY KEY CLUSTERED 
(
	[sahb_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[suppliers]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[suppliers](
	[sup_id] [int] IDENTITY(1,1) NOT NULL,
	[sup_name] [nvarchar](50) NULL,
	[sup_address] [nvarchar](50) NULL,
	[sup_mobile] [nvarchar](50) NULL,
	[hold] [bit] NULL,
	[comission] [numeric](2, 2) NULL,
 CONSTRAINT [PK_suppliers] PRIMARY KEY CLUSTERED 
(
	[sup_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[zemam]    Script Date: 10/10/2026 01:17:50 م ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[zemam](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[nakla_id] [int] NULL,
	[customer_name] [nvarchar](50) NULL,
	[zemam] [numeric](18, 0) NULL,
	[samah] [numeric](18, 0) NULL,
	[tahseel] [numeric](18, 0) NULL,
	[trans_date] [date] NULL,
	[safi_zemam] [numeric](18, 0) NULL,
	[nakla_name] [nvarchar](50) NULL,
	[rahn] [numeric](18, 0) NULL,
	[rahn_pay] [numeric](18, 0) NULL,
	[tota] [numeric](18, 0) NULL,
	[safi_rahn] [numeric](18, 0) NULL,
	[rahn_pay_type] [bit] NULL,
	[customer_code] [int] NULL,
 CONSTRAINT [PK_tahseel] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [pbcatc_x]    Script Date: 10/10/2026 01:17:50 م ******/
CREATE UNIQUE NONCLUSTERED INDEX [pbcatc_x] ON [dbo].[pbcatcol]
(
	[pbc_tnam] ASC,
	[pbc_ownr] ASC,
	[pbc_cnam] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [pbcate_x]    Script Date: 10/10/2026 01:17:50 م ******/
CREATE UNIQUE NONCLUSTERED INDEX [pbcate_x] ON [dbo].[pbcatedt]
(
	[pbe_name] ASC,
	[pbe_seqn] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [pbcatf_x]    Script Date: 10/10/2026 01:17:50 م ******/
CREATE UNIQUE NONCLUSTERED INDEX [pbcatf_x] ON [dbo].[pbcatfmt]
(
	[pbf_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [pbcatt_x]    Script Date: 10/10/2026 01:17:50 م ******/
CREATE UNIQUE NONCLUSTERED INDEX [pbcatt_x] ON [dbo].[pbcattbl]
(
	[pbt_tnam] ASC,
	[pbt_ownr] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [pbcatv_x]    Script Date: 10/10/2026 01:17:50 م ******/
CREATE UNIQUE NONCLUSTERED INDEX [pbcatv_x] ON [dbo].[pbcatvld]
(
	[pbv_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
USE [master]
GO
ALTER DATABASE [fruit67] SET  READ_WRITE 
GO
