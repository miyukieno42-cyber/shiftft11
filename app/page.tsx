'use client';
import { useEffect, useMemo, useState } from 'react';

type Staff = { id: number; name: string; active: boolean };
type Shift = { work_date: string; staff_id: number; period: 'AM'|'PM'; status: string };
const STATUSES = ['出勤','勤務可能','希望○','希望×','休み','×',''];
const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

export default function Home() {
  const now = new Date();
  const [year,setYear] = useState(now.getFullYear());
  const [month,setMonth] = useState(now.getMonth()+1);
  const [view,setView] = useState<'calendar'|'edit'>('calendar');
  const [logged,setLogged] = useState(false);
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [staff,setStaff] = useState<Staff[]>([]);
  const [shifts,setShifts] = useState<Shift[]>([]);
  const [saving,setSaving] = useState(false);
  const [modal,setModal] = useState<{date:string;staff:Staff;period:'AM'|'PM'}|null>(null);
  const [newName,setNewName] = useState('');

  async function load() {
    const [s1,s2] = await Promise.all([fetch('/api/staff'),fetch(`/api/shifts?year=${year}&month=${month}`)]);
    if (s1.status === 401 || s2.status === 401) { setLogged(false); return; }
    if (!s1.ok || !s2.ok) { setError('データの読み込みに失敗しました'); return; }
    setStaff(await s1.json()); setShifts(await s2.json()); setLogged(true); setError('');
  }
  useEffect(()=>{ if(logged) load(); /* eslint-disable-next-line */ },[year,month]);
  async function login(e:React.FormEvent) { e.preventDefault(); setError(''); const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})}); if(!r.ok){setError((await r.json()).error||'ログインできません');return;} setPassword(''); await load(); }
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});setLogged(false);}
  async function updateShift(date:string,person:Staff,period:'AM'|'PM',status:string){
    setSaving(true); setError('');
    const old=[...shifts];
    setShifts(prev=> status==='' ? prev.filter(x=>!(x.work_date===date && x.staff_id===person.id && x.period===period)) : [...prev.filter(x=>!(x.work_date===date && x.staff_id===person.id && x.period===period)),{work_date:date,staff_id:person.id,period,status}]);
    const r=await fetch('/api/shifts',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({date,staffId:person.id,period,status})});
    if(!r.ok){setShifts(old);setError('保存できませんでした。通信を確認して再度お試しください。');}
    setSaving(false);setModal(null);
  }
  async function addStaff(e:React.FormEvent){e.preventDefault();const r=await fetch('/api/staff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:newName})});if(r.ok){setNewName('');await load();}else setError('スタッフを追加できませんでした');}
  async function removeStaff(person:Staff){if(!window.confirm(`${person.name}さんをスタッフ一覧から非表示にしますか？\n過去のシフト記録は残ります。`))return;const r=await fetch('/api/staff',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:person.id})});if(r.ok){await load();}else setError('スタッフを削除できませんでした');}
  function jumpMonth(value:string){if(!value)return;const [y,m]=value.split('-').map(Number);setYear(y);setMonth(m);}
  const activeStaff=staff.filter(s=>s.active);
  const shiftMap=useMemo(()=>new Map(shifts.map(s=>[`${s.work_date}|${s.staff_id}|${s.period}`,s.status])),[shifts]);
  const days=Array.from({length:new Date(year,month,0).getDate()},(_,i)=>new Date(year,month-1,i+1));
  const calendarStart=new Date(year,month-1,1); const offset=(calendarStart.getDay()+6)%7;
  const cells=[...Array(offset).fill(null),...days]; while(cells.length%7) cells.push(null);
  const getNames=(date:Date,period:'AM'|'PM')=>staff.filter(p=>shiftMap.get(`${fmt(date)}|${p.id}|${period}`)==='出勤');
  const prev=()=>{const d=new Date(year,month-2,1);setYear(d.getFullYear());setMonth(d.getMonth()+1)};
  const next=()=>{const d=new Date(year,month,1);setYear(d.getFullYear());setMonth(d.getMonth()+1)};

  if(!logged) return <main className="login"><form className="loginCard" onSubmit={login}><div className="logo">SHIFT <span>MANAGER</span></div><h1>シフト管理</h1><p>管理者ログイン</p><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="管理者パスワード" autoComplete="current-password"/><button className="primary">ログイン</button>{error&&<p className="error">{error}</p>}</form></main>;

  return <main className="appShell">
    <header className="topbar"><div><div className="logo">SHIFT <span>MANAGER</span></div><div className="sub">管理者用シフト管理</div></div><button className="quiet" onClick={logout}>ログアウト</button></header>
    <section className="toolbar"><div className="monthNav"><button onClick={prev}>‹</button><strong>{year}年 {month}月</strong><button onClick={next}>›</button><input aria-label="表示する年月" type="month" value={`${year}-${String(month).padStart(2,'0')}`} onChange={e=>jumpMonth(e.target.value)}/></div><div className="tabs"><button className={view==='calendar'?'active':''} onClick={()=>setView('calendar')}>カレンダー</button><button className={view==='edit'?'active':''} onClick={()=>setView('edit')}>シフト編集</button></div></section>
    <div className="statusline"><span>{saving?'● 保存中…':'● 保存済み'}</span><span>{activeStaff.length}名のスタッフ</span></div>
    {error&&<div className="errorBanner">{error}</div>}
    {view==='calendar' ? <section className="calendar"><div className="weekdays">{['月','火','水','木','金','土','日'].map((d,i)=><div key={d} className={i===6?'sun':i===5?'sat':''}>{d}</div>)}</div><div className="calendarGrid">{cells.map((date,i)=><div key={i} className={`dayCell ${date?'':'empty'} ${date&&fmt(date)===fmt(new Date())?'today':''}`}>
      {date&&<><div className="dayNum">{date.getDate()}<small>{['日','月','火','水','木','金','土'][date.getDay()]}</small></div><div className="peopleBlock"><b>AM</b>{getNames(date,'AM').map(p=><span key={p.id}>{p.name}</span>)}</div><div className="peopleBlock pm"><b>PM</b>{getNames(date,'PM').map(p=><span key={p.id}>{p.name}</span>)}</div></>}
    </div>)}</div></section> : <section className="editArea"><div className="hint">マスをタップして勤務区分を選択。変更内容は自動保存されます。</div><div className="tableWrap"><table className="shiftTable"><thead><tr><th className="nameCol">スタッフ</th>{days.map(d=><th key={fmt(d)} colSpan={2}>{d.getDate()}<small>{['日','月','火','水','木','金','土'][d.getDay()]}</small></th>)}<th>出勤<br/>回数</th></tr><tr><th className="nameCol"></th>{days.map(d=><th key={fmt(d)+'am'}>AM</th>).flatMap((x,i)=>[x,<th key={fmt(days[i])+'pm'}>PM</th>])}<th></th></tr></thead><tbody>{activeStaff.map(person=><tr key={person.id}><th className="nameCol">{person.name}</th>{days.map(date=>(['AM','PM'] as const).map(period=>{const status=shiftMap.get(`${fmt(date)}|${person.id}|${period}`)||'';return <td key={fmt(date)+period}><button className={`cell status-${status.replace(/[^\w]/g,'')}`} onClick={()=>setModal({date:fmt(date),staff:person,period})}>{status||'＋'}</button></td>}))}<td className="count">{shifts.filter(s=>s.staff_id===person.id&&s.status==='出勤').length}</td></tr>)}</tbody></table></div><div className="staffManager"><h3>スタッフ管理</h3><form className="addStaff" onSubmit={addStaff}><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="新しいスタッフ名"/><button>追加</button></form><div className="staffList">{activeStaff.map(person=><div className="staffRow" key={person.id}><span>{person.name}</span><button type="button" className="quiet" onClick={()=>removeStaff(person)}>削除</button></div>)}</div><small>削除したスタッフの過去のシフト記録は保持されます。</small></div></section>}
    {modal&&<div className="modalBackdrop" onClick={()=>setModal(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setModal(null)}>×</button><h2>{modal.staff.name}</h2><p>{modal.date}・{modal.period}</p><div className="statusChoices">{STATUSES.map(status=><button key={status||'clear'} className={status===''?'clearChoice':''} onClick={()=>updateShift(modal.date,modal.staff,modal.period,status)}>{status||'入力をクリア'}</button>)}</div></div></div>}
    <footer>シフト情報はデータベースに保存されます。ページを閉じても内容は残ります。</footer>
  </main>;
}
