import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBaseUrl } from '@/lib/content';

export const metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'Sunwings Transport | Moving, Delivery & Commercial Transport',
    template: '%s | Sunwings Transport',
  },
  description: 'Residential moving, furniture delivery, commercial transport, warehouse support and general labour across Toronto, the GTA, Hamilton and Niagara.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
