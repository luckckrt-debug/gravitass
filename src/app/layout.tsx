import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'GRAVITASS — Independent Work Protocol',
  description: 'We are the gravity that connects talent with opportunity. An immersive talent network connecting elite engineers, designers, researchers, and creators.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#071011] text-[#F4F5F3] min-h-screen flex flex-col selection:bg-[#73D8C4] selection:text-[#020303] antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
