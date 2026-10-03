import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{maxWidth:820,textAlign:'center'}}>
        <span className="kicker">404</span>
        <h1 style={{fontSize:'clamp(36px,6vw,62px)',marginBottom:16}}>That page isn’t here.</h1>
        <p className="muted" style={{fontSize:18,marginBottom:28}}>
          The link may be old or the page may have moved. Use one of the links below to keep going.
        </p>
        <div className="hero-ctas" style={{justifyContent:'center'}}>
          <Link className="btn btn-accent" href="/services">View Services</Link>
          <Link className="btn btn-line" href="/locations">Service Areas</Link>
          <Link className="btn btn-navy" href="/contact">Contact Sunwings</Link>
        </div>
      </div>
    </section>
  );
}
