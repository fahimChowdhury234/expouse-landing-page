<script setup lang="ts">
/**
 * /blog/[slug]: one blog article. Same reading layout as a Newsroom story
 * (pages/news/[slug].vue, built from components/article), with "Keep reading"
 * underneath. Content lives in utils/blog.ts; an unknown slug is a 404.
 */
import { findBlogPost, moreBlogPosts } from '~/utils/blog'
import { headingId } from '~/utils/news'

const route = useRoute()
const config = useRuntimeConfig().public

const found = findBlogPost(String(route.params.slug))
if (!found) throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
const post = found

const site = config.siteUrl.replace(/\/+$/, '')
const url = `${site}/blog/${post.slug}`

const headings = post.body.flatMap(b => b.type === 'h2' ? [{ id: headingId(b.text), text: b.text }] : [])

const more = moreBlogPosts(post)

useSeoMeta({
  title: `${post.title} | EXPOUSE Blog`,
  ogTitle: post.title,
  description: post.excerpt,
  ogDescription: post.excerpt,
  ogType: 'article',
  articlePublishedTime: post.date,
  articleSection: post.category,
})

useHead({
  script: [{
    key: 'ld-article',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': post.title,
      'description': post.excerpt,
      'datePublished': post.date,
      'author': { '@type': 'Person', 'name': post.author.name },
      'publisher': { '@id': `${site}/#organization` },
      'mainEntityOfPage': url,
      'image': `${site}${post.cover?.src ?? post.image}`,
    }),
  }],
})
</script>

<template>
  <div class="page">
    <article class="art">
      <div class="rail">
        <ArticleHeader :post="post" back-to="/blog" back-label="Blog" />
        <ArticleByline :author="post.author" :url="url" :title="post.title" class="byline" />
        <ArticleFigure v-if="post.cover" :src="post.cover.src" :caption="post.cover.caption" ratio="2 / 1" eager class="cover" />

        <div class="layout">
          <aside class="side">
            <ArticleToc v-if="headings.length" :headings="headings" />
          </aside>

          <div class="content">
            <ArticleBody :blocks="post.body" />
            <ul v-if="post.tags.length" class="tags" aria-label="Topics">
              <li v-for="t in post.tags" :key="t" class="tag">{{ t }}</li>
            </ul>
          </div>
        </div>
      </div>
    </article>

    <BlogMore :posts="more" />
  </div>
</template>

<style scoped>
.page {
  background: #fff;
}

.art {
  padding: clamp(28px, 4vw, 40px) 0 clamp(56px, 7vw, 80px);
}

/* Same reading width as /news/[slug]: a 224px contents list + 56px gap + a 720px column of text. */
.rail {
  max-width: 1080px;
  margin-inline: auto;
  padding-inline: clamp(16px, 3vw, 40px);
}

.byline {
  margin-top: 22px;
}

.cover {
  margin-top: 10px;
}

.layout {
  display: grid;
  grid-template-columns: 224px minmax(0, 1fr);
  column-gap: 56px;
  margin-top: 48px;
}

.content {
  min-width: 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 30px 0 0;
  padding: 22px 0 0;
  list-style: none;
  border-top: 1px solid var(--color-line, #e8e9ee);
}

.tag {
  padding: 6px 12px;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: var(--color-brand, #6452e7);
  background: #f1effd;
  border-radius: 6px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
    margin-top: 32px;
  }

  .side {
    display: none;
  }
}
</style>
