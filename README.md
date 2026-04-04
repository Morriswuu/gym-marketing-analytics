# 🏋️ Gym Data Automation & Weekly Insight Dashboard

## 📌 Project Overview

本專案透過 **Google Apps Script + BigQuery + Google Sheets + Google Slides** 建立一個完整的數據自動化流程，實現從資料查詢、異常監控到週報產出的端到端分析系統。

核心目標：

* 自動化健身數據的整理與更新
* 建立即時異常預警機制
* 自動生成每週營運洞察報告（Slides）

---

## 🧩 Data Pipeline Architecture

```
BigQuery → Apps Script → Google Sheets → Google Slides / Email Alert
```

### 流程說明：

1. **BigQuery**

   * 儲存原始健身資料（gym table）
   * 建立聚合表 `weekly_summary`

2. **Apps Script**

   * 撈取 BigQuery 數據
   * 寫入 Google Sheets
   * 檢測異常並寄送 Email
   * 自動更新 Slides 報告

3. **Google Sheets**

   * 作為資料中繼與分析介面

4. **Google Slides**

   * 自動產出視覺化週報

---

## 📊 Data Model

### `weekly_summary`（核心分析表）

依 `workout_type` 分群，計算以下指標：

* `member_count`：參與人數
* `avg_frequency_days`：每週運動頻率
* `avg_session_hours`：單次運動時長
* `avg_bpm`：平均心率
* `avg_calories`：平均消耗熱量
* `avg_fat_pct`：平均體脂
* `avg_bmi`：平均 BMI

👉 用於分析：

* 不同運動類型的健康表現
* 使用者參與度差異
* 高效運動模式識別

---

## ⚙️ Core Features

### 1️⃣ BigQuery → Sheets 自動同步

**Function:** `importFromBigQuery()`

功能：

* 從 BigQuery 撈取 `weekly_summary`
* 自動清空並更新 Google Sheets
* 動態建立欄位標題

📌 特點：

* 無需手動匯出資料
* 支援 schema 自動對應

---

### 2️⃣ 異常偵測與 Email 預警

**Function:** `checkAndAlert()`

監控條件：

```sql
avg_calories < 900
```

當偵測到：

* 平均卡路里過低的運動類型
  → 自動寄送 Email 通知

📌 Alert 內容包含：

* 運動類型
* 平均卡路里數值

🎯 商業價值：

* 快速發現低效運動
* 支援營運優化決策（課程設計 / 強度調整）

---

### 3️⃣ 自動生成週報（Google Slides）

**Function:** `generateWeeklySlides()`

功能：

* 從 Sheets 讀取數據
* 計算：

  * 總參與人數
  * 各運動類型表現
  * 最高卡路里運動（Top Group）
* 自動填入 Slides 模板

📌 使用 Placeholder：

```
{{week}}
{{member_count}}
{{hiit_calories}}
{{cardio_calories}}
{{top_group}}
```

📊 自動產出：

* 每週營運摘要
* 關鍵 KPI
* 表現最佳運動類型

---

## 🚀 Key Insights (Example)

* 高卡路里運動類型可快速識別（如 HIIT）
* 不同運動類型在「參與度 vs 健康成效」存在明顯差異
* 當 avg_calories < 900 時，代表：

  * 運動強度不足
  * 或用戶參與品質下降

---

## 🛠️ Tech Stack

* **Data Warehouse:** Google BigQuery
* **Automation:** Google Apps Script
* **Data Layer:** Google Sheets
* **Reporting:** Google Slides
* **Notification:** Gmail API (MailApp)

---

## 📈 Project Highlights

* 全流程自動化（0 手動更新）
* 即時異常監控機制
* 將數據轉換為可行動洞察（Actionable Insights）
* 報表產出時間從「人工整理」→「即時生成」

---

## 🔮 Future Improvements

* 加入趨勢分析（Week-over-Week）
* 視覺化 Dashboard（Looker Studio）
* 異常偵測升級（Z-score / ML anomaly detection）
* 使用者分群（Segmentation）

---

## 👨‍💻 Author

Morris Wu
Data Analytics / Business Intelligence Project

---
