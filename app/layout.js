import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBaseUrl, getSiteSettings } from '@/lib/content';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const baseUrl = getBaseUrl();
  const title = settings.seo_title || 'Sunwings Transport | Moving, Delivery & Commercial Transport';
  const description = settings.seo_description || 'Residential moving, furniture delivery, commercial transport, warehouse support and general labour across Toronto, the GTA, Hamilton and Niagara.';
  const image = settings.seo_image || '';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: '%s | Sunwings Transport',
    },
    description,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      url: baseUrl,
      siteName: settings.site_name || 'Sunwings Transport',
      title,
      description,
      images: image ? [{ url: image, alt: settings.site_name || 'Sunwings Transport' }] : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : [],
    },
    verification: settings.google_site_verification
      ? { google: settings.google_site_verification }
      : undefined,
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSiteSettings();
  const baseUrl = getBaseUrl();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'MovingCompany'],
    name: settings.site_name || 'Sunwings Transport',
    url: baseUrl,
    telephone: settings.phone || '647-526-5132',
    email: settings.email || 'dispatch@sunwingstransport.ca',
    description: settings.seo_description || 'Residential moving, furniture delivery and commercial transport services.',
    areaServed: [
      { '@type': 'City', name: 'Toronto' },
      { '@type': 'AdministrativeArea', name: 'Greater Toronto Area' },
      { '@type': 'City', name: 'Hamilton' },
      { '@type': 'AdministrativeArea', name: 'Niagara Region' },
    ],
  };

  return (
    <html lang="en-CA">
      <body>
        <Header settings={settings} />
        <main>{children}</main>
        <Footer settings={settings} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
