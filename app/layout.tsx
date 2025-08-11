import type { Metadata } from 'next';
import './globals.css';
import { AdaptiveAIProvider } from '@/lib/context/adaptive-ai-context';

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
      <body className="antialiased">
        <AdaptiveAIProvider>
          {children}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Global error handler to prevent unhandled promise rejections
                window.addEventListener('unhandledrejection', function(event) {
                  console.warn('Unhandled promise rejection:', event.reason);
                  event.preventDefault();
                });
                
                // Global error handler for other errors
                window.addEventListener('error', function(event) {
                  console.warn('Global error caught:', event.error);
                  event.preventDefault();
                });
              `,
            }}
          />
        </AdaptiveAIProvider>
      </body>
    </html>
  );
}
