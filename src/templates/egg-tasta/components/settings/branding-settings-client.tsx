"use client";

import React, { useState, useRef } from "react";
import { 
  Building2, Upload, Trash2, RefreshCw, Check, AlertCircle, Image as ImageIcon, Sparkles, Globe 
} from "lucide-react";
import { updateTenantBrandingAction, resetTenantBrandingAction, TenantBrandingData } from "@/shared/actions/branding";

interface BrandingSettingsClientProps {
  initialBranding: TenantBrandingData;
}

export function BrandingSettingsClient({ initialBranding }: BrandingSettingsClientProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialBranding.logoUrl || null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(initialBranding.faviconUrl || null);
  const [iconUrl, setIconUrl] = useState<string | null>(initialBranding.iconUrl || null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialBranding.bannerUrl || null);

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void,
    maxSizeMb: number,
    allowedTypes: string[]
  ) => {
    setMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      setMessage({
        type: "error",
        text: `File size exceeds maximum limit of ${maxSizeMb}MB.`
      });
      return;
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    const isTypeValid = allowedTypes.some(
      (type) => file.type.includes(type) || fileExt === type
    );

    if (!isTypeValid) {
      setMessage({
        type: "error",
        text: `Invalid file type. Allowed: ${allowedTypes.join(", ").toUpperCase()}`
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setter(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const res = await updateTenantBrandingAction({
      logoUrl,
      faviconUrl,
      iconUrl,
      bannerUrl
    });

    setSaving(false);

    if (res.success) {
      setMessage({ type: "success", text: "Business branding saved successfully!" });
      
      // Update browser favicon dynamically if custom favicon exists
      if (faviconUrl) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "shortcut icon";
          document.getElementsByTagName("head")[0].appendChild(link);
        }
        link.href = faviconUrl;
      }
    } else {
      setMessage({ type: "error", text: res.error || "Failed to save branding." });
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all branding assets to default?")) return;

    setResetting(true);
    setMessage(null);

    const res = await resetTenantBrandingAction();
    setResetting(false);

    if (res.success) {
      setLogoUrl(null);
      setFaviconUrl(null);
      setIconUrl(null);
      setBannerUrl(null);
      setMessage({ type: "success", text: "Branding reset to platform default!" });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to reset branding." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border animate-in fade-in duration-200 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Grid of Branding Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Business Logo */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Business Logo</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Used in sidebars, header, invoices, and receipts. (PNG, JPG, SVG, WebP, max 5MB)
                </p>
              </div>
            </div>

            {/* Preview Box */}
            <div className="min-h-36 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-4 relative group">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Business Logo"
                  className="max-h-24 max-w-full object-contain rounded"
                />
              ) : (
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">No custom logo uploaded</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <input
              type="file"
              ref={logoInputRef}
              className="hidden"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => handleFileSelect(e, setLogoUrl, 5, ["png", "jpeg", "jpg", "svg", "webp"])}
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{logoUrl ? "Replace Logo" : "Upload Logo"}</span>
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl(null)}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                title="Remove Logo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Browser Favicon */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Browser Favicon</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Appears in browser tab. (ICO, PNG, SVG, max 2MB)
                </p>
              </div>
            </div>

            {/* Preview Box */}
            <div className="min-h-36 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-4 relative">
              {faviconUrl ? (
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Tab Favicon Preview
                  </span>
                </div>
              ) : (
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <Globe className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">Default ERP Favicon active</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <input
              type="file"
              ref={faviconInputRef}
              className="hidden"
              accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
              onChange={(e) => handleFileSelect(e, setFaviconUrl, 2, ["ico", "png", "svg", "x-icon"])}
            />
            <button
              type="button"
              onClick={() => faviconInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{faviconUrl ? "Replace Favicon" : "Upload Favicon"}</span>
            </button>
            {faviconUrl && (
              <button
                type="button"
                onClick={() => setFaviconUrl(null)}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                title="Remove Favicon"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Business Icon */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Square Business Icon</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Used for mobile avatars, app icons, and compact badges. (PNG, JPG, SVG, max 2MB)
                </p>
              </div>
            </div>

            {/* Preview Box */}
            <div className="min-h-36 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-4">
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt="Business Icon"
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                />
              ) : (
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">No square icon uploaded</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <input
              type="file"
              ref={iconInputRef}
              className="hidden"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => handleFileSelect(e, setIconUrl, 2, ["png", "jpeg", "jpg", "svg", "webp"])}
            />
            <button
              type="button"
              onClick={() => iconInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 hover:bg-purple-100 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{iconUrl ? "Replace Icon" : "Upload Icon"}</span>
            </button>
            {iconUrl && (
              <button
                type="button"
                onClick={() => setIconUrl(null)}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                title="Remove Icon"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* 4. Business Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Business Banner</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Used on login page & document export headers. (PNG, JPG, SVG, max 10MB)
                </p>
              </div>
            </div>

            {/* Preview Box */}
            <div className="min-h-36 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-2">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Business Banner"
                  className="h-28 w-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">No banner uploaded</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <input
              type="file"
              ref={bannerInputRef}
              className="hidden"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => handleFileSelect(e, setBannerUrl, 10, ["png", "jpeg", "jpg", "svg", "webp"])}
            />
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{bannerUrl ? "Replace Banner" : "Upload Banner"}</span>
            </button>
            {bannerUrl && (
              <button
                type="button"
                onClick={() => setBannerUrl(null)}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                title="Remove Banner"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting || saving}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${resetting ? "animate-spin" : ""}`} />
          <span>Reset to Default</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || resetting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
