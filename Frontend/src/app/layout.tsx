import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { ThemeProvider, themeInitScript } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Remy Real Estates — Luxury Property Listings in Rwanda',
  description:
    'Find your dream space with verified real estate listings. Search top-tier residential, commercial, and luxury properties with direct realtor communication.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col bg-background text-body antialiased selection:bg-[var(--emerald)] selection:text-white"
        suppressHydrationWarning
      >
        {/* Sets the .dark class on <html> before hydration, so the correct
            theme paints on first frame instead of flashing light then dark. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
