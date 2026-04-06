# gym-marketing-analytics

> 以 Google 工具生態系為核心的自動化健身會員行銷分析練習專案
> 從資料儲存、自動化報表、異常預警到深度分析的雙軌流程

---

> **哪一類健身會員最值得行銷投資？**

---

## 資料來源

| 項目 | 內容 |
|------|------|
| 資料集 | Gym Members Exercise Dataset |
| 來源 | Kaggle — valakhorasani（2024） |
| 筆數 | 973 筆 |
| 連結 | https://www.kaggle.com/datasets/valakhorasani/gym-members-exercise-dataset |

### 主要欄位

| 欄位 | 說明 |
|------|------|
| `workout_type` | 運動類型（Cardio / HIIT / Strength / Yoga） |
| `experience_level` | 經驗等級（1 初階 / 2 中階 / 3 高階） |
| `age` / `gender` | 人口屬性 |
| `workout_frequency_days` | 每週運動天數 |
| `session_duration_hours` | 每次運動時長 |
| `avg_bpm` | 平均心率（運動強度代理指標） |
| `calories_burned` | 每次消耗卡路里 |
| `fat_percentage` | 體脂率 |
| `bmi` | 身體質量指數 |

---

## 工具架構

### 整體流程

```
Kaggle 資料集
     ↓
BigQuery（raw_members + weekly_summary Scheduled Query）
     ↓                        ↓
Google Sheets            Looker Studio
（Apps Script 自動拉取）    （Dashboard 視覺化）
     ↓                        
Google Slides            Apps Script 自動預警
（週報自動生成）           → Gmail 寄送異常通知
                                ↓（預警觸發）
                          Antigravity
                    （Python + SQL 深度分析）
                                ↓
                          GitHub（版本控制）
                                ↓
                       Tableau Public（整合報告）
```

### 各工具角色說明

**BigQuery — 資料倉庫與重運算**
- 存放原始資料表 `raw_members`
- Scheduled Query 每週一 08:00 自動執行，產出 `weekly_summary`
- `weekly_summary` 彙整四個 workout_type 的平均卡路里、BMI、體脂、頻率、時長、人數

**Google Sheets — 輕度加工與呈現**
- Apps Script 自動從 BigQuery 拉取 `weekly_summary`
- 計算週環比（本週 vs 上週變化 %）
- 作為 Slides 週報自動填入的資料來源

**Apps Script 自動預警 → Gmail**
- 每日定時執行 `checkAndAlert()`
- 查詢 BigQuery，篩出 `avg_calories < 900` 的族群
- 自動發送 Email 預警通知，無需人工盤查
- 本專案觸發條件：Cardio avg_calories = 885（低於閾值 900）

**Looker Studio — 視覺化 Dashboard**
- 連接 BigQuery `weekly_summary`
- 呈現各族群平均卡路里長條圖、會員人數分布、綜合指標表格

**Google Slides — 例行週報**
- Apps Script 自動填入指標數字與日期
- 函式 `generateWeeklySlides()` 替換佔位符並寫入當週數據

**Antigravity — 深度分析（預警觸發後啟動）**
- 連接 BigQuery MCP Server
- 生成深層 SQL 查詢，按 `experience_level` × `gender` 交叉分析 Cardio 族群
- 生成 Python 統計分析腳本
- 產出根因說明與行銷建議結論

**GitHub — 版本控制**
- 管理所有 SQL、Python、Apps Script 腳本
- README 記錄分析脈絡與每週決策

**Tableau Public — 最終整合報告**
- 整合三個視覺化工作表：各族群平均卡路里、會員人數分布、綜合指標
- 加入預警閾值參考線（900 kcal）

---

## 分析框架（4Q Thinking）

### Q1 — What do I want to know?
哪一類健身會員最值得行銷投資？

拆解為三個子問題：
1. 不同運動類型的會員，健康表現有什麼差異？
2. 哪些族群的運動參與度最高（頻率、時長、強度）？
3. 經驗等級和年齡層如何影響運動行為？

### Q2 — Why do I want to know?
行銷資源有限，若能找出「高參與度 × 高健康意識」的族群，就能把預算集中在最可能轉換、最可能留存的人身上。運動頻率、強度、經驗等級可作為消費意願的代理指標。

