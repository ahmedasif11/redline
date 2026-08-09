import { Resend } from 'resend';
import { BRAND } from '@/lib/brand';
import type { Order } from './types';
import { formatCents } from './money';

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendOrderConfirmation(order: Order): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.info(
      `[commerce] Resend not configured — skipping confirmation for ${order.id}`
    );
    return false;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from =
    process.env.RESEND_FROM_EMAIL ?? `${BRAND.name} <onboarding@resend.dev>`;

  const lines = order.items
    .map(
      (item) =>
        `<li>${item.name} — ${item.selectedColor} / US ${item.selectedSize} × ${item.quantity} — ${formatCents(item.lineTotalCents)}</li>`
    )
    .join('');

  const { error } = await resend.emails.send({
    from,
    to: order.shipping.email,
    subject: `${BRAND.name} order confirmed — ${order.id}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px;">
        <h1 style="color:#E3002C;">${BRAND.name}</h1>
        <p>Thanks ${order.shipping.fullName} — your order is confirmed.</p>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <ul>${lines}</ul>
        <p><strong>Total:</strong> ${formatCents(order.totals.totalCents)}</p>
        <p>Ships to ${order.shipping.line1}, ${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}.</p>
      </div>
    `,
  });

  if (error) {
    console.error('[commerce] Resend error', error);
    return false;
  }

  return true;
}
