// Branded HTML wrapper for outbound emails, matching the Modernist design
// system (Corporate Brand Assets): flat, zero radius, red accent bar,
// Archivo-esque wordmark. Email clients strip web fonts and most CSS, so
// this uses table layout, inline styles and a web-safe font stack only.
export function renderEmailHtml({ subject, body }: { subject: string; body: string }): string {
  const escapedBody = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split("\n")
    .join("<br>");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f3f2f2;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f2f2;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;">
            <tr>
              <td style="background:#201e1d;padding:20px 24px;">
                <span style="font-family:Helvetica,Arial,sans-serif;font-weight:700;font-size:18px;letter-spacing:0.4px;color:#f3f2f2;">VINGELIS</span>
              </td>
            </tr>
            <tr>
              <td style="height:6px;background:#ec3013;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 24px;">
                <h1 style="margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#201e1d;">${subject}</h1>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#201e1d;">${escapedBody}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:2px solid rgba(32,30,29,0.15);">
                <span style="font-size:11px;color:rgba(32,30,29,0.55);">Enviado via Continuo &middot; Vingelis</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