### Q3 — So What?（策略方向）

| 族群 | 策略 |
|------|------|
| 高強度高頻率（HIIT + Strength） | 主打進階產品與會員升級方案 |
| 低頻率初階（Experience Level 1） | 入門引導與習慣養成內容，降低流失 |
| 中間族群（Cardio、Yoga） | 測試不同訊息，提升運動頻率 |

### Q4 — Why so?（5 Whys）
1. 頻率高 → 習慣已養成，黏著度高
2. 黏著度高 → 留存成本低，LTV 更長
3. LTV 長 → 值得用更高 CPA 獲取或維持
4. 沒有分群 → 所有人被當成一樣對待
5. 沒有分析 → 資料尚未被系統性整理

---

## 核心指標定義

| 類別 | 欄位 | 用途 |
|------|------|------|
| 參與度 | `workout_frequency_days`、`session_duration_hours`、`avg_bpm` | 衡量投入程度與強度 |
| 健康表現 | `calories_burned`、`fat_percentage`、`bmi` | 衡量運動成效 |
| 受眾分群 | `workout_type`、`experience_level`、`age`、`gender` | 定義行銷受眾 |
| 核心族群 | 頻率 ≥ 4天 × avg_bpm 上四分位 × level 2–3 | 最值得投資的受眾 |

### 預警閾值設定

| 指標 | 閾值 | 觸發條件 |
|------|------|----------|
| `avg_calories` | 900 kcal | 低於此值自動發送 Email 預警 |

---

## 分析結論

### 週報數據（weekly_summary）

| Workout Type | Avg Calories | Avg BMI | Avg Fat % | Avg Frequency | Member Count |
|---|---|---|---|---|---|
| HIIT | 926 | 25.2 | 24.5 | 3.3 | 221 |
| Strength | 911 | 24.5 | 25.5 | 3.4 | 258 |
| Yoga | 903 | 24.5 | 24.5 | 3.4 | 239 |
| Cardio | 885 ⚠️ | 25.4 | 25.4 | 3.2 | 255 |

### 深度分析結論（Antigravity 觸發）

**觸發條件：** Cardio avg_calories = 885，低於警戒值 900

**根因：** 超過 60% 的有氧運動者為初學者與中階女性，卡路里消耗偏低，代表「缺乏動力」或「已進入撞牆期」

**行銷建議：**
1. **Level 1 初學者** → 遊戲化活動（Cardio 破冰挑戰賽），以 App 點數鼓勵達成「單次 800 大卡」
2. **Level 2 女性** → 專業進階課程（HIIT 燃脂飛輪 / 進階有氧教練諮詢），距警戒值僅差 30 大卡，潛力大
3. **即時 App 提醒機制** → 卡路里接近 800–850 時推播鼓勵通知

---

## 專案結構

```
gym-marketing-analytics/
├── sql/
│   ├── weekly_summary.sql          # BigQuery 週報彙整查詢
│   └── cardio_deep_analysis.sql    # Cardio 族群深層交叉分析
├── python/
│   └── cardio_analysis.py          # Antigravity 產出的統計分析腳本
└── scripts/
    └── weekly_automation.gs        # Apps Script（BQ 拉取 / 預警 / Slides）
```

---

## 專案計畫

| 週次 | 重點 | 完成項目 |
|------|------|----------|
| Week 1 | 地基建立 | BigQuery 建表、Scheduled Query、GitHub 初始化、Sheets 串接 |
| Week 2 | 報表自動化 | Looker Studio Dashboard、Gmail 自動預警、Slides 週報、流程驗證 |
| Week 3 | 深度分析 + 輸出 | Antigravity MCP 分析、Tableau 整合報告、README 完善 |

---

## 發布資訊

| 項目 | 內容 |
|------|------|
| 專案完成日期 | 2026-04-06 |
| 資料範圍 | 973 筆健身會員運動記錄 |
| 預警閾值 | avg_calories < 900 kcal |
| 預警機制 | Apps Script → Gmail 自動通知 |
| 分析工具 | BigQuery · Sheets · Looker Studio · Slides · Antigravity · Tableau · GitHub |
