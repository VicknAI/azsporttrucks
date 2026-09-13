import { EmailMessage } from 'cloudflare:email';
import type { ExecutionContext, SendEmail } from '@cloudflare/workers-types';
import {
  handleQuoteRequest,
  retryNotifications,
  verifyTurnstile,
  type Mail,
  type QuoteEnv,
} from './service';

function base64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const n of bytes) binary += String.fromCharCode(n);
  return btoa(binary);
}
export function emailSender(env: QuoteEnv) {
  return async (mail: Mail) => {
    if (!env.QUOTE_EMAIL) throw new Error('Email unavailable');
    const body = base64(mail.text)
      .match(/.{1,76}/g)!
      .join('\r\n');
    const mime = [
      `From: AZ Sport Trucks <${mail.from}>`,
      `To: ${mail.to}`,
      `Reply-To: ${mail.replyTo}`,
      `Subject: =?UTF-8?B?${base64(mail.subject)}?=`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      body,
    ].join('\r\n');
    await (env.QUOTE_EMAIL as SendEmail).send(
      new EmailMessage(mail.from, mail.to, mime),
    );
  };
}
export default {
  fetch(request: Request, env: QuoteEnv, ctx: ExecutionContext) {
    return handleQuoteRequest(request, env, ctx, {
      sendMail: emailSender(env),
      verifyCaptcha: verifyTurnstile,
    });
  },
  async scheduled(_controller: unknown, env: QuoteEnv) {
    await retryNotifications(env, emailSender(env));
  },
};
