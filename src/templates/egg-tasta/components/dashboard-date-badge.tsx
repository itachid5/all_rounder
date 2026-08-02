"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

export function formatBusinessDate(timezone: string = "Asia/Dhaka", language: string = "en") {
  const now = new Date();
  const localeMap: Record<string, string> = {
    bn: "bn-BD",
    en: "en-GB",
    es: "es-ES",
    fr: "fr-FR",
  };
  const locale = localeMap[language] || (language === "bn" ? "bn-BD" : "en-GB");

  try {
    const formattedDate = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(now);

    const prefix = language === "bn" ? "আজ" : "Today";
    return `${prefix}: ${formattedDate}`;
  } catch (err) {
    const fallbackDate = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(now);
    return `Today: ${fallbackDate}`;
  }
}

export function DashboardDateBadge({ 
  initialDateString,
  timezone = "Asia/Dhaka",
  language = "en"
}: { 
  initialDateString?: string;
  timezone?: string;
  language?: string;
}) {
  const [dateString, setDateString] = useState(initialDateString || formatBusinessDate(timezone, language));

  useEffect(() => {
    // Update every minute to automatically stay updated at midnight in business timezone
    const interval = setInterval(() => {
      setDateString(formatBusinessDate(timezone, language));
    }, 60000);

    return () => clearInterval(interval);
  }, [timezone, language]);

  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40 text-blue-800 dark:text-blue-300 shadow-sm text-sm font-semibold tracking-wide transition-colors">
      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
      <span>{dateString}</span>
    </div>
  );
}
