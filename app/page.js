import HeroSection from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import {
  statsData,
  featuresData,
  howItWorksData,
  testimonialsData,
} from "@/data/landingPage";
import {
  BookOpen,
  CreditCard,
  LayoutGrid,
  CheckCircle,
  BarChart3,
  BookMarked,
  ClipboardList,
  Chrome,
  ExternalLink,
  Plug,
  Send,
} from "lucide-react";
import TelegramBotResourceLink from "@/app/(study)/study-tracker/resources/_components/telegram-bot/TelegramBotResourceLink";

export const metadata = {
  title: "QA Playground — Practice Selenium, Playwright & Cypress",
  description:
    "Free QA automation testing playground with 22+ UI elements, Bank Demo & Study Tracker. Practice Selenium, Playwright, and Cypress — free.",
  authors: [{ name: "Kundalik Jadhav" }],
  alternates: {
    canonical: "https://www.qaplayground.com",
  },
  keywords: [
    "QA Playground",
    "automation testing practice",
    "Selenium practice site",
    "Playwright testing",
    "Cypress testing",
    "QA engineer practice",
    "test automation playground",
    "QA study tracker",
    "Bank Demo automation",
    "Selenium WebDriver practice",
  ],
  openGraph: {
    type: "website",
    url: "https://www.qaplayground.com",
    title: "QA Playground — Practice Selenium, Playwright & Cypress",
    description:
      "Free QA automation testing playground with 22+ UI elements, Bank Demo & Study Tracker. Practice Selenium, Playwright, and Cypress — free.",
    images: [
      {
        url: "https://www.qaplayground.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "QA Playground — Practice Selenium, Playwright & Cypress",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@qaplayground",
    title: "QA Playground — Practice Selenium, Playwright & Cypress",
    description:
      "Free QA automation testing playground with 22+ UI elements, Bank Demo & Study Tracker. Practice Selenium, Playwright, and Cypress — free.",
    images: ["https://www.qaplayground.com/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "QA Playground",
      url: "https://www.qaplayground.com",
      description:
        "Free QA automation testing playground with 22+ interactive UI elements, Bank Demo app, and QA Study Tracker for Selenium, Playwright, and Cypress practice.",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://qaplayground.com/practice",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "QA PlayGround",
      operatingSystem: "Web",
      applicationCategory: "EducationalApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
        reviewCount: "127",
      },
      description:
        "A purpose-built practice platform for QA automation engineers to learn Selenium, Playwright, and Cypress through hands-on interactive elements.",
    },
    {
      "@type": "Organization",
      name: "QA Playground",
      url: "https://qaplayground.com",
      logo: "https://qaplayground.com/mainicons/edit.svg",
      sameAs: [
        "https://www.youtube.com/@qaplayground",
        "https://twitter.com/qaplayground",
        "https://github.com/kundalik5545/qatesting",
      ],
    },
  ],
};

const faqItems = [
  {
    q: "What is QA Playground and who is it built for?",
    a: "QA Playground is a free, purpose-built automation testing practice website for QA engineers at any level. It offers 22+ interactive UI elements — inputs, tables, drag-and-drop, shadow DOM, alerts, file upload, and more — plus a full Bank Demo App and Study Tracker. Whether you're a beginner learning Selenium for the first time or an experienced engineer sharpening your Playwright or Cypress skills, everything here is designed to mirror real-world testability challenges.",
  },
  {
    q: "Which UI elements can I practice automation testing on?",
    a: "QA Playground includes 22 practice elements: text inputs, buttons (click, double-click, right-click), dropdowns, radio buttons, checkboxes, alerts and dialogs, iFrames, new-window and tab switching, drag-and-drop, sortable lists, sliders, simple and advanced data tables, date pickers, file upload and download, shadow DOM, multi-select, dynamic waits, and more. Each element is built with testability in mind — with id, data-testid, and data-action attributes — so your Selenium WebDriver or Playwright locators work exactly as expected.",
  },
  {
    q: "Is QA Playground completely free to use for Selenium, Playwright, and Cypress practice?",
    a: "Yes — 100% free, no credit card, no paywall. All 22 practice elements, the Bank Demo App for end-to-end testing practice, the QA Study Tracker, and QA Tools like the JSON to File Converter are all free. An optional account lets you sync your Study Tracker progress across devices, but it is never required.",
  },
  {
    q: "What is the Bank Demo App and how does it help with end-to-end test automation?",
    a: "The Bank Demo App is a fully simulated banking application with login (admin / admin123), a dashboard, accounts CRUD, and transaction management with filtering. It is purpose-built for practicing end-to-end automation frameworks — build a full Page Object Model test suite covering login flows, account creation, balance updates, and transaction filtering, all on a stable, predictable UI with proper test attributes.",
  },
  {
    q: "Can I practice Shadow DOM, drag-and-drop, iFrame, and dynamic waits with Selenium WebDriver?",
    a: "Yes. QA Playground includes dedicated practice pages for Shadow DOM elements, drag-and-drop and sortable lists, iFrame handling, multi-window and tab switching, explicit/implicit wait scenarios, and dynamic alerts — the exact elements that trip up most Selenium WebDriver and Playwright beginners. Every scenario is repeatable, so you can run tests as many times as needed.",
  },
  {
    q: "How does the QA Study Tracker help me learn automation testing step by step?",
    a: "The QA Study Tracker is a personal learning dashboard with structured syllabi for Manual Testing, Selenium Automation, API Testing, and Playwright. Track topic completion, log daily study sessions, save articles and videos as resources, and view your progress with charts. You can also import AI-generated syllabi or export your own — making it a flexible companion for a self-paced QA automation learning roadmap.",
  },
  {
    q: "Which automation frameworks does QA Playground support?",
    a: "All practice elements and the Bank Demo App are fully framework-agnostic. You can use Selenium WebDriver (Java, Python, or JavaScript), Playwright (JavaScript, TypeScript, or Python), or Cypress (JavaScript/TypeScript). Elements expose standard HTML attributes so locator strategies — CSS selectors, XPath, getByRole, getByTestId — all work correctly across frameworks.",
  },
  {
    q: "Can I use QA Playground to prepare for a QA automation engineer job interview?",
    a: "Yes. The platform is used by QA engineers specifically for interview preparation. The practice elements cover scenarios commonly tested in technical QA interviews — handling dynamic tables, writing Page Object Model code, dealing with pop-ups and shadow DOM, and creating stable, maintainable test suites. The blog and learn sections also include automation concepts, logic programs, and QA interview question guides.",
  },
  {
    q: "Do I need to install anything to practice Selenium or Playwright on QA Playground?",
    a: "No installation needed on QA Playground itself — the practice site runs entirely in your browser. You write and run your Selenium, Playwright, or Cypress scripts locally on your machine, pointed at https://www.qaplayground.com. This mirrors a real professional workflow: a running app, your local test project, and a CI/CD pipeline if you want to extend the practice.",
  },
  {
    q: "How is my progress and test data stored? Is it private?",
    a: "All Study Tracker data — syllabus progress, daily logs, saved resources — is stored in your browser's localStorage by default. Nothing is sent to external servers without your explicit choice. If you create a free account and opt in to sync, data is stored in a secure PostgreSQL database tied to your account. The Bank Demo App also stores account and transaction data locally in your browser, so it resets if you clear your browser data.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const studyTrackerSyllabi = [
  {
    label: "Manual Testing",
    badgeClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    barClass: "bg-blue-500",
    accentClass: "border-l-blue-500",
    pct: 65,
  },
  {
    label: "Automation Testing",
    badgeClass:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    barClass: "bg-purple-600",
    accentClass: "border-l-purple-600",
    pct: 40,
  },
  {
    label: "API Testing",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    barClass: "bg-emerald-600",
    accentClass: "border-l-emerald-600",
    pct: 25,
  },
  {
    label: "Playwright",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    barClass: "bg-red-600",
    accentClass: "border-l-red-600",
    pct: 15,
  },
];

const studyTrackerFeatures = [
  {
    icon: <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
    text: "Track topic completion across 4 QA syllabi",
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-blue-600 flex-shrink-0" />,
    text: "Visual progress charts — donut, radar, and daily activity line chart",
  },
  {
    icon: <BookMarked className="h-5 w-5 text-violet-600 flex-shrink-0" />,
    text: "Add personal notes and resource links per topic",
  },
  {
    icon: <ClipboardList className="h-5 w-5 text-slate-500 flex-shrink-0" />,
    text: "Daily activity log with streak tracking — no login required",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Three Main Features */}
      <section aria-label="Main platform features" className="py-14 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold gradient-title mb-3">
            Free Resources to Level Up Your QA Automation Career
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three powerful tools in one platform — practice automation, simulate
            real apps, and track your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Practice Elements */}
          <Card className="p-6 shadow-lg rounded-xl border-t-4 border-t-blue-500 flex flex-col">
            <CardContent className="pt-0 flex flex-col flex-1">
              <div className="mb-4">
                <LayoutGrid
                  className="h-10 w-10 text-blue-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Practice Elements</h3>
              <p className="text-muted-foreground text-sm mb-6 flex-1">
                22+ interactive UI elements — inputs, tables, drag-drop, alerts,
                iFrames, shadow DOM, and more. Designed specifically for
                Selenium, Playwright, and Cypress practice.
              </p>
              <Link
                href="/practice"
                prefetch={false}
                aria-label="Start practicing automation testing elements"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start Practicing
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Bank Demo */}
          <Card className="p-6 shadow-lg rounded-xl border-t-4 border-t-teal-500 flex flex-col">
            <CardContent className="pt-0 flex flex-col flex-1">
              <div className="mb-4">
                <CreditCard
                  className="h-10 w-10 text-teal-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bank Demo App</h3>
              <p className="text-muted-foreground text-sm mb-6 flex-1">
                A full simulated banking app — login, accounts, dashboard, and
                transaction management. Perfect for building and testing
                end-to-end automation frameworks.
              </p>
              <Link
                href="/bank"
                prefetch={false}
                aria-label="Open the Bank Demo application"
              >
                <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white">
                  Open Bank App
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Study Tracker — NEW */}
          <Card className="p-6 shadow-lg rounded-xl border-t-4 border-t-purple-500 relative overflow-hidden flex flex-col">
            <div className="absolute top-3 right-3">
              <Badge className="bg-purple-600 text-white text-xs">
                New Feature
              </Badge>
            </div>
            <CardContent className="pt-0 flex flex-col flex-1">
              <div className="mb-4">
                <BookOpen
                  className="h-10 w-10 text-purple-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">QA Study Tracker</h3>
              <p className="text-muted-foreground text-sm mb-6 flex-1">
                Track your QA learning journey across Manual Testing,
                Automation, API Testing, and Playwright syllabi with visual
                progress charts and daily activity logs.
              </p>
              <Link
                href="/study-tracker/dashboard"
                prefetch={false}
                aria-label="Open the QA Study Tracker"
              >
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Track Your Progress
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* QA Playground Telegram Bot */}
          <Card className="p-6 shadow-lg rounded-xl border-t-4 border-t-sky-500 relative overflow-hidden flex flex-col">
            <div className="absolute top-3 right-3">
              <Badge className="bg-sky-500 text-white text-xs">New</Badge>
            </div>
            <CardContent className="pt-0 flex flex-col flex-1">
              <div className="mb-4">
                <Send className="h-10 w-10 text-sky-500" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                QA Playground Telegram Bot
              </h3>
              <p className="text-muted-foreground text-sm mb-4 flex-1">
                Save resources, todos, and notes directly from Telegram. Message{" "}
                <span className="font-medium text-sky-600 dark:text-sky-400">
                  @qaplayground_bot
                </span>{" "}
                and they appear instantly in your Resources list.
              </p>
              <div className="flex flex-col gap-2">
                <TelegramBotResourceLink />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Study Tracker Detailed Feature Section */}
      <section
        aria-label="QA Study Tracker feature details"
        className="py-14 px-4 bg-muted/40 rounded-2xl mx-4 my-4"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-purple-600 text-white text-xs">New</Badge>
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
              Latest Feature
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: description */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Track Your QA Learning with{" "}
                <span className="gradient-title">Study Tracker</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                The QA Study Tracker is your personal learning dashboard for
                mastering QA engineering. It covers four complete syllabi —
                Manual Testing, Automation Testing, API Testing, and Playwright.
                Track topic completion, add notes, save resource links, and
                visualize your progress with charts. Everything is saved locally
                in your browser — no login needed.
              </p>

              <ul
                className="space-y-3 mb-8"
                aria-label="Study Tracker features"
              >
                {studyTrackerFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    {f.icon}
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/study-tracker/dashboard"
                aria-label="Open the QA Study Tracker dashboard"
              >
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                >
                  Start Tracking Now
                </Button>
              </Link>
            </div>

            {/* Right: syllabus progress cards */}
            <div
              className="grid grid-cols-2 gap-4"
              aria-label="Study Tracker syllabus overview"
            >
              {studyTrackerSyllabi.map((s, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border-l-4 ${s.accentClass} bg-card shadow-sm`}
                >
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${s.badgeClass}`}
                  >
                    {s.label}
                  </span>
                  <div className="mt-3">
                    <div
                      className="h-2 bg-muted rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={s.pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${s.label} progress`}
                    >
                      <div
                        className={`h-full ${s.barClass} rounded-full`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.pct}% complete (demo)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Browser Extensions Section */}
      <section
        aria-label="Browser extensions for QA engineers"
        className="py-12 px-4 bg-slate-50 dark:bg-slate-900/40"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <Plug className="h-5 w-5 text-indigo-600" aria-hidden="true" />
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                Browser Extensions
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Power Up Your QA Workflow
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Free browser extensions built for automation testers — capture
              screenshots, record test sessions, and clip practice scenarios
              right from your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* QA Capture */}
            <a
              href="/chrome/qa-capture"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Install QA Capture Chrome extension"
              className="block"
            >
              <Card className="p-6 shadow hover:shadow-md transition-shadow rounded-xl h-full group border-t-4 border-t-emerald-500">
                <CardContent className="pt-0 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Chrome
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <Badge className="bg-emerald-500 text-white text-xs">
                      New
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1.5">QA Capture</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    Capture screenshots continuously and export as HTML,
                    Markdown, PDF, and more — right from your browser during
                    test sessions.
                  </p>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Add to Chrome
                    </span>
                    <ExternalLink
                      className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                </CardContent>
              </Card>
            </a>

            {/* QA Playground Clipper */}
            <a
              href="/chrome/qa-clipper"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Install QA Playground Clipper Chrome extension"
              className="block"
            >
              <Card className="p-6 shadow hover:shadow-md transition-shadow rounded-xl h-full group border-t-4 border-t-blue-500">
                <CardContent className="pt-0 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Chrome
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <Badge className="bg-blue-500 text-white text-xs">
                      New
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1.5">
                    QA Playground Clipper
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    Clip and save practice scenarios, articles, and resources
                    directly to your QA workflow — one click from any page.
                  </p>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Add to Chrome
                    </span>
                    <ExternalLink
                      className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        aria-label="Practice element categories"
        className="py-12 px-4 bg-muted/30"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">
            Practice Any Element, Any Scenario
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            Every element is purpose-built for automation testing. No
            distractions — just clean, testable UI.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {featuresData.map((f, i) => (
              <Link
                key={i}
                href={f.to}
                prefetch={false}
                aria-label={`Practice ${f.title}`}
                className="h-full"
              >
                <Card className="p-5 shadow hover:shadow-md transition-shadow rounded-xl h-full group">
                  <CardContent className="pt-0 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div aria-hidden="true">{f.icon}</div>
                      {f.badge && (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.badgeClass}`}
                        >
                          {f.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1.5">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {f.description}
                    </p>
                    {/* Scenario count + difficulty */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {f.count} scenarios
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${f.difficultyClass}`}
                      >
                        {f.difficulty}
                      </span>
                    </div>
                    {/* Hover CTA */}
                    <span className="mt-2 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Practice →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section
        aria-label="Platform statistics"
        className="py-8 px-4 border-y border-border"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {statsData.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-bold gradient-title">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      {/* <section aria-label="How QA Playground works" className="py-14 px-4">
        <h2 className="text-2xl font-bold text-center mb-3">How It Works</h2>
        <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
          Get up and running in minutes — no setup complexity, no paywalls.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {howItWorksData.map((step, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-xl bg-card border"
              aria-label={step.title}
            >
              <div className="flex justify-center mb-4" aria-hidden="true">
                {step.icon}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Testimonials */}
      <section
        aria-label="Testimonials from QA engineers"
        className="py-14 px-4 bg-muted/30"
      >
        <h2 className="text-2xl font-bold text-center mb-3">
          What QA Engineers Say
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
          Trusted by thousands of QA professionals worldwide.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonialsData.map((t, i) => (
            <Card key={i} className="p-6 shadow rounded-xl">
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground italic mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={`${t.name}, ${t.role}`}
                    className="w-10 h-10 rounded-full"
                    width="40"
                    height="40"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section aria-label="Frequently asked questions" className="py-14 px-4">
        {/* FAQPage JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about QA Playground
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-4"
              >
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
