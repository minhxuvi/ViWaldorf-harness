"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Languages,
  Menu,
  X,
  HardDrive,
} from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, setLang, t, isLocalFolderLinked } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navGarden = [
    { href: "/", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/story", label: t.nav.story, icon: BookOpen },
    { href: "/schedule", label: t.nav.schedule, icon: Calendar },
    { href: "/documents", label: t.nav.documents, icon: FileText },
  ];

  const navHelp = [
    { href: "/chat", label: t.nav.chat, icon: MessageSquare },
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  const toggleLanguage = () => {
    setLang(lang === "en" ? "vi" : "en");
  };

  const NavItem = ({
    item,
    onClick,
  }: {
    item: { href: string; label: string; icon: any };
    onClick?: () => void;
  }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-[#3A6B47] text-white shadow-sm font-semibold"
            : "text-[#DFEADB] hover:bg-[#254A2E] hover:text-white"
        }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#A8C7A0]"}`} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* Desktop Sidebar (Width 250px, deep forest green #1E4028) */}
      <aside className="hidden md:flex flex-col w-[250px] bg-forestDark text-[#E9F0E4] p-5 sticky top-0 h-screen overflow-y-auto flex-shrink-0 border-r border-[#2D4D36]">
        {/* Brand Header */}
        <div className="mb-6 pb-4 border-b border-[#2F523A]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wide text-paper">
                ViWaldorf
              </h1>
              <p className="text-xs text-[#BFD3B8] font-sans mt-0.5">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 space-y-6">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[#8EB285] px-2 mb-2">
              {t.nav.gardenGroup}
            </p>
            <nav className="space-y-1">
              {navGarden.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[#8EB285] px-2 mb-2">
              {t.nav.helpGroup}
            </p>
            <nav className="space-y-1">
              {navHelp.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </nav>
          </div>
        </div>

        {/* Footer: Language Switcher & Local Sync Status */}
        <div className="pt-4 mt-auto border-t border-[#2F523A] space-y-2.5">
          {/* Sync indicator */}
          <div className="flex items-center gap-2 px-2 py-1 text-xs text-[#BFD3B8]">
            <HardDrive
              className={`w-3.5 h-3.5 ${
                isLocalFolderLinked ? "text-[#85E394]" : "text-[#8A9E85]"
              }`}
            />
            <span>
              {isLocalFolderLinked ? "macOS Folder Linked" : "Local Browser Storage"}
            </span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#254A2E] hover:bg-[#2C5737] text-xs font-semibold text-[#E9F0E4] transition"
          >
            <span className="flex items-center gap-2">
              <Languages className="w-3.5 h-3.5 text-[#E9C46A]" />
              <span>Language</span>
            </span>
            <span className="bg-[#1E4028] px-2 py-0.5 rounded text-[11px] text-[#E9C46A]">
              {lang.toUpperCase()}
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-forestDark text-paper z-40 px-4 py-3 flex items-center justify-between shadow-md">
        <div>
          <h1 className="font-serif text-lg font-bold text-paper">ViWaldorf</h1>
          <p className="text-[10px] text-[#BFD3B8]">{t.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="p-1.5 rounded bg-[#254A2E] text-xs font-semibold text-[#E9C46A]"
            title="Switch Language"
          >
            {lang.toUpperCase()}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded bg-[#254A2E] text-paper"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[54px] bg-forestDark text-paper z-30 p-5 space-y-6 overflow-y-auto">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#8EB285] mb-2">
              {t.nav.gardenGroup}
            </p>
            <nav className="space-y-1">
              {navGarden.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#8EB285] mb-2">
              {t.nav.helpGroup}
            </p>
            <nav className="space-y-1">
              {navHelp.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-1 w-full max-w-[1180px] mx-auto p-4 sm:p-8 pt-16 md:pt-8">
        {children}
      </main>
    </div>
  );
}
