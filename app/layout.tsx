import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rock Paper Scissors AI | Adaptive Learning Game',
  description:
    'Challenge an AI that learns your patterns! Play Rock Paper Scissors with adaptive neural network learning across three difficulty levels.',
  keywords: ['rock paper scissors', 'AI game', 'machine learning', 'adaptive AI', 'neural network'],
  authors: [{ name: 'AI Game Developer' }],
  robots: 'index, follow',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text y="32" font-size="32">🪨</text></svg>',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js" async></script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
