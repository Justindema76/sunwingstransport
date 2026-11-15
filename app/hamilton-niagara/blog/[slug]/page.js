import { notFound } from 'next/navigation';
import BlogPostView, { blogPostMetadata } from '@/components/BlogPostView';
import { getBlogPostBySlug, getBlogPosts, getServices, getSiteSettings } from '@/lib/content';
import { HN } from '@/lib/hamiltonNiagara';
import { readSiteSections, sectionFor } from '@/lib/siteSections';

const BASE = `${HN}/blog`;

async function findPost(slug) {
  const [post, settings] = await Promise.all([getBlogPostBySlug(slug), getSiteSettings()]);
  // Only posts set to show in this section (Both, or Hamilton & Niagara).
  if (!post || sectionFor('blog', post.slug, readSiteSections(settings)) === 'main') return null;
  return post;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([findPost(slug), getSiteSettings()]);
  if (!post) return {};
  // A post on both sites points search engines at the main copy; a Hamilton-only post at this one.
  const both = sectionFor('blog', post.slug, readSiteSections(settings)) === 'both';
  return blogPostMetadata(post, both ? '/blog' : BASE);
}

export default async function HnBlogPostPage({ params }) {
  const { slug } = await params;
  const [post, posts, services, settings] = await Promise.all([findPost(slug), getBlogPosts({ area: 'hn' }), getServices(), getSiteSettings()]);
  if (!post) notFound();
  return <BlogPostView post={post} posts={posts} services={services} settings={settings} base={BASE} home={HN}/>;
}
