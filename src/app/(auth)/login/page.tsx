import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Header } from '@/components/layout/Header';
import { PixelIcon } from '@/components/icons/PixelIcon';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-md">
          {/* Brand mark */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[var(--text-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
                <PixelIcon name="book" size={20} className="text-[var(--bg-primary)]" />
              </div>
              <span className="font-display fs-h-sm tracking-tight uppercase">
                Ultrabooks
              </span>
            </Link>
          </div>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
