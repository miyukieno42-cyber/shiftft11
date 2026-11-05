CREATE TABLE IF NOT EXISTS staff (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS shifts (
  id BIGSERIAL PRIMARY KEY,
  work_date DATE NOT NULL,
  staff_id BIGINT NOT NULL REFERENCES staff(id),
  period TEXT NOT NULL CHECK (period IN ('AM', 'PM')),
  status TEXT NOT NULL CHECK (status IN ('出勤', '勤務可能', '希望○', '希望×', '休み', '×')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (work_date, staff_id, period)
);
INSERT INTO staff (name, sort_order)
SELECT v.name, v.ord FROM (VALUES
 ('葉山さん',1),('かじさん',2),('足立さん',3),('白井さん',4),('山田さん',5),('ゆいちゃん',6),('ふうかちゃん',7),('あやかちゃん',8),('かりんちゃん',9),('大羽さん',10),('河合さん',11),('👨白井くん',12),('なべさん',13)
) AS v(name,ord)
WHERE NOT EXISTS (SELECT 1 FROM staff);
