"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function OrgNav({
  orgSlug,
  orgName,
  items,
}: {
  orgSlug: string;
  orgName: string;
  items: NavItem[];
}) {
  const pathname = usePathname();
  const dashboardHref = `/app/${orgSlug}`;

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
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
