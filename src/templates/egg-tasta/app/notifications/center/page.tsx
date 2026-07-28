"use client";

import React, { useState } from "react";
import { Bell, Info, CheckCircle, AlertTriangle, XCircle, Search, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, EmptyState } from "@/templates/egg-tasta/components";

export default function NotificationCenterPage() {
  const [filter, setFilter] = useState("all");

  const notifications = [
    { id: 1, type: "error", title: "Low Stock Alert", message: "Premium Brown Eggs are out of stock.", time: "10 mins ago", read: false },
    { id: 2, type: "warning", title: "Supplier Due Reminder", message: "Payment of $1,200 due to ABC Farms.", time: "2 hours ago", read: false },
    { id: 3, type: "success", title: "Backup Successful", message: "Daily database backup completed successfully.", time: "1 day ago", read: true },
    { id: 4, type: "info", title: "System Update", message: "New features added to the Reports module.", time: "2 days ago", read: true },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="h-5 w-5 text-rose-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "success": return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Notifications</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Center</span>
        </nav>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Notification Center</h1>
          <Button variant="outline" size="sm">Mark All as Read</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["all", "unread", "info", "success", "warning", "error"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize whitespace-nowrap transition-colors ${
                filter === f 
                  ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState title="All Caught Up!" description="You have no new notifications." icon={Bell} />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 flex gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              >
                <div className="mt-1 flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-medium ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">{notif.time}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{notif.message}</p>
                  <div className="flex gap-3">
                    {!notif.read && (
                      <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        Mark as Read
                      </button>
                    )}
                    <button className="text-xs font-medium text-slate-500 hover:text-rose-600 hover:underline flex items-center">
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </button>
                  </div>
                </div>
                {!notif.read && (
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
