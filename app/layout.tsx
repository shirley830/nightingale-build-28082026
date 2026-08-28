import type { Metadata } from 'next';
import './globals.css';
import PwaRegister from './PwaRegister';

export const metadata: Metadata = {
  title: 'Nightingale Care Note',
  description: 'A safe, longitudinal shared care note for clinical teams.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Nightingale Care Note',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><PwaRegister />{children}</body>
    </html>
  );
}
