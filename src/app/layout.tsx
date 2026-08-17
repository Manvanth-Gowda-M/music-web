import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ಸ್ವರ ಲೋಕ • Kannada Ambient Music Worlds',
  description:
    'An immersive digital listening environment centered around Kannada ambient music, 4K environmental themes, and a living Web Audio visualizer.',
  keywords: [
    'Kannada Music',
    'Ambient Kannada',
    'Swara Loka',
    'Konkan Train',
    'Temple Dawn',
    'Coastal Morning',
    'KSRTC Rain',
    'Kannada Classical',
  ],
  authors: [{ name: 'Swara Loka Studio' }],
};

export const viewport: Viewport = {
  width: 1100,
  initialScale: 0.4,
  userScalable: true,
  themeColor: '#030712',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kn" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Dynamic Desktop Mode Auto-Scaler Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setDesktopViewport() {
                  var targetWidth = 1100;
                  var screenWidth = window.screen.width || window.innerWidth;
                  var scale = screenWidth < targetWidth ? (screenWidth / targetWidth) : 1;
                  var meta = document.querySelector('meta[name="viewport"]');
                  if (!meta) {
                    meta = document.createElement('meta');
                    meta.name = 'viewport';
                    document.head.appendChild(meta);
                  }
                  meta.content = 'width=' + targetWidth + ', initial-scale=' + scale + ', minimum-scale=' + (scale * 0.5) + ', maximum-scale=2.0, user-scalable=yes';
                }
                setDesktopViewport();
                window.addEventListener('resize', setDesktopViewport);
                window.addEventListener('orientationchange', function() {
                  setTimeout(setDesktopViewport, 150);
                });
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-black text-slate-100 antialiased overflow-hidden selection:bg-blue-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
