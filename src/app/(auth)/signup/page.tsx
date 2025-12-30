import { SignupForm } from '@/components/auth/SignupForm';
import { Header } from '@/components/layout/Header';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <SignupForm />
      </main>
    </div>
  );
}
