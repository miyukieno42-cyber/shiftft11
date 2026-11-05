import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'ログインしてください' }, { status: 401 });
  const rows = await sql`SELECT id::int AS id, name, active FROM staff ORDER BY sort_order, id`;
  return NextResponse.json(rows);
}
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'ログインしてください' }, { status: 401 });
  const { name } = await request.json();
  if (typeof name !== 'string' || !name.trim() || name.length > 40) return NextResponse.json({ error: 'スタッフ名を入力してください' }, { status: 400 });
  const rows = await sql`INSERT INTO staff (name) VALUES (${name.trim()}) RETURNING id::int AS id, name, active`;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'ログインしてください' }, { status: 401 });
  const { id } = await request.json();
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) return NextResponse.json({ error: 'スタッフIDが不正です' }, { status: 400 });
  // 履歴を残すため、レコード自体は削除せず非表示にする
  const rows = await sql`UPDATE staff SET active = FALSE WHERE id = ${Number(id)} RETURNING id::int AS id, name, active`;
  if (!rows.length) return NextResponse.json({ error: 'スタッフが見つかりません' }, { status: 404 });
  return NextResponse.json({ ok: true, staff: rows[0] });
}
