import { PublicNav } from '@/components/layout/PublicNav';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { AuroraGradient } from '@/components/effects/AuroraGradient';
import { ToastContainer } from '@/components/ui/Toast';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuroraGradient />
      <PublicNav />
      <main className="relative z-10 min-h-screen pt-20">
        {children}
      </main>
      <PublicFooter />
      <ToastContainer />
    </>
  );
}
