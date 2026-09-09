import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSmtpTransport, getSmtpFromAddress } from "@/lib/smtp";
import { renderEmailHtml } from "@/lib/email-template";
import type { TriggerType, ActionType } from "@/lib/automation/types";

export type AutomationTriggerPayload = {
  organizationId: string;
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
  [key: string]: unknown;
};

type ActionResult = {
  actionId: string;
  actionType: string;
  ok: boolean;
  error?: string;
};

// Executes a single automation action. Throws on failure; the caller records
// the error into the run's result log instead of letting it propagate, so
// one bad action doesn't stop the rest of the chain or the triggering
// mutation (e.g. creating a contact must succeed even if a misconfigured
// automation attached to it fails).
async function executeAction(
  actionType: string,
  config: Record<string, unknown>,
  payload: AutomationTriggerPayload,
): Promise<void> {
  switch (actionType as ActionType) {
    case "create_task": {
      const title = typeof config.title === "string" && config.title ? config.title : "Tarefa automática";
      await prisma.task.create({
        data: {
          organizationId: payload.organizationId,
          contactId: payload.contactId ?? null,
          companyId: payload.companyId ?? null,
          dealId: payload.dealId ?? null,
          title,
        },
      });
      return;
    }
    case "create_activity": {
      const content =
        typeof config.content === "string" && config.content ? config.content : "Atividade automática";
      await prisma.activity.create({
        data: {
          organizationId: payload.organizationId,
          contactId: payload.contactId ?? null,
          companyId: payload.companyId ?? null,
          dealId: payload.dealId ?? null,
          type: "NOTE",
          content,
        },
      });
      return;
    }
    case "send_email": {
      if (!payload.contactId) {
        throw new Error("Sem contacto associado ao evento — não há destinatário.");
      }
      const [contact, organization] = await Promise.all([
        prisma.contact.findUnique({ where: { id: payload.contactId } }),
        prisma.organization.findUnique({ where: { id: payload.organizationId } }),
      ]);
      if (!contact?.email) {
        throw new Error("O contacto associado não tem email.");
      }
      if (!organization) {
        throw new Error("Organização não encontrada.");
      }

      const subject = typeof config.subject === "string" && config.subject ? config.subject : "Nexa";
      const body = typeof config.body === "string" ? config.body : "";

      const transport = getSmtpTransport(organization);
      const fromAddress = getSmtpFromAddress(organization);

      let status: "SENT" | "FAILED" = "SENT";
      let error: string | null = null;

      if (!transport || !fromAddress) {
        status = "FAILED";
        error = "SMTP não configurado.";
      } else {
        try {
          await transport.sendMail({
            from: fromAddress,
            to: contact.email,
            subject,
            text: body,
            html: renderEmailHtml({ subject, body }),
          });
        } catch (err) {
          status = "FAILED";
          error = err instanceof Error ? err.message : "Erro desconhecido ao enviar email.";
        }
      }

      await prisma.emailMessage.create({
        data: {
          organizationId: payload.organizationId,
          contactId: payload.contactId,
          dealId: payload.dealId ?? null,
          fromAddress: fromAddress ?? "unknown",
          toAddress: contact.email,
          subject,
          body,
          status,
          error,
        },
      });

      if (status === "FAILED") {
        throw new Error(error ?? "Falha ao enviar email.");
      }
      return;
    }
    default:
      throw new Error(`Tipo de ação desconhecido: ${actionType}`);
  }
}

// Finds every enabled automation in the org matching `triggerType` and runs
// its actions in order, recording one AutomationRun per automation. Never
// throws — automation failures must not break the mutation that triggered
// them (e.g. contact creation).
export async function runAutomationsForTrigger(
  triggerType: TriggerType,
  payload: AutomationTriggerPayload,
): Promise<void> {
  const automations = await prisma.automation.findMany({
    where: { organizationId: payload.organizationId, triggerType, enabled: true, deletedAt: null },
    include: { actions: { orderBy: { order: "asc" } } },
  });

  for (const automation of automations) {
    const results: ActionResult[] = [];
    let runStatus: "SUCCESS" | "FAILED" = "SUCCESS";
    let firstError: string | null = null;

    for (const action of automation.actions) {
      try {
        await executeAction(action.actionType, action.actionConfig as Record<string, unknown>, payload);
        results.push({ actionId: action.id, actionType: action.actionType, ok: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido.";
        results.push({ actionId: action.id, actionType: action.actionType, ok: false, error: message });
        runStatus = "FAILED";
        firstError ??= message;
      }
    }

    await prisma.automationRun.create({
      data: {
        automationId: automation.id,
        organizationId: payload.organizationId,
        status: runStatus,
        triggerPayload: payload as Prisma.InputJsonValue,
        resultLog: results as unknown as Prisma.InputJsonValue,
        error: firstError,
      },
    });
  }
}
