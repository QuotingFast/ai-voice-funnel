const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// ✅ root check
app.get('/', (req, res) => {
  res.send('AI Voice Funnel is live!');
});

// ✅ voice webhook route for Twilio
app.post('/voice', (req, res) => {
  const twiml = `
    <Response>
      <Say voice="alice">Hey Tom, thanks for calling. You're now connected to the AI Voice Funnel test environment.</Say>
    </Response>
  `;
  res.type('text/xml');
  res.send(twiml);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
