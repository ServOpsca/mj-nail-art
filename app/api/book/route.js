import { Resend } from 'resend';
// We climb up 3 levels (../../../) to reach the root, then go into /lib/
import { supabase } from '../../../lib/supabase'; 

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { name, email, service, date } = await req.json();
    const formattedDate = new Date(date).toLocaleString();

    // 1. Save the booking to your Supabase Database
    // This ensures you have a backup if the email fails
    const { error: dbError } = await supabase
      .from('bookings') // Ensure you have a 'bookings' table in Supabase
      .insert([{ 
        client_name: name, 
        email: email, 
        service: service, 
        booking_date: date 
      }]);

    if (dbError) console.error("Database Save Error:", dbError);

    // 2. Send Notification to YOU
    await resend.emails.send({
      from: 'MJ Nail Art <onboarding@resend.dev>',
      to: ['your-email@gmail.com'], // Put your real email here
      subject: `✨ New Booking: ${service}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>New Booking Request</h2>
          <p><strong>Client:</strong> ${name}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
        </div>
      `,
    });

    // 3. Send Confirmation to CLIENT
    await resend.emails.send({
      from: 'MJ Nail Art <onboarding@resend.dev>',
      to: [email],
      subject: 'Confirmation: Your MJ Nail Art Request',
      html: `<h1>Hi ${name},</h1><p>I've received your request for ${service} on ${formattedDate}. I'll text or email you shortly to confirm!</p>`,
    });

    return Response.json({ success: true });

  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}