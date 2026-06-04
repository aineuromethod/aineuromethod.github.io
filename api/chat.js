export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  try {
    const { systemPrompt, userMessage, model = 'gpt-4o-mini', temperature = 0.2 } = req.body;
    if (!systemPrompt || !userMessage) {
      return res.status(400).json({ error: 'Отсутствуют systemPrompt или userMessage' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API-ключ не настроен на сервере' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature,
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `Ошибка API: ${response.status}`);
    }

    const content = data.choices[0].message.content;
    res.status(200).json(JSON.parse(content));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}