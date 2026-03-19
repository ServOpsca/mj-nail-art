import { Resend } from 'resend';
import { supabase } from '../../../lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    // ✅ Next.js App Router automatically parses JSON — no Content-Type workaround needed here.
    // The fix is on the CLIENT side (page.js): fetch must send Content-Type: application/json
    const { name, surname, email, service, date, phone, notes } = await req.json();
    const clientName = `${name} ${surname || ''}`.trim();
    const formattedDate = date ? new Date(date).toLocaleString('en-CA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : 'Date not specified';

    // 1. Save booking to Supabase
    const { error: dbError } = await supabase
      .from('bookings')
      .insert([{
        client_name: clientName,
        email,
        phone: phone || null,
        service,
        booking_date: date || null,
        notes: notes || null,
      }]);

    if (dbError) console.error('Database Save Error:', dbError);

    // 2. Notify MJ (studio owner)
    await resend.emails.send({
      from: 'MJ Nail Art <onboarding@resend.dev>',
      to: [process.env.STUDIO_EMAIL || 'your-email@gmail.com'],
      subject: `✨ New Booking: ${service}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; padding: 32px; background: #faf9f6;">
          <h2 style="font-weight: 300; letter-spacing: 0.1em; color: #1c1510; margin-bottom: 24px;">New Booking Request</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #7d6e5f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Client</td>
                <td style="padding: 8px 0; color: #1c1510;">${clientName}</td></tr>
            <tr><td style="padding: 8px 0; color: #7d6e5f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
                <td style="padding: 8px 0; color: #1c1510;">${email}</td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; color: #7d6e5f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Phone</td>
                <td style="padding: 8px 0; color: #1c1510;">${phone}</td></tr>` : ''}
            <tr><td style="padding: 8px 0; color: #7d6e5f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Service</td>
                <td style="padding: 8px 0; color: #1c1510;">${service}</td></tr>
            <tr><td style="padding: 8px 0; color: #7d6e5f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Date</td>
                <td style="padding: 8px 0; color: #1c1510;">${formattedDate}</td></tr>
            ${notes ? `<tr><td style="padding: 8px 0; color: #7d6e5f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">Notes</td>
                <td style="padding: 8px 0; color: #1c1510;">${notes}</td></tr>` : ''}
          </table>
        </div>
      `,
    });

    // 3. Confirm to client
    await resend.emails.send({
      from: 'MJ Nail Art <onboarding@resend.dev>',
      to: [email],
      subject: '✨ Your MJ Nail Art Request — Received',
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; padding: 32px; background: #faf9f6;">
          <h1 style="font-weight: 300; letter-spacing: 0.1em; color: #1c1510;">Hi ${name},</h1>
          <p style="color: #7d6e5f; line-height: 1.8;">Your booking request for <strong style="color: #1c1510;">${service}</strong> on <strong style="color: #1c1510;">${formattedDate}</strong> has been received.</p>
          <p style="color: #7d6e5f; line-height: 1.8;">I'll reach out shortly via text or email to confirm your appointment. Can't wait to create something beautiful for you! ✨</p>
          <p style="color: #c9a46e; font-style: italic; margin-top: 24px;">— MJ</p>
        </div>
      `,
    });

    return Response.json({ success: true });

  } catch (err) {
    console.error('API Error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
