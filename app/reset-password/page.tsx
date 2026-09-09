import { ResetPasswordForm } from "./reset-password-form";
import { LocaleSwitcher } from "@/app/locale-switcher";

export default function ResetPasswordPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LocaleSwitcher />
      </div>
      <ResetPasswordForm />
    </div>
  );
}
