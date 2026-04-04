-- weekly_summary
-- 按 workout_type 分群：參與度 + 健康表現
SELECT
  workout_type,
  COUNT(*) AS member_count,
  ROUND(AVG(`Workout_Frequency _days_week_`), 1) AS avg_frequency_days,
  ROUND(AVG(`Session_Duration _hours_`), 2) AS avg_session_hours,
  ROUND(AVG(avg_bpm), 0) AS avg_bpm,
  ROUND(AVG(calories_burned), 0) AS avg_calories,
  ROUND(AVG(fat_percentage), 1) AS avg_fat_pct,
  ROUND(AVG(bmi), 1) AS avg_bmi
FROM `gym-project-491908.gymmember.gym`
GROUP BY workout_type
ORDER BY avg_calories DESC
