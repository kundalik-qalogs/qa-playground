import React from "react";
import Link from "next/link";
import Script from "next/script";
import PracticeClientContent from "./_components/PracticeClientContent";

export const revalidate = 3600;

export const metadata = {
  title: "Practice Elements | QA Playground – Selenium, Playwright & Cypress",
  description:
    "Explore 14+ hands-on practice elements including Buttons, Forms, Tables, Alerts, File Upload, and more. Perfect for Selenium, Playwright, and Cypress automation engineers.",
  keywords: [
    "QA automation practice",
    "Selenium practice",
    "Playwright practice",
    "Cypress practice",
    "automation testing elements",
    "practice input fields",
    "practice buttons",
    "practice forms",
    "practice tables",
    "QA Playground practice",
  ],
  alternates: {
    canonical: "https://www.qaplayground.com/practice",
  },
  openGraph: {
    type: "website",
    url: "https://www.qaplayground.com/practice",
    title: "Practice Elements | QA Playground – Selenium, Playwright & Cypress",
    description:
      "Explore 14+ hands-on practice elements including Buttons, Forms, Tables, Alerts, File Upload, and more. Perfect for Selenium, Playwright, and Cypress automation engineers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QA Playground Practice Elements",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@qaplayground",
    url: "https://www.qaplayground.com/practice",
    title: "Practice Elements | QA Playground – Selenium, Playwright & Cypress",
    description:
      "Explore 14+ hands-on practice elements including Buttons, Forms, Tables, Alerts, File Upload, and more. Perfect for Selenium, Playwright, and Cypress automation engineers.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "QA Automation Practice Elements",
  description:
    "Practice Selenium, Playwright, and Cypress automation testing with 14+ interactive UI elements.",
  url: "https://www.qaplayground.com/practice",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.qaplayground.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Practice",
        item: "https://www.qaplayground.com/practice",
      },
    ],
  },
};

const PracticePage = () => {
  return (
    <div>
      <Script
        id="practice-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="practice-section">
        <section className="page-title py-4">
          <h1 className="text-center text-4xl md:text-5xl font-semibold">
            Ready to be a Pro AI Automation Engineer?
          </h1>
          <p className="text-center text-base mt-2 text-gray-600 dark:text-gray-400">
            Practice daily and level up your automation skills with real-world
            scenarios.
          </p>
          <Link
            href="/study-tracker/interview-practice"
            prefetch={false}
            className="group mx-auto mt-5 flex w-fit max-w-[calc(100%-2rem)] flex-col items-center gap-2 rounded-full border border-emerald-300 bg-emerald-500/5 px-3 py-2 text-center text-sm font-semibold text-gray-900 transition-all hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-500/10 dark:border-emerald-800 dark:bg-emerald-400/10 dark:text-gray-50 sm:flex-row sm:text-left"
          >
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              2 free interviews
            </span>
            <span>Try AI interview practice and boost confidence today</span>
            <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-bold text-white shadow-sm shadow-emerald-900/20 transition-colors group-hover:bg-emerald-700">
              Start now
            </span>
          </Link>
        </section>

        <section
          aria-labelledby="practice-elements-heading"
          className="elements pb-0 pt-8 p-5"
        >
          <h2
            id="practice-elements-heading"
            className="text-2xl font-semibold mb-6 text-center"
          >
            Practice Elements
          </h2>
          <PracticeClientContent />
        </section>
      </div>
    </div>
  );
};

export default PracticePage;
