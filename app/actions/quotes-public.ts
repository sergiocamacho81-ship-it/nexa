"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAllowedQuoteStatusTransition } from "@/lib/quote-statuses";

// Everything in this file is reachable with NO authentication — gated only
// by possession of the random acceptanceToken mailed to the customer (see
// sendQuoteEmail in app/actions/quotes.ts). Never call getOrgForCurrentUser
// or trust an organizationId/quoteId from the caller here; the token is the
// only credential. Kept in a separate file from app/actions/quotes.ts so
// this trust boundary is obvious at a glance.
export async function getQuoteByToken(token: string) {
  return prisma.quote.findFirst({
    where: { acceptanceToken: token, deletedAt: null },
    include: {
      organization: { select: { name: true } },
      company: { select: { name: true } },
      contact: { select: { firstName: true, lastName: true } },
      lineItems: { orderBy: { position: "asc" } },
    },
  });
}

async function respondToQuote(token: string, response: "ACCEPTED" | "DECLINED") {
  const quote = await prisma.quote.findFirst({
    where: { acceptanceToken: token, deletedAt: null },
    select: { id: true, status: true },
  });
  // Silently no-op on an unknown token, an already-resolved quote, or an
  // illegal transition (e.g. a quote recalled to DRAFT after being sent) —
  // the page re-renders from the quote's actual current status either way,
  // so a double-submit or a stale tab never needs its own error path.
  if (!quote || !isAllowedQuoteStatusTransition(quote.status, response)) {
    return;
  }

  await prisma.quote.update({ where: { id: quote.id }, data: { status: response } });
  revalidatePath(`/quote/${token}`);
}

export async function acceptQuotePublic(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  await respondToQuote(token, "ACCEPTED");
}

export async function declineQuotePublic(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  await respondToQuote(token, "DECLINED");
}
