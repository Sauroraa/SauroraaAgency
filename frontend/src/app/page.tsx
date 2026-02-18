import { PublicNav } from '@/components/layout/PublicNav';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { AuroraGradient } from '@/components/effects/AuroraGradient';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedArtists } from '@/components/home/FeaturedArtists';
import { StatsCounter } from '@/components/home/StatsCounter';

export default function HomePage() {
  return (
    <>
      <AuroraGradient />
      <PublicNav />
      <main className="relative z-10">
        <HeroSection />
        <FeaturedArtists />
        <StatsCounter />
      </main>
      <PublicFooter />
    </>
  );
}
