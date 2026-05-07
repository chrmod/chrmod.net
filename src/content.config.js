import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    readTime: z.string().optional(),
    draft: z.boolean().default(false),
    excerpt: z.string(),
    hnUrl: z.string().url().optional(),
  }),
});

export const collections = { posts };
