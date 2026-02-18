import { AuroraGradient } from '@/components/effects/AuroraGradient';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuroraGradient />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        {children}
      </div>
    </>
  );
}
