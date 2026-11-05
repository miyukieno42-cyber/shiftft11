import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'ログインしてください' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get('year'));
  const month = Number(searchParams.get('month'));
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return NextResponse.json({ error: '年月が不正です' }, { status: 400 });
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const rows = await sql`SELECT work_date::text AS work_date, staff_id::int AS staff_id, period, status FROM shifts WHERE work_date >= ${start}::date AND work_date < (${start}::date + interval '1 month') ORDER BY work_date, staff_id, period`;
  return NextResponse.json(rows);
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'ログインしてください' }, { status: 401 });
  const body = await request.json();
  const { date, staffId, period, status } = body;
  const allowed = ['出勤', '勤務可能', '希望○', '希望×', '休み', '×', ''];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !Number.isInteger(Number(staffId)) || !['AM', 'PM'].includes(period) || !allowed.includes(status)) {
    return NextResponse.json({ error: '入力内容が不正です' }, { status: 400 });
  }
  if (status === '') {
    await sql`DELETE FROM shifts WHERE work_date = ${date}::date AND staff_id = ${Number(staffId)} AND period = ${period}`;
  } else {
    await sql`INSERT INTO shifts (work_date, staff_id, period, status) VALUES (${date}::date, ${Number(staffId)}, ${period}, ${status}) ON CONFLICT (work_date, staff_id, period) DO UPDATE SET status = EXCLUDED.status, updated_at = now()`;
  }
  return NextResponse.json({ ok: true });
}
