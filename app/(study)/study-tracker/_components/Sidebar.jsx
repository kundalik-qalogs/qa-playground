"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LogIn,
  LogOut,
} from "lucide-react";
import { useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getSyllabusStats } from "@/lib/studyTrackerStorage";
import { useTracker } from "./StudyTrackerProvider";
import { cn } from "@/lib/utils";
import NavBtn from "./NavBtn";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "📊",
    href: "/study-tracker/dashboard",
  },
  {
    id: "daily",
    label: "Daily Tracker",
    icon: "📅",
    href: "/study-tracker/daily-tracker",
  },
  {
    id: "syllabi",
    label: "Syllabus Manager",
    icon: "📚",
    href: "/study-tracker/syllabus",
  },
  {
    id: "resources",
    label: "Resources",
    icon: "🔖",
    href: "/study-tracker/resources",
  },
  {
    id: "interview-practice",
    label: "Interview Practice",
    icon: "IV",
    href: "/study-tracker/interview-practice",
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { state, user } = useTracker();
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    setProfileOpen(false);
    router.push("/login");
  };

  const handleProfileBlur = (e) => {
    if (profileRef.current && !profileRef.current.contains(e.relatedTarget)) {
      setProfileOpen(false);
    }
  };

  return (
    <nav
      className={cn(
        "bg-white border-r border-[#e9eaed] flex flex-col h-full z-40 flex-shrink-0 transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[64px] min-w-[64px]" : "w-[252px] min-w-[252px]",
      )}
    >
      {/* Top bar with toggle trigger */}
      <div
        className={cn(
          "flex items-center border-b border-[#e9eaed] px-[10px] py-[10px] flex-shrink-0",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <span className="text-[0.72rem] font-bold tracking-[1.2px] text-[#6b7280] uppercase select-none px-[2px] ml-2">
            Study Tracker
          </span>
        )}
        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-7 h-7 flex items-center justify-center rounded-[6px] border-none bg-transparent cursor-pointer text-[#6b7280] hover:bg-gray-100 hover:text-[#111827] transition-all flex-shrink-0"
        >
          {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        </button>
      </div>

      {/* Nav items — scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        <ul className="list-none m-0 px-[10px] py-[10px]">
          {NAV_ITEMS.map((item) => (
            <NavBtn
              key={item.id}
              href={item.href}
              label={item.label}
              icon={item.icon}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}

          {state && (
            <>
              {!collapsed && (
                <li>
                  <span className="block text-[0.67rem] font-semibold tracking-[1.2px] text-[#c1c7d0] pt-[14px] pb-[5px] px-[10px] uppercase">
                    Syllabi
                  </span>
                </li>
              )}
              {collapsed && (
                <li className="border-t border-[#e9eaed] my-[6px]" />
              )}
              {Object.values(state.syllabi).map((syl) => {
                const stats = getSyllabusStats(
                  state.syllabi,
                  state.progress,
                  syl.id,
                );
                return (
                  <NavBtn
                    key={syl.id}
                    href={`/study-tracker/syllabus/${syl.id}`}
                    label={syl.label}
                    icon={syl.icon}
                    pathname={pathname}
                    badge={stats.pct + "%"}
                    badgeStyle={{
                      background: syl.color + "22",
                      color: syl.color,
                    }}
                    collapsed={collapsed}
                  />
                );
              })}
            </>
          )}
        </ul>
      </div>

      {/* Sidebar footer — login / user profile (outside scroll so dropdown isn't clipped) */}
      <div className="border-t border-[#e9eaed] p-[10px] flex-shrink-0">
        {user ? (
          <div ref={profileRef} className="relative" onBlur={handleProfileBlur}>
            <button
              className={cn(
                "flex items-center gap-[9px] px-[10px] py-[9px] rounded-lg w-full border-none bg-transparent cursor-pointer text-sm font-medium text-gray-600 text-left transition-all hover:bg-gray-100 hover:text-[#1a1d23]",
                collapsed && "justify-center px-0",
              )}
              onClick={() => setProfileOpen((o) => !o)}
              id="user-profile-btn"
              data-testid="user-profile-btn"
              title={collapsed ? (user.name ?? "Profile") : undefined}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-[0.75rem] font-bold flex items-center justify-center flex-shrink-0">
                {user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.8rem] font-semibold text-[#111827] truncate">
                      {user.name}
                    </div>
                    <div className="text-[0.7rem] text-gray-400 truncate">
                      {user.email}
                    </div>
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-gray-400 flex-shrink-0 transition-transform duration-150",
                      profileOpen && "rotate-180",
                    )}
                  />
                </>
              )}
            </button>

            {profileOpen && (
              <div
                className="absolute bottom-[calc(100%+6px)] bg-white border border-gray-200 rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.10)] p-2 z-50"
                style={
                  collapsed
                    ? { left: "100%", marginLeft: 8, minWidth: 200 }
                    : { left: 0, right: 0, minWidth: 160 }
                }
                id="user-profile-dropdown"
                data-testid="user-profile-dropdown"
              >
                <div className="px-[10px] pt-2 pb-[10px] border-b border-gray-100 mb-[6px]">
                  <p className="text-[0.8rem] font-semibold text-[#111827] m-0">
                    {user.name}
                  </p>
                  <p className="text-[0.72rem] text-gray-500 m-0">
                    {user.email}
                  </p>
                  <span className="text-[0.65rem] font-bold px-[7px] py-[2px] rounded-full bg-[#eff2ff] text-blue-600 inline-block mt-1">
                    {user.role ?? "USER"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-[10px] py-2 border-none bg-transparent rounded-[7px] cursor-pointer text-sm font-medium text-red-600 hover:bg-red-50 transition-all font-[inherit]"
                  id="logout-btn"
                  data-testid="logout-btn"
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/login"
            className={cn(
              "flex items-center gap-[9px] px-[10px] py-[9px] rounded-lg w-full border border-[#e5e7eb] bg-[#f9fafb] cursor-pointer text-sm font-medium text-[#374151] no-underline transition-all hover:bg-gray-100 hover:text-[#1a1d23]",
              collapsed && "justify-center px-0",
            )}
            id="sidebar-login-btn"
            data-testid="sidebar-login-btn"
            title={collapsed ? "Sign In" : undefined}
          >
            <LogIn size={15} />
            {!collapsed && "Sign In"}
          </a>
        )}
      </div>
    </nav>
  );
}
