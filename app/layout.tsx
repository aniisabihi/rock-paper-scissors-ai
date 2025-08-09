import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rock Paper Scissors AI',
  description:
    'Play Rock Paper Scissors against an AI with multiple difficulty levels',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
