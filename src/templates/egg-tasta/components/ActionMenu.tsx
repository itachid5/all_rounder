"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import Link from "next/link";

export interface ActionMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'danger';
  requiredPermission?: string;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

import { usePermission } from "@/shared/components/permission-context";

export function ActionMenu({ items }: ActionMenuProps) {
  const { hasPermission } = usePermission();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.filter(item => !item.requiredPermission || hasPermission(item.requiredPermission));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Also close on scroll to prevent detached menus
      document.addEventListener("scroll", () => setIsOpen(false), true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", () => setIsOpen(false), true);
    };
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  };

  const dropdown = isOpen ? (
    <div
      ref={menuRef}
      className="absolute mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-[9999] transform transition-all"
      style={{
        top: `${coords.top}px`,
        // Position right-aligned to the button
        left: `${coords.left}px`,
        transform: 'translateX(-100%)'
      }}
    >
      <div className="py-1" role="menu" aria-orientation="vertical">
        {visibleItems.map((item, index) => {
          const className = `group flex items-center w-full px-4 py-2 text-sm transition-colors ${
            item.variant === 'danger'
              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`;

          const content = (
            <>
              <span className={`mr-3 h-4 w-4 shrink-0 flex items-center justify-center ${item.variant === 'danger' ? 'text-red-500 dark:text-red-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-400 dark:group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              {item.label}
            </>
          );

          if (item.href) {
            return (
              <Link
                key={index}
                href={item.href}
                className={className}
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                item.onClick?.();
              }}
              className={className}
              role="menuitem"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  if (visibleItems.length === 0) return null;

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900"
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Actions"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}
