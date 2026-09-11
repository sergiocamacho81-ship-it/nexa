"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteProduct } from "@/app/actions/products";

export function DeleteProductButton({ orgSlug, productId }: { orgSlug: string; productId: string }) {
  const t = useTranslations("Products");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="btn btn-ghost"
      onClick={() => {
        const formData = new FormData();
        formData.set("orgSlug", orgSlug);
        formData.set("productId", productId);
        startTransition(() => deleteProduct(formData));
      }}
    >
      {t("remove")}
    </button>
  );
}
