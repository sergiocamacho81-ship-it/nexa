import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { LocaleSwitcher } from "@/app/locale-switcher";

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LocaleSwitcher />
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
