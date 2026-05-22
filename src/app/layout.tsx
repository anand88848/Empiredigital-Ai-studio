import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Empiredigital AI Studio',
  description: 'Professional AI-powered video & audio editing studio',
  keywords: ['video editor', 'audio editor', 'AI studio', 'Empiredigital'],
};

export const viewport: Viewport = {
  themeColor: '#0f0f14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-screen-xl px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-surface-border py-4 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Empiredigital AI Studio — Powered by Claude AI
        </footer>
      </body>
    </html>
  );
}
