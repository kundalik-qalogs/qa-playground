"use client";

import React, { useState, useSyncExternalStore } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import Link from "next/link";
import { basicDetails } from "@/data/BasicSetting";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  BookOpen,
  LayoutDashboard,
  FlaskConical,
  Landmark,
  Wrench,
  LogIn,
  LogOut,
  UserPlus,
  Chrome,
  ExternalLink,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home, aria: "Go to homepage" },
  {
    href: "/practice",
    label: "Practice",
    icon: FlaskConical,
    aria: "Browse practice elements",
  },
  {
    href: "/study-tracker/dashboard",
    label: "Study Tracker",
    icon: LayoutDashboard,
    aria: "Open study tracker dashboard",
    badge: "New",
  },
  {
    href: "/blog",
    label: "Blog",
    icon: BookOpen,
    aria: "Read QA automation blog posts",
  },
  {
    href: "/bank",
    label: "Bank Demo",
    icon: Landmark,
    aria: "Open bank demo app for automation practice",
  },
  {
    href: "/qa-tools",
    label: "QA Tools",
    icon: Wrench,
    aria: "Open free QA tools",
  },
];

const CHROME_EXTENSIONS = [
  {
    id: "qa-capture",
    label: "QA Capture",
    description:
      "Capture screenshot continuously and export as html, md, pdf, etc.",
    href: "https://chromewebstore.google.com/detail/jhgkhnokloeklnagbkgkgcfphafifefg?utm_source=item-share-cb",
    badgeColor: "bg-emerald-500",
    badgeText: "Live",
    aria: "Install QA Capture Chrome extension",
  },
  {
    id: "qa-clipper",
    label: "QA Playground Clipper",
    description: "Clip & save resources at one place.",
    href: "https://chromewebstore.google.com/detail/jegdkegbomfbmhhimfjgacdblcoodfpd?utm_source=item-share-cb",
    badgeColor: "bg-blue-500",
    badgeText: "Live",
    aria: "Install QA Playground Clipper Chrome extension",
  },
];

const subscribeToClientMount = (onStoreChange) => {
  const timer = window.setTimeout(onStoreChange, 0);
  return () => window.clearTimeout(timer);
};

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const SheetOpen = ({ children }) => {
  const mounted = useSyncExternalStore(
    subscribeToClientMount,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const router = useRouter();

  const close = () => setOpen(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    close();
    router.push("/login");
  };

  if (!mounted) {
    return children;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild aria-label="Open navigation menu">
        {children}
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex flex-col w-[310px] p-0"
        aria-label="Mobile navigation"
      >
        {/* Brand header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <SheetTitle asChild>
            <Link
              href="/"
              onClick={close}
              className="flex items-center gap-2"
              aria-label="QA Playground home"
            >
              <Image
                src="/mainicons/edit.svg"
                width={26}
                height={26}
                alt="QA Playground logo"
              />
              <span className="gradient-subTitle text-lg font-semibold">
                {basicDetails.websiteName}
              </span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto">
          {/* Main nav links */}
          <nav
            aria-label="Mobile navigation links"
            className="px-3 pt-3 pb-1 space-y-0.5"
          >
            {NAV_LINKS.map(({ href, label, icon: Icon, aria, badge }) => (
              <Link
                key={href}
                href={href}
                prefetch={false}
                aria-label={aria}
                onClick={close}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Icon
                  size={17}
                  className="shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span>{label}</span>
                {badge && (
                  <span
                    aria-label="New feature"
                    className="ml-auto rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white"
                  >
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Chrome Extensions section */}
          <div className="px-3 pt-3 pb-2" aria-label="Chrome extensions">
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Chrome Extensions
            </p>
            <div className="space-y-1.5">
              {CHROME_EXTENSIONS.map((ext) => (
                <a
                  key={ext.id}
                  href={ext.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ext.aria}
                  onClick={close}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 hover:bg-accent hover:border-border transition-colors group"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <Chrome
                      size={15}
                      className="text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground leading-tight truncate">
                      {ext.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight truncate">
                      {ext.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`rounded-full ${ext.badgeColor} px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white`}
                    >
                      {ext.badgeText}
                    </span>
                    <ExternalLink
                      size={11}
                      className="text-muted-foreground group-hover:text-foreground transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Auth section — pinned to bottom */}
        {!isPending && (
          <div
            className="border-t px-3 py-4 shrink-0"
            aria-label="Account actions"
          >
            {user ? (
              <div className="space-y-1.5">
                {/* User info card */}
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                  <div
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-bold flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate leading-tight">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate leading-tight">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  aria-label="Sign out of your account"
                  className="flex items-center justify-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {/* Log In button */}
                <Link
                  href="/login"
                  prefetch={false}
                  onClick={close}
                  aria-label="Log in to your account"
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-foreground bg-background hover:bg-accent transition-colors"
                >
                  <LogIn size={15} aria-hidden="true" />
                  Log In
                </Link>
                {/* Sign Up button */}
                <Link
                  href="/signup"
                  prefetch={false}
                  onClick={close}
                  aria-label="Create a free account"
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-colors shadow-sm"
                >
                  <UserPlus size={15} aria-hidden="true" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default SheetOpen;
