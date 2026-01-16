'use client';
import Script from 'next/script';
import './globals.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { AuthProvider } from '@/context/AuthContext';
import { ChatProvider } from '@/context/ChatContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define which pages should NOT have the global Navbar and Footer
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  // Also hide navbar/footer in full-screen chat
  const isChatPage = pathname?.startsWith('/messages/') && pathname.split('/').length > 2;

  return (
    <html lang="en">
      <head>
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
          rel="stylesheet" 
          integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" 
          crossOrigin="anonymous"
        />
      </head>
      <body className={isAuthPage ? 'auth-layout' : ''}>
        <AuthProvider>
          <ChatProvider>
            {!isAuthPage && !isChatPage && <Navbar />}
            {children}
            {!isAuthPage && !isChatPage && <Footer />}
          </ChatProvider>
        </AuthProvider>
        
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}