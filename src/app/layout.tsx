import SplashIntro from '@/components/SplashIntro';
import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import CartProvider from '@/components/CartProvider';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const siteUrl = new URL('https://billi-boba-nails.vercel.app');

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: 'BILLi&BoBA NAILS',
  title: {
    default: 'BILLi&BoBA NAILS | Handmade Press-On Nails',
    template: '%s | BILLi&BoBA NAILS',
  },
  description:
    'Shop handmade press-on nail sets fitted using guided hand photos. Browse studio designs, upload fit photos, pay securely and track your order.',
  keywords: [
    'BILLi&BoBA NAILS',
    'press-on nails',
    'handmade press-on nails',
    'custom press-on nails',
    'photo fitted nails',
    'nail studio India',
  ],
  authors: [{ name: 'BILLi&BoBA NAILS' }],
  creator: 'BILLi&BoBA NAILS',
  publisher: 'BILLi&BoBA NAILS',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BILLi&BoBA NAILS | Handmade Press-On Nails',
    description:
      'Handmade press-on nail sets fitted using guided hand photos. Browse, upload photos, checkout and track your order.',
    url: '/',
    siteName: 'BILLi&BoBA NAILS',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BILLi&BoBA NAILS | Handmade Press-On Nails',
    description:
      'Handmade press-on nail sets fitted using guided hand photos. Browse, upload photos, checkout and track your order.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SplashIntro />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}