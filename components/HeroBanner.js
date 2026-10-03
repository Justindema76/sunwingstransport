import Link from 'next/link';

export default function HeroBanner({
  eyebrow,
  title,
  description,
  image,
  ctaLabel = 'View Services',
  ctaUrl = '/services',
}) {
  const style = image
    ? { backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.48)),url("${image}")` }
    : undefined;

  return (
    <section className={`hero-banner ${image ? '' : 'hero-fallback'}`} style={style}>
      <div className="container hero-content">
        {eyebrow ? <div className="hero-eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="button button-primary hero-button" href={ctaUrl}>{ctaLabel}</Link>
      </div>
    </section>
  );
}
