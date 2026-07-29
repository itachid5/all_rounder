"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Check } from "lucide-react";

export interface ComboboxOption {
  value: string;
  label: string;
  searchTerms?: string[];
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  error?: boolean;
}

export function Combobox({ options, value, onChange, placeholder = "Select...", className = "", disabled = false, id, name, error }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt => {
    const term = searchTerm.toLowerCase();
    if (opt.label.toLowerCase().includes(term)) return true;
    if (opt.searchTerms && opt.searchTerms.some(st => st.toLowerCase().includes(term))) return true;
    return false;
  });

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setHighlightedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        containerRef.current && !containerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", () => setIsOpen(false), true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", () => setIsOpen(false), true);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        toggleOpen();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (listRef.current && isOpen) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const dropdown = isOpen ? (
    <div
      ref={menuRef}
      className="absolute z-[9999] mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${coords.width}px`
      }}
    >
      <div className="flex items-center px-3 py-2 border-b border-slate-100 dark:border-slate-800">
        <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-transparent text-sm focus:outline-none dark:text-white"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      <ul ref={listRef} className="max-h-60 overflow-y-auto py-1 text-sm">
        {filteredOptions.length === 0 ? (
          <li className="px-3 py-2 text-slate-500 text-center">No results found</li>
        ) : (
          filteredOptions.map((opt, index) => (
            <li
              key={opt.value}
              className={`px-3 py-2 cursor-pointer flex items-center justify-between ${index === highlightedIndex ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />}
            </li>
          ))
        )}
      </ul>
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        id={id}
        ref={buttonRef}
        type="button"
        disabled={disabled}
        className={`flex items-center justify-between w-full px-3 py-2 bg-white dark:bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-md text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
      >
        <span className={selectedOption ? "text-slate-900 dark:text-slate-100 truncate pr-2" : "text-slate-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}
