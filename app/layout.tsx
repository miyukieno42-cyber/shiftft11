import './globals.css';
export const metadata = { title: 'シフト管理', description: '管理者用シフト管理サイト' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body>{children}</body></html>;
}
