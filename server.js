const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve the HTML page

// Endpoint to handle user input and send to OpenAI
app.post('/ask', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'text-davinci-003',
            prompt: userMessage,
            max_tokens: 150,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': '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' // Replace with your OpenAI API key
            }
        });
        res.json({ answer: response.data.choices[0].text.trim() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get response from OpenAI' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
