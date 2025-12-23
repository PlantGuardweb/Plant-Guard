import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;
const API_KEY = 'AIzaSyA5Fh50b6bkqavKcqf_6sd_0O6M09360x4';

// Middleware
app.use(cors());
app.use(express.json());

// Proxy endpoint for Gemini API
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const systemPrompt = `You are Plant-Guard-AI, an expert assistant specialized in plant care and health. 
Provide helpful, concise (2-3 sentences) advice on watering, light, diseases, fertilizing, and plant growth. 
Be friendly and practical.`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: systemPrompt + "\n\nUser question: " + message
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 500
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API error:', errorData);
            return res.status(response.status).json({ 
                error: errorData.error?.message || 'API Error' 
            });
        }

        const data = await response.json();
        
        let botResponse = 'I encountered an issue processing your request. Please try again.';
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const parts = data.candidates[0].content.parts;
            if (parts && parts[0] && parts[0].text) {
                botResponse = parts[0].text;
            }
        }

        res.json({ response: botResponse });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🤖 Plant-Guard AI server running on http://localhost:${PORT}`);
});
