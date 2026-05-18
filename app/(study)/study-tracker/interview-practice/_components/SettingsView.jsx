"use client";

import {
  AlertCircle,
  Check,
  Trash2,
  KeyRound,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-[#eef0f3] bg-[#fafbfc] p-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.7px] text-gray-400 m-0">
        {label}
      </p>
      <p className="font-mono text-xl font-bold text-[#111827] m-0 mt-1">
        {value}
      </p>
    </div>
  );
}

export default function SettingsView({
  usage,
  usageLoading,
  usageError,
  accessHint,
  hasLocalKey,
  maskedKey,
  keyInput,
  setKeyInput,
  onSaveKey,
  onRemoveKey,
  showDeepgramSettings,
  showBuyCard,
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4">
      <section className="bg-white border border-[#e9eaed] rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#1f2937] m-0">
              Free Interview Usage
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Platform key access is limited to two 10 minute interviews.
            </p>
          </div>
          <Badge className="bg-[#eff2ff] text-blue-600 border-transparent">
            {usage?.plan ?? "FREE"}
          </Badge>
        </div>

        {usageError ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={15} />
            {usageError}
          </div>
        ) : usageLoading && !usage ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={15} className="animate-spin" />
            Loading usage...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <Metric
              label="Limit"
              value={usage?.platformFreeInterviewsLimit ?? 2}
            />
            <Metric
              label="Used"
              value={usage?.platformFreeInterviewsUsed ?? 0}
            />
            <Metric
              label="Left"
              value={usage?.platformFreeInterviewsRemaining ?? 0}
            />
          </div>
        )}

        <div className="mt-4 rounded-lg border border-[#e9eaed] bg-white px-3 py-3 text-sm text-gray-600">
          {accessHint}
        </div>
      </section>

      {showDeepgramSettings ? (
        <section className="bg-white border border-[#e9eaed] rounded-xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#1f2937] m-0">
                Local Deepgram Key
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Stored only in this browser and sent only for an active user-key
                call.
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#f8fafc] border border-[#e9eaed] text-gray-500 flex items-center justify-center">
              <KeyRound size={17} />
            </div>
          </div>

          <div className="rounded-lg border border-[#eef0f3] bg-[#fafbfc] px-3 py-3 mb-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${hasLocalKey ? "bg-green-500" : "bg-gray-300"}`}
              />
              <p className="text-sm font-medium text-[#1f2937] m-0">
                {hasLocalKey ? "Local key saved" : "No local key saved"}
              </p>
            </div>
            {hasLocalKey && (
              <p className="text-xs text-gray-500 mt-1 mb-0">{maskedKey}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deepgram-local-key">Deepgram API key</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="deepgram-local-key"
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste your Deepgram API key"
                autoComplete="off"
              />
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={onSaveKey}
              >
                <Check size={15} />
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-red-600 hover:text-red-700 dark:text-red-500"
                onClick={onRemoveKey}
                disabled={!hasLocalKey}
              >
                <Trash2 size={15} />
                Remove
              </Button>
            </div>
            <p className="text-xs text-gray-500 m-0">
              This key is not sent to `/api/interview-practice/*` and is not
              saved in the database.
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-[#fed7aa] bg-[#fff7ed] p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white text-orange-600 flex items-center justify-center shrink-0">
                <ShoppingCart size={17} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1f2937] m-0">
                  Buy Interviews
                </h3>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Paid interview packs are planned after the realtime V1 flow is
                  stable.
                </p>
                <Button type="button" variant="outline" disabled>
                  Coming soon
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        showBuyCard && (
          <section className="bg-white border border-[#e9eaed] rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-[#1f2937] m-0">
                  Buy Interviews
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Paid interview packs are planned after the realtime V1 flow is
                  stable.
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#fff7ed] border border-[#fce7d6] text-amber-600 flex items-center justify-center">
                <ShoppingCart size={17} />
              </div>
            </div>

            <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-6 text-sm text-amber-900 mb-4">
              <p className="mb-3">
                Buy more interviews to extend your practice.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 bg-amber-400 text-white px-3 py-1.5 rounded-md opacity-90 cursor-not-allowed"
                >
                  Coming soon
                </button>
                <button
                  type="button"
                  disabled
                  className="text-sm text-amber-700 underline underline-offset-2 opacity-60 cursor-not-allowed"
                >
                  Notify me
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              This feature will be enabled once billing is available.
            </div>
          </section>
        )
      )}
    </div>
  );
}
