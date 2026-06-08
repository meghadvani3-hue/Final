import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Companion.io — Premium Emotional Companionship Marketplace',
  description: 'Hire verified emotional support companions, active listeners, virtual best friends, and vent partners. Book by the hour, day, or month.',
  keywords: 'emotional support, listeners, mental health, virtual best friend, companion, vent partner, online companion',
  authors: [{ name: 'Companion.io Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full dark`}>
      <body className="min-h-full bg-black text-white antialiased flex flex-col font-sans">
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#05050f',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                fontSize: '14px',
                borderRadius: '12px'
              },
              success: {
                iconTheme: {
                  primary: '#7C3AED',
                  secondary: '#ffffff',
                },
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
