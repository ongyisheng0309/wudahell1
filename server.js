const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(bodyParser.json());

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(message) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.4,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const chat = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [{ text: message }],
      },
    ],
  });

  const result = await chat.sendMessage(message);
  const response = result.response;
  return response.text();
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/chat', async (req, res) => {
  try {
    const { location1, location2 } = req.body;
    console.log('incoming /chat req', { location1, location2 });

    if (!location1 || !location2) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const prompt = `Provide the distance in kilometers between ${location1} and ${location2} in Malaysia only in numbers no approximate or words.`;
    const response = await runChat(prompt);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/weather', async (req, res) => {
  try {
    const { destination, departDate } = req.body;
    console.log('incoming /weather req', { destination, departDate });

    if (!destination || !departDate) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const prompt = `Can I have the abstract of ${destination} weather forecasting from ${departDate} 1 week forecasting? Give me day by day and also only the conditions is needed.`;
    const response = await runChat(prompt);
    res.json({ response });
  } catch (error) {
    console.error('Error in weather endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/news', async (req, res) => {
  try {
    const url = 'https://newsapi.org/v2/everything?q=malaysia tourism&from=2024-08-02&to=2024-08-01&sortBy=popularity&apiKey=740685d749044e1e941f0266aadfe2ed';

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`News API request failed with status ${response.status}`);
    }

    const newsData = await response.json();

    // Do something with the newsData (e.g., filter, format, send to the client)
    res.json(newsData); 

  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }

});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
