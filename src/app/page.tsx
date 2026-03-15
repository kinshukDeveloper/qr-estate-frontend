import { redirect } from 'next/navigation';

// Root route redirects to dashboard
// Middleware handles the auth check and redirects to /auth/login if not authenticated
export default function Home() {
  redirect('/dashboard');
}
