import { notFound } from 'next/navigation';
import BlogPostView, { blogPostMetadata } from '@/components/BlogPostView';
import { getBlogPostBySlug, getBlogPosts, getServices, getSiteSettings } from '@/lib/content';
import { readSiteSections, sectionFor } from '@/lib/siteSections';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getBlogPostBySlug(slug), getSiteSettings()]);
  // A post shown only in the Hamilton & Niagara section points search engines there.
  const hnOnly = post && sectionFor('blog', post.slug, readSiteSections(settings)) === 'hn';
  return blogPostMetadata(post, hnOnly ? '/hamilton-niagara/blog' : '/blog');
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const [post, posts, services, settings] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts(), getServices(), getSiteSettings()]);
  if (!post) notFound();
  return <BlogPostView post={post} posts={posts} services={services} settings={settings}/>;
}
