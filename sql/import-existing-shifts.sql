-- Excel「シフト」「12月シフト」に入力済みの値を取り込むSQLです。
-- schema.sql 実行後に1回だけ実行してください。
INSERT INTO shifts (work_date, staff_id, period, status)
VALUES
  ('2026-11-01', (SELECT id FROM staff WHERE name = '白井さん' LIMIT 1), 'AM', '希望○'),
  ('2026-11-02', (SELECT id FROM staff WHERE name = '白井さん' LIMIT 1), 'AM', '希望○'),
  ('2026-11-08', (SELECT id FROM staff WHERE name = '白井さん' LIMIT 1), 'AM', '希望×'),
  ('2026-11-08', (SELECT id FROM staff WHERE name = '白井さん' LIMIT 1), 'PM', '出勤'),
  ('2026-11-01', (SELECT id FROM staff WHERE name = '葉山さん' LIMIT 1), 'AM', '希望○'),
  ('2026-11-01', (SELECT id FROM staff WHERE name = '葉山さん' LIMIT 1), 'PM', '希望○'),
  ('2026-11-02', (SELECT id FROM staff WHERE name = '葉山さん' LIMIT 1), 'AM', '希望○'),
  ('2026-11-08', (SELECT id FROM staff WHERE name = '葉山さん' LIMIT 1), 'PM', '希望○'),
  ('2026-11-01', (SELECT id FROM staff WHERE name = 'ゆいちゃん' LIMIT 1), 'AM', '希望○'),
  ('2026-11-01', (SELECT id FROM staff WHERE name = 'ゆいちゃん' LIMIT 1), 'PM', '出勤'),
  ('2026-11-02', (SELECT id FROM staff WHERE name = 'ゆいちゃん' LIMIT 1), 'AM', '出勤'),
  ('2026-11-01', (SELECT id FROM staff WHERE name = 'かじさん' LIMIT 1), 'AM', '希望○'),
  ('2026-11-01', (SELECT id FROM staff WHERE name = 'かじさん' LIMIT 1), 'PM', '×'),
  ('2026-11-02', (SELECT id FROM staff WHERE name = 'かじさん' LIMIT 1), 'AM', '希望○'),
  ('2026-11-02', (SELECT id FROM staff WHERE name = 'かじさん' LIMIT 1), 'PM', '出勤'),
  ('2026-11-01', (SELECT id FROM staff WHERE name = '山田さん' LIMIT 1), 'AM', '希望×'),
  ('2026-11-01', (SELECT id FROM staff WHERE name = '山田さん' LIMIT 1), 'PM', '出勤'),
  ('2026-11-02', (SELECT id FROM staff WHERE name = '山田さん' LIMIT 1), 'AM', '希望×'),
  ('2026-11-01', (SELECT id FROM staff WHERE name = 'ふうかちゃん' LIMIT 1), 'AM', '希望×'),
  ('2026-11-02', (SELECT id FROM staff WHERE name = 'ふうかちゃん' LIMIT 1), 'AM', '希望×'),
  ('2026-12-08', (SELECT id FROM staff WHERE name = '白井さん' LIMIT 1), 'AM', '希望×'),
  ('2026-12-08', (SELECT id FROM staff WHERE name = '白井さん' LIMIT 1), 'PM', '出勤'),
  ('2026-12-08', (SELECT id FROM staff WHERE name = '葉山さん' LIMIT 1), 'PM', '希望○')
ON CONFLICT (work_date, staff_id, period) DO UPDATE SET status = EXCLUDED.status, updated_at = now();
