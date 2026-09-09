"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { signIn, signUp } from "@/app/actions/auth";

export function LoginForm() {
  const searchParams = useSearchParams();
  const checkEmail = searchParams.get("checkEmail") === "1";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = mode === "signin" ? signIn : signUp;
      const result = await action(formData);
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="card elev-md w-full max-w-sm">
      <Image src="/logo-mark.svg" alt="Vingelis" width={40} height={40} />
      <div>
        <h1 className="mb-0">Nexa</h1>
        <p className="text-muted text-sm">
          {mode === "signin" ? "Entra na tua conta" : "Cria uma conta"}
        </p>
      </div>

      {checkEmail && (
        <p className="tag tag-accent">Verifica o teu email para confirmares a conta.</p>
      )}

      <form action={handleSubmit} className="flex flex-col gap-3">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="input"
          />
        </div>

        {error && <p className="text-sm" style={{ color: "var(--color-accent-700)" }}>{error}</p>}

        <button type="submit" disabled={isPending} className="btn btn-primary btn-block">
          {isPending ? "Aguarda..." : mode === "signin" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="btn btn-ghost"
      >
        {mode === "signin" ? "Ainda não tens conta? Regista-te" : "Já tens conta? Entra"}
      </button>
    </div>
  );
}
