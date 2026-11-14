import HeroSlider from './HeroSlider';
import CodeStudioBanner from './CodeStudioBanner';
import { pageSlide } from './heroSlides';
import { getCodeStudioBanner } from '@/lib/codeStudio';

// Banner for every inner page, in the same style as the homepage slider.
// `extraSlides` adds more slides after the page's own one.
// `placement` (e.g. 'contact'): a Banner Studio banner picked for this page replaces it.
export default async function PageHero({ placement = '', crumbs = [], title, accent, eyebrow, description, image, imageAlt = '', fallbackImage, imagePosition, phone = '', ctas = true, badge, panel, preset = '', quoteFill = null, extraSlides = [] }) {
  const studio = await getCodeStudioBanner(placement);
  if (studio) return <CodeStudioBanner {...studio}/>;
  const slides = [
    pageSlide({ crumbs, eyebrow, heading: title, accent, text: description, image, imageAlt, fallbackImage, imagePosition, phone, ctas, badge, panel, preset, quoteFill }),
    ...extraSlides,
  ];
  return <HeroSlider slides={slides}/>;
}
