import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rock Paper Scissors AI',
  description: 'Play Rock Paper Scissors against an AI with multiple difficulty levels',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text y="32" font-size="32">🪨</text></svg>',
  },
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
