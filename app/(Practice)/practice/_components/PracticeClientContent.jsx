"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { practiceElements } from "@/data/practiceElements";
import { Button } from "@/components/ui/button";

// Derive link from slug or externalLink
const allElements = practiceElements.map((el) => ({
  ...el,
  Description: el.description,
  link: el.externalLink ?? `/practice/${el.slug}`,
}));

export default function PracticeClientContent() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allElements;
    return allElements.filter(
      (el) =>
        el.title.toLowerCase().includes(q) ||
        el.Description.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div>
      {/* Search bar */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search practice elements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-600"
          aria-label="Search practice elements"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-lg font-semibold mb-1">No elements found</p>
          <p className="text-sm">Try a different search term.</p>
        </div>
      )}

      {/* Card grid */}
      <div
        id="practice-cards-grid"
        data-testid="practice-cards-grid"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
      >
        {filtered.map((el, i) => {
          const cardId = el.cardId ?? el.slug ?? "bank-app";
          const isExternalUrl = /^https?:\/\//.test(el.link);
          return (
            <Link
              key={i}
              href={el.link}
              target={isExternalUrl ? "_blank" : undefined}
              rel={isExternalUrl ? "noopener noreferrer" : undefined}
              prefetch={false}
              id={`card-link-${cardId}`}
              name={`card-link-${cardId}`}
              data-testid={`card-link-${cardId}`}
              data-element={cardId}
              aria-label={`Practice ${el.title} – ${el.Description}`}
              className="block group cursor-pointer"
            >
              <Card
                id={`practice-card-${cardId}`}
                data-testid={`practice-card-${cardId}`}
                data-element-title={el.title}
                className="h-56 transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:scale-105"
              >
                <CardHeader className="flex flex-row items-center justify-between p-1 shadow-lg dark:shadow-md dark:shadow-gray-800 space-y-0">
                  <p className="px-2 text-xl font-semibold">{el.title}</p>
                  {el.isBankDemo && (
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded-full">
                      Bank Demo
                    </span>
                  )}
                  <Image
                    src={el.logo}
                    width={50}
                    height={50}
                    className="p-1"
                    alt=""
                    aria-hidden="true"
                  />
                </CardHeader>
                <CardContent className="p-3 h-28">
                  <p className="py-7 text-base dark:text-gray-200 text-center">
                    {el.Description}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center p-2 border-t">
                  <span className="underline text-blue-600 dark:text-teal-200 font-light group-hover:text-blue-800 dark:group-hover:text-teal-100 transition-colors duration-150">
                    {el.footerTitle}
                  </span>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* mDocks.dev Callout Card */}
      {filtered.length > 0 && (
        <div className="mt-12 pt-8">
          <div className="bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-emerald-600/10 dark:from-blue-600/20 dark:via-cyan-600/20 dark:to-emerald-600/20 border border-blue-200 dark:border-blue-800 rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex-1">
              <p className="text-base font-bold text-foreground mb-1">
                Make Markdown Look Beautiful
              </p>
              <p className="text-sm text-muted-foreground">
                Open README files, notes, guides, and technical docs in a clean
                reader built for Markdown. Try mDocks.dev when raw `.md` files
                deserve a polished view.
              </p>
            </div>
            <Link
              href="https://mdocks.dev"
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors no-underline shadow-sm shadow-blue-500/20 whitespace-nowrap sm:ml-auto"
            >
              View Markdown Better &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
