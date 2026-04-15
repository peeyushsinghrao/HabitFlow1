import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const extractOpenAIText = (response: { output_text?: string; output?: { content?: { text?: string }[] }[] }) => {
  if (response.output_text) return response.output_text.trim();
  return response.output?.flatMap(i => i.content ?? []).map(c => c.text ?? '').join('').trim() ?? '';
};

function localExplain(formula: string, title: string, subject: string) {
  const f = formula.toLowerCase();
  const common: Record<string, string> = {
    'v = u + at': '📐 This is the first equation of motion. "v" is final speed, "u" is starting speed, "a" is acceleration, and "t" is time. Real-world: a car going from 0 to 60 km/h uses this. Just add how much speed you gain (a×t) to your starting speed.',
    'f = ma': '📐 Newton\'s Second Law. Force equals mass times acceleration. The heavier something is (mass), the more force you need to move it at the same rate. Real-world: pushing a shopping cart vs. a truck — same push, very different acceleration.',
    's = ut + ½at²': '📐 Second equation of motion for displacement. Even if you start at rest (u=0), you still cover distance as you accelerate. Real-world: a ball dropped from a building falls s = ½×10×t² metres in t seconds.',
    'e = mc²': '📐 Einstein\'s mass-energy equivalence. A tiny bit of mass converts to a massive amount of energy (c² = 9×10¹⁶). Real-world: this is the principle behind nuclear reactors and atomic bombs.',
    'pv = nrt': '📐 Ideal Gas Law. Pressure × Volume = moles × gas constant × Temperature. Real-world: why a balloon pops in a hot car — heat raises T, which raises P until the balloon bursts.',
  };

  for (const [key, val] of Object.entries(common)) {
    if (f.includes(key.toLowerCase())) return val;
  }

  return `📐 "${formula}" is a ${subject} formula${title ? ` for ${title}` : ''}. It shows how different quantities relate to each other mathematically. To understand it: identify each variable, think about what happens when one increases while others stay constant. Try substituting real numbers to see the pattern!`;
}

export async function POST(request: Request) {
  try {
    const { formula, title, subject, chapter } = await request.json();

    if (!formula) {
      return NextResponse.json({ error: 'Formula is required' }, { status: 400 });
    }

    if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
      return NextResponse.json({ explanation: localExplain(formula, title || chapter || '', subject || '') });
    }

    const client = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
    const prompt = `You are Aria, a friendly AI tutor. Explain this ${subject || 'science'} formula in simple, plain English for a student:

Formula: ${formula}
${title ? `Name/Title: ${title}` : ''}
${chapter ? `Chapter: ${chapter}` : ''}
${subject ? `Subject: ${subject}` : ''}

Give a 3-part explanation:
1. What each variable/symbol means (1-2 sentences)
2. What the formula tells us in plain English (1 sentence)
3. One real-world example (1-2 sentences)

Keep it concise, warm, and beginner-friendly. Total response: max 80 words.`;

    const response = await client.responses.create({ model: 'gpt-5-mini', input: prompt });
    const explanation = extractOpenAIText(response as Parameters<typeof extractOpenAIText>[0]);

    return NextResponse.json({ explanation: explanation || localExplain(formula, title || chapter || '', subject || '') });
  } catch (error) {
    console.error('Formula explain error:', error);
    return NextResponse.json({ error: 'Failed to explain formula' }, { status: 500 });
  }
}
