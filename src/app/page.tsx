import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import FeaturedProducts from '@/components/FeaturedProducts';
import Testimonials from '@/components/Testimonials';
import Newsletter from '@/components/Newsletter';

export default function Home() {
  return (
    <>
      <Hero />
      <CategorySection />
      <FeaturedProducts />
      <Testimonials />
      <Newsletter />
    </>
  );
}
