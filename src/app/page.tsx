import HeroSection from '@/components/HeroSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import CollectionsSection from '@/components/CollectionsSection';
import NewsletterSection from '@/components/NewsletterSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <CollectionsSection />
      <NewsletterSection />
    </>
  );
}
