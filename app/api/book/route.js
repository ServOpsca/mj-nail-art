// Uses Google Gemini Flash — FREE tier: 1,500 requests/day, no credit card needed
// Get your free key at: https://aistudio.google.com/apikey

export async function POST(req) {
  try {
    const { occasion, style, shape, length, extra } = await req.json();

    if (!occasion && !style) {
      return Response.json({ error: 'Please select at least an occasion or aesthetic.' }, { status: 400 });
    }

    const userMessage = [
      occasion && `Occasion: ${occasion}`,
      style    && `Aesthetic preference: ${style}`,
      shape    && `Nail shape: ${shape}`,
      length   && `Length preference: ${length}`,
      extra    && `Additional details: ${extra}`,
    ].filter(Boolean).join('\n');

    const prompt = `You are MJ, a luxury nail artist in India. Suggest exactly 2 bespoke nail design concepts based on client input. For each:
- Give it a poetic evocative name in **bold** (e.g. **Midnight Magnolia**)
- Specific color palette with shade names
- Finish and technique (gel, chrome, matte, hand-painted, etc.)
- Any art details or accents
- Which MJ service to book with ₹ price (Gel Extensions ₹2,500+, Custom Nail Art ₹500+, Hard Gel Overlay ₹1,800+, Luxury Manicure ₹1,200)
- One brief styling/occasion pairing tip

Use luxurious, poetic language. Keep each suggestion 4–5 sentences. End with a warm one-line closing.

Client preferences:
${userMessage}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 900, temperature: 0.8 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || `Gemini error ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) throw new Error('Empty response from Gemini');

    return Response.json({ result: text });

  } catch (err) {
    console.error('AI Advisor error:', err);
    return Response.json({ error: err.message || 'Something went wrong.' }, { status: 500 });
  }
}
