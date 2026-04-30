import Hero from '@/components/Hero';
import HorologicalArt from '@/components/HorologicalArt';
import ProductShowcase from '@/components/ProductShowcase';
import Movement from '@/components/Movement';
import TechnicalSpecs from '@/components/TechnicalSpecs';
import FeaturesGallery from '@/components/FeaturesGallery';
import SocialProof from '@/components/SocialProof';
import Craftsmanship from '@/components/Craftsmanship';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="smooth-wrapper">
      <Hero />
      <HorologicalArt />
      <ProductShowcase />
      <Movement />
      <TechnicalSpecs />
      <FeaturesGallery />
      <SocialProof />
      <Craftsmanship />
      <Footer />
    </main>
  );
}
