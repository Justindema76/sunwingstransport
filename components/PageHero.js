import HeroSlider from './HeroSlider';
import { pageSlide } from './heroSlides';

// Banner for every inner page, in the same style as the homepage slider.
// `extraSlides` adds more slides after the page's own one.
export default function PageHero({ crumbs = [], title, accent, eyebrow, description, image, fallbackImage, imagePosition, phone = '', ctas = true, badge, panel, preset = '', extraSlides = [] }) {
  const slides = [
    pageSlide({ crumbs, eyebrow, heading: title, accent, text: description, image, fallbackImage, imagePosition, phone, ctas, badge, panel, preset }),
    ...extraSlides,
  ];
  return <HeroSlider slides={slides}/>;
}
