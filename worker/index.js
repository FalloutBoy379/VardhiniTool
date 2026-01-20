// Cloudflare Worker for AI Date Ideas
// Deploy to Cloudflare Workers (free tier)
// Set your GROQ_API_KEY as a secret in Cloudflare dashboard

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        try {
            const { mood, activity } = await request.json();

            const prompt = `Generate a creative and romantic virtual date idea for a long-distance couple (Ansh in Seattle and Vardhini in Brooklyn).
${mood ? `The mood they want: ${mood}` : ''}
${activity ? `Type of activity: ${activity}` : ''}

Requirements:
- Make it specific and actionable
- Include an emoji at the start
- Keep it to 1-2 sentences
- Make it romantic and sweet
- It should be doable over video call or together online

Just return the date idea, nothing else.`;

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.9,
                    max_tokens: 100,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(data)}`);
            }

            const idea = data.choices?.[0]?.message?.content;

            if (!idea) {
                throw new Error(`No idea in response: ${JSON.stringify(data)}`);
            }

            return new Response(JSON.stringify({ idea: idea.trim() }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            console.error('Error:', error);
            // Return a fallback idea if AI fails
            const fallbacks = [
                "🎬 Watch a movie together on Netflix Party and have a snack date!",
                "🍳 Cook the same recipe while video calling - compare your results!",
                "🎮 Play an online game together like Jackbox or Among Us",
                "📚 Start a book club - read the same chapter and discuss",
                "☕ Have a cozy coffee date while video calling"
            ];
            const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

            return new Response(JSON.stringify({ idea: fallback, error: error.message }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    },
};
