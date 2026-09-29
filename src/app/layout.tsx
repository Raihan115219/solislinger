import type { Metadata, Viewport } from 'next';
import { Cinzel, Rye } from 'next/font/google';
import { SolanaProvider } from '@/components/wallet/SolanaProvider';
import './globals.css';

const display = Rye({ subsets: ['latin'], weight: '400', variable: '--font-display', display: 'swap' });
const body = Cinzel({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: 'Solslinger — The Bloody Raven',
  description: 'Step into the Bloody Raven saloon, the hub of Solslinger.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0705',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
