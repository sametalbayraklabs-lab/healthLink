import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import HeartbeatProvider from './shared/HeartbeatProvider';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DengedeKal — Sağlıklı Yaşamın Dijital Adresi',
  description: 'Diyetisyen, psikolog ve spor koçu gibi sertifikalı uzmanlarla online görüşerek sağlıklı yaşam yolculuğunuza başlayın.',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={inter.className}
        suppressHydrationWarning
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0 }}
      >
        <Providers>
          <HeartbeatProvider />
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
