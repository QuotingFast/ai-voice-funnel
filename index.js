const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 10000;
const voiceId = process.env.ELEVENLABS_VOICE_ID;
const apiKey = process.env.ELEVENLABS_API_KEY;

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve pre-generated MP3
app.get('/intro.mp3', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'intro.mp3'));
});

// Respond to Twilio call
app.post('/voice', (req, res) => {
  const twiml = `
    <Response>
      <Play>https://${req.headers.host}/intro.mp3</Play>
    </Response>
  `;
  res.type('text/xml');
  res.send(twiml);
});

// Generate MP3 once at startup
const generateElevenLabsAudio = async () => {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: "Hey Tom, thanks for calling. You're now connected to the AI Voice Funnel test environment.",
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.7
        }
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'stream'
      }
    );

    const outputPath = path.join(__dirname, 'public', 'intro.mp3');
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('✅ MP3 saved at startup');
        resolve();
      });
      writer.on('error', (err) => {
        console.error('❌ Error saving MP3:', err.message);
        reject(err);
      });
    });
  } catch (err) {
    console.error('❌ ElevenLabs API error:', err.message);
  }
};

// Start server and pre-generate MP3
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await generateElevenLabsAudio();
});

// Trigger redeploy
// redeploy trigger
