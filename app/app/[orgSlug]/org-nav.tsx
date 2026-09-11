"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

// Primary items are the ones a solo, time-poor user needs constantly and
// always sees; secondary items (Companies, Activities, Email, Automations,
// Campaigns, Segments, Trash, Settings) are real but occasional, so they're
// tucked behind "More" instead of competing for the same row/thumb reach.
//
// Both dropdowns are plain React state, not <details> — <details> content
// with an explicit CSS `display` on it renders (and lays out, in Chromium)
// even while closed, silently breaking the toggle. State + [hidden] avoids
// that entirely.
function NavDropdown({
  label,
  items,
  pathname,
  align,
  className,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  align: "left" | "right";
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasActive = items.some((item) => isActive(pathname, item.href));

  // Close on navigation. Not an effect: this is React's documented pattern
  // for "adjusting state when a prop changes" — a render-time comparison
  // against state (never a ref, which can't be read/written during render)
  // avoids the extra cascading render an effect-based reset would cause.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={className} ref={ref}>
      <button
        type="button"
        className="nav-dropdown-trigger"
        aria-expanded={open}
        aria-current={hasActive ? "page" : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      <div className={`nav-dropdown-menu nav-dropdown-${align}`} hidden={!open}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OrgNav({
  orgSlug,
  orgName,
  primaryItems,
  secondaryItems,
  moreLabel,
  menuLabel,
}: {
  orgSlug: string;
  orgName: string;
  primaryItems: NavItem[];
  secondaryItems: NavItem[];
  moreLabel: string;
  menuLabel: string;
}) {
  const pathname = usePathname();
  const dashboardHref = `/app/${orgSlug}`;
  const allItems = [...primaryItems, ...secondaryItems];

  return (
    <nav className="nav" style={{ borderBottomWidth: "1px" }}>
      <Link
        href={dashboardHref}
        className="nav-brand"
        style={{ fontSize: "14px" }}
        aria-current={pathname === dashboardHref ? "page" : undefined}
      >
        {orgName}
      </Link>

      {/* Desktop / tablet: primary items inline + a "More" dropdown. */}
      <div className="nav-desktop">
        {primaryItems.map((item) => (
          <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
        {secondaryItems.length > 0 && (
          <NavDropdown
            label={moreLabel}
            items={secondaryItems}
            pathname={pathname}
            align="right"
            className="nav-more"
          />
        )}
      </div>

      {/* Mobile: everything behind one hamburger, in priority order. */}
      <NavDropdown
        label={menuLabel}
        items={allItems}
        pathname={pathname}
        align="right"
        className="nav-mobile"
      />
    </nav>
  );
}
