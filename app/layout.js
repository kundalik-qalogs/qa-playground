import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import Script from "next/script";
import { ThemeProvider } from "@/components/lib/theme-provider";
import Footer from "@/components/lib/Footer";
import { basicDetails } from "@/data/BasicSetting";
import { Analytics } from "@vercel/analytics/next";
import SiteAlertPopup from "@/components/SiteAlertPopup";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  themeColor: "#7c3aed",
};

export const metadata = {
  title: {
    default: `${basicDetails.websiteName}: Practice Automation Testing with Selenium`,
    template: `%s`,
  },
  description: basicDetails.websiteDescription,
  keywords: [
    "QA Playground",
    "automation testing",
    "Selenium testing",
    "Playwright testing",
    "Cypress testing",
    "Selenium WebDriver",
    "test automation",
    "QA automation practice",
    "QA study tracker",
  ],
  robots: "index, follow",
  openGraph: {
    type: "website",
    site_name: basicDetails.websiteName,
    title: `${basicDetails.websiteName}: Practice Automation Testing with Selenium`,
    description: basicDetails.websiteDescription,
    icons: {
      icon: "/favicon.ico",
    },
    url: basicDetails.websiteURL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${basicDetails.websiteName} - Selenium Automation Testing Playground`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@qaplayground",
    title: `${basicDetails.websiteName}: Practice Automation Testing with Selenium`,
    description: basicDetails.websiteDescription,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://cloud.umami.is"
          crossOrigin="anonymous"
        />
        <link rel="prefetch" href="/practice" />
        <link rel="prefetch" href="/bank" />
      </head>

      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip to main content — accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
          >
            Skip to content
          </a>

          {/* Header/Navbar */}
          <Header />

          {/* Main Content */}
          <main
            id="main-content"
            className="container mx-auto py-3 max-w-7xl min-h-screen"
            role="main"
          >
            {children}
          </main>

          {/* Site Alert Popup */}
          <SiteAlertPopup />

          {/* Toaster Notifications */}
          <Toaster richColors position="bottom-center" />

          {/* Footer */}
          <footer className="bg-[#F3F4F6] dark:bg-[#1F2227] p-1 pt-8">
            <Footer />
          </footer>

          {/* Vercel Analytics */}
          {/* <Analytics /> */}
        </ThemeProvider>

        {/* Umami Analytics */}
        <Script
          id="umami-analytics"
          src="https://cloud.umami.is/script.js"
          data-website-id="b5f3d51f-b071-48a6-a70b-2346af1f7625"
          strategy="afterInteractive"
        />

        {/* Google Analytics — disabled (503 on collect endpoint; re-enable if GA4 is reconfigured) */}
        <Script
          id="google-analytics-src"
          src="https://www.googletagmanager.com/gtag/js?id=G-Z4H9RTYGS4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-Z4H9RTYGS4');`}
        </Script>

        {/* Usercentrics CMP — disabled (loads 10 requests; re-enable with lazyOnload when consent UX is needed) */}
        {/* <Script
          id="usercentrics-cmp"
          src="https://app.usercentrics.eu/browser-ui/latest/loader.js"
          data-settings-id="RCGf52YH07pmK7"
          strategy="lazyOnload"
        /> */}
      </body>
    </html>
  );
}
