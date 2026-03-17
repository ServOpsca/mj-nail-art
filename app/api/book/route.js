import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { name, email, service, date } = await req.json();

    // 1. Send Notification to YOU (The Admin)
    await resend.emails.send({
      from: 'MJ Nail Art <onboarding@resend.dev>',
      to: ['your-email@gmail.com'], // Replace with your actual email
      subject: `✨ New Booking: ${service}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>New Booking Request</h2>
          <p><strong>Client:</strong> ${name}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Preferred Date:</strong> ${date}</p>
          <p><strong>Contact:</strong> ${email}</p>
        </div>
      `,
    });

    // 2. Send "Thank You" to the CLIENT
    const { data, error } = await resend.emails.send({
      from: 'MJ Nail Art <onboarding@resend.dev>',
      to: [email],
      subject: 'Your MJ Nail Art Booking Request',
      html: `
        <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 10px;">
          <h1 style="font-weight: 100; letter-spacing: 4px; text-transform: uppercase; text-align: center;">MJ Nail Art</h1>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p>Hi ${name},</p>
          <p>Thank you for reaching out! I've received your booking request for <strong>${service}</strong>.</p>
          <p>I am currently reviewing my schedule for <strong>${new Date(date).toLocaleString()}</strong> and will get back to you shortly via this email to confirm your appointment.</p>
          
          <div style="background-color: #faf9f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #888;">Note: This is a request only. Your appointment is not confirmed until you receive a follow-up message from me.</p>
          </div>

          <p>In the meantime, feel free to browse my latest work on Instagram.</p>
          <p>Stay polished,<br /><strong>MJ</strong></p>
        </div>
      `,
    });

    if (error) return Response.json({ error }, { status: 400 });
    return Response.json({ message: "Emails sent successfully", data });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}