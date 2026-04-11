'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function SignupPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', full_name: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    try {
      const response = await api.signup({ email: formData.email, username: formData.username, password: formData.password, full_name: formData.full_name || undefined });
      localStorage.setItem('token', response.access_token);
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600 mb-8">Join Furniro for exclusive deals and more</p>
          {error && (<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-700">{error}</p></div>)}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="johndoe" required /></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="you@example.com" required /></div>
            <div><label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-gray-400">(optional)</span></label>
              <input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="John Doe" /></div>
            <div><label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="At least 6 characters" required /></div>
            <div><label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Re-enter your password" required /></div>
            <button type="submit" disabled={isLoading} className="w-full px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? 'Creating Account...' : 'Sign Up'}</button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">Already have an account? <Link href="/login" className="text-gray-900 font-medium hover:underline">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
