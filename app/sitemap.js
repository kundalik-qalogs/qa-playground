import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { basicDetails } from "@/data/BasicSetting";
import { siteMapUrls } from "@/data/sitemap-links";

export default async function sitemap() {
  // Static pages
  const staticPages = [
    {
      url: `${basicDetails.websiteURL}/`,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${basicDetails.websiteURL}/blog`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${basicDetails.websiteURL}/practice`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${basicDetails.websiteURL}/about-us`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${basicDetails.websiteURL}/contact-us`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${basicDetails.websiteURL}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Practice element pages from siteMapUrls
  const practicePages = siteMapUrls.map((link) => ({
    url: `${basicDetails.websiteURL}/${link.url}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Blog posts — read dynamically from Blog/posts/
  const postsDir = path.join(process.cwd(), "Blog/posts");
  const blogPosts = fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const { data } = matter(
        fs.readFileSync(path.join(postsDir, filename), "utf-8"),
      );
      if (data.draft === true) return null;
      return {
        url: `${basicDetails.websiteURL}/blog/${data.slug}`,
        lastModified: new Date(data.lastModified || data.date),
        changeFrequency: "weekly",
        priority: 0.8,
      };
    })
    .filter(Boolean);

  // Bank demo pages
  const bankPages = [
    {
      url: `${basicDetails.websiteURL}/bank/dashboard`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${basicDetails.websiteURL}/bank/accounts`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${basicDetails.websiteURL}/bank/transactions`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  return [...staticPages, ...practicePages, ...blogPosts, ...bankPages];
}
