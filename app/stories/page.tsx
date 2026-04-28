import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { fetchStories } from '@/lib/api/stories';
import StoriesClient from './stories-client';

export default async function StoriesPage() {
  const adminAuth = await isAuthenticated();
  if (!adminAuth) redirect('/admin/login');

  const stories = await fetchStories();
  return <StoriesClient stories={stories} />;
}
