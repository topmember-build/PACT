import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ParticleCanvas from '../components/ui/ParticleCanvas';
import ToastContainer from '../components/ui/Toast';
import AIPactAssistant from '../components/ui/AIPactAssistant';
import { WalletProvider } from '../context/WalletContext';
import { ToastProvider } from '../context/ToastContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { ThemeProvider } from 'next-themes';
import { ReownProvider } from '../context/ReownProvider';
import { TranslationProvider } from '../context/TranslationContext';

export const metadata: Metadata = {
  title: 'Pact - Make Promises Your Future Self Can\'t Break',
  description: 'Pact transforms discipline into programmable commitments enforced onchain. Create immutable promises, assign trusted guardians, and hold yourself accountable - forever.',
  keywords: ['commitment', 'discipline', 'blockchain', 'Monad', 'smart contracts', 'accountability'],
  openGraph: {
    title: 'Pact',
    description: 'Make promises your future self can\'t break.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-white min-h-screen antialiased relative transition-colors duration-300">
        <TranslationProvider>
          <ReownProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              <PreferencesProvider>
                <ParticleCanvas />
                <WalletProvider>
                  <ToastProvider>
                    <Navbar />
                    <main className="pt-16">
                      {children}
                    </main>
                    <Footer />
                    <ToastContainer />
                    <AIPactAssistant />
                  </ToastProvider>
                </WalletProvider>
              </PreferencesProvider>
            </ThemeProvider>
          </ReownProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
