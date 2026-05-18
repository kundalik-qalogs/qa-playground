"use client";

import { Menu, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import SheetOpen from "./NavbarSheet";
import { ModeToggle } from "./lib/Mode-toggle";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { to: "/", text: "Home" },
  { to: "/study-tracker/dashboard", text: "Study Tracker", badge: "New" },
  { to: "/bank", text: "Bank Demo" },
  { to: "/practice", text: "Practice" },
  { to: "/qa-tools", text: "QA Tools" },
  { to: "/blog", text: "Blog" },
];

const Header = () => {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    setDropdownOpen(false);
    router.push("/login");
  };

  const handleBlur = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget)) {
      setDropdownOpen(false);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 dark:bg-black backdrop-blur-md z-50 border-b shadow-sm py-2">
      <nav className="container mx-auto px-1 flex items-center justify-between">
        <Link href="/" passHref>
          <span className="text-2xl flex items-center justify-center gap-2">
            <Image
              src="/mainicons/edit.svg"
              width={30}
              height={30}
              alt="QA PlayGround - Automation Testing Practice Platform"
            />
            <span className="gradient-subTitle font-semibold">
              QA PlayGround
            </span>
          </span>
        </Link>

        {/* Mobile right side: mode toggle + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <ModeToggle />
          <SheetOpen>
            <button
              type="button"
              aria-label="Open navigation menu"
              className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu size={26} aria-hidden="true" />
            </button>
          </SheetOpen>
        </div>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-4"
        >
          {NAV_LINKS.map(({ to, text, badge }, index) => (
            <Link
              key={index}
              href={to}
              prefetch={false}
              className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {text}
              {badge && (
                <span
                  aria-label="(New feature)"
                  className="ml-1.5 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white"
                >
                  {badge}
                </span>
              )}
            </Link>
          ))}

          {/* Right-side controls: theme toggle + auth */}
          <div className="flex items-center gap-2">
            <ModeToggle />

            {!isPending && (
              <>
                {user ? (
                  /* Logged-in: profile card */
                  <div
                    ref={dropdownRef}
                    className="relative"
                    onBlur={handleBlur}
                  >
                    <button
                      onClick={() => setDropdownOpen((o) => !o)}
                      className="flex items-center gap-[8px] pl-[6px] pr-[10px] py-[5px] rounded-xl border border-[#e9eaed] bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-all cursor-pointer"
                      aria-label="User profile"
                      id="header-profile-btn"
                      data-testid="header-profile-btn"
                    >
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-[0.75rem] font-bold flex items-center justify-center flex-shrink-0">
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      {/* Name */}
                      <div className="text-left">
                        <div className="text-[0.8rem] font-semibold text-[#111827] dark:text-gray-100 leading-tight max-w-[120px] truncate">
                          {user.name}
                        </div>
                        <div className="text-[0.65rem] font-medium text-gray-400 leading-tight">
                          {user.role ?? "USER"}
                        </div>
                      </div>
                      <ChevronDown
                        size={13}
                        className={cn(
                          "text-gray-400 flex-shrink-0 transition-transform duration-150",
                          dropdownOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                      <div
                        className="absolute top-[calc(100%+8px)] right-0 w-[220px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.10)] p-2 z-50"
                        id="header-profile-dropdown"
                        data-testid="header-profile-dropdown"
                      >
                        <div className="px-[10px] pt-2 pb-[10px] border-b border-gray-100 dark:border-gray-700 mb-[6px]">
                          <p className="text-[0.82rem] font-semibold text-[#111827] dark:text-gray-100 m-0 truncate">
                            {user.name}
                          </p>
                          <p className="text-[0.72rem] text-gray-400 m-0 truncate">
                            {user.email}
                          </p>
                          <span className="text-[0.65rem] font-bold px-[7px] py-[2px] rounded-full bg-[#eff2ff] text-blue-600 inline-block mt-1">
                            {user.role ?? "USER"}
                          </span>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 w-full px-[10px] py-[7px] border-none bg-transparent rounded-[7px] cursor-pointer text-[0.83rem] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all font-[inherit]"
                          id="header-logout-btn"
                          data-testid="header-logout-btn"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Not logged in: Login button */
                  <Button asChild size="sm" variant="default">
                    <Link href="/login" prefetch={false}>
                      Login
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </nav>
      </nav>
    </header>
  );
};

export default Header;
