export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { systemPrompt, userText, fileContent = '' } = req.body;

    if (!systemPrompt || !userText) {
        return res.status(400).json({ error: 'systemPrompt and userText are required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText + (fileContent ? '\n\nСодержимое файла:\n' + fileContent : '') }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.2,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: err.error?.message || 'OpenAI error' });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
        return res.status(200).json(JSON.parse(content));
    } catch {
        return res.status(500).json({ error: 'Invalid JSON from OpenAI' });
    }
}
