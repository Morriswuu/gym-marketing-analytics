"""
Cardio Workout Analysis Script
此腳本整合了 SQL 查詢與後續的資料處理、統計分析以及繪圖視覺化功能。

【資料取得 SQL】
在 BigQuery 執行以下 SQL 來撈取原始資料：
```sql
SELECT 
    Experience_Level, 
    Gender, 
    COUNT(*) as user_count,
    AVG(Calories_Burned) as avg_calories_burned
FROM `gym-project-491908.gymmember.gym`
WHERE Workout_Type = 'Cardio'
GROUP BY Experience_Level, Gender
ORDER BY avg_calories_burned ASC
```
"""

import matplotlib.pyplot as plt
import pandas as pd

def main():
    # 1. 載入自 SQL 查詢的結果資料
    data = [
        {"Group": "L1 Female", "Experience_Level": 1, "Gender": "Female", "User_Count": 59, "Avg_Calories": 683.5},
        {"Group": "L1 Male", "Experience_Level": 1, "Gender": "Male", "User_Count": 50, "Avg_Calories": 732.7},
        {"Group": "L2 Female", "Experience_Level": 2, "Gender": "Female", "User_Count": 45, "Avg_Calories": 867.6},
        {"Group": "L2 Male", "Experience_Level": 2, "Gender": "Male", "User_Count": 57, "Avg_Calories": 978.7},
        {"Group": "L3 Female", "Experience_Level": 3, "Gender": "Female", "User_Count": 22, "Avg_Calories": 1173.4},
        {"Group": "L3 Male", "Experience_Level": 3, "Gender": "Male", "User_Count": 22, "Avg_Calories": 1270.2}
    ]

    df = pd.DataFrame(data)

    # 2. 終端機基本數據量化輸出
    print("=== Cardio 子族群卡路里數據 ===")
    print(df[['Group', 'User_Count', 'Avg_Calories']].to_string(index=False))

    sub_900_group = df[df['Avg_Calories'] < 885]
    sub_900_users = sub_900_group['User_Count'].sum()
    total_users = df['User_Count'].sum()
    sub_900_ratio = sub_900_users / total_users * 100

    print("\n=== 低於警戒線 (885大卡) 之群體分析 ===")
    for index, row in sub_900_group.iterrows():
        pct = (row['Avg_Calories'] / 885) * 100
        print(f"- {row['Group']} (人數: {row['User_Count']}) - 平均: {row['Avg_Calories']} 大卡 (達標率 {pct:.1f}%)")

    print(f"\n=> 這些群體共有 {sub_900_users} 人，佔整個 Cardio 群體的 {sub_900_ratio:.1f}%。")

    # 3. 繪製視覺化圖表 (.jpg)
    plt.figure(figsize=(10, 6))

    # 根據是否達標設定顏色 (885 大卡以下為紅色，以上為綠色)
    colors = ['#e74c3c' if cal < 885 else '#2ecc71' for cal in df['Avg_Calories']]

    # 繪製散佈圖
    plt.scatter(df['User_Count'], df['Avg_Calories'], s=200, c=colors, alpha=0.7, edgecolors='black')

    # 標註警戒線
    plt.axhline(y=885, color='#e67e22', linestyle='--', label='Warning Level (885 kcal)')

    # 對每個數據點添加文字標籤
    for i, row in df.iterrows():
        plt.text(row['User_Count'] + 0.8, row['Avg_Calories'] - 10, row['Group'], 
                 fontsize=11, weight='bold', alpha=0.8)

    # 添加標題與軸標籤
    plt.title('Cardio User Count vs. Avg Calories Burned (by Level/Gender)', fontsize=14, pad=15)
    plt.xlabel('User Count (Number of People)', fontsize=12)
    plt.ylabel('Average Calories Burned (kcal)', fontsize=12)
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.legend()

    # 儲存圖片
    output_path = 'cardio_analysis_chart.jpg'
    plt.savefig(output_path, dpi=300, bbox_inches='tight', format='jpg')
    print(f"\n圖表已成功輸出儲存為: {output_path}")

if __name__ == "__main__":
    main()
