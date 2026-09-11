import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/app/actions/organizations";
import { signOut } from "@/app/actions/auth";
import { LocaleSwitcher } from "@/app/locale-switcher";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const t = await getTranslations("Nav");

  return (
    <div className="flex flex-1 flex-col">
      <nav className="nav">
        <Link href="/app" className="nav-brand">
          <Image src="/logo-mark.svg" alt="Vingelis" width={28} height={28} />
          Nexa
        </Link>
        <span className="text-muted text-sm hidden sm:inline">{user.email}</span>
        <LocaleSwitcher />
        <form action={signOut}>
          <button type="submit" className="btn btn-secondary">
            {t("signOut")}
          </button>
        </form>
      </nav>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
