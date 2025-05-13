const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

// Serve the ElevenLabs MP3
app.get('/intro.mp3', (req, res) => {
  res.sendFile(__dirname + '/public/intro.mp3');
});

// Generate MP3 using ElevenLabs
const generateElevenLabsAudio = async () => {
  try {
    const voiceId = process.env.ELEVENLABS_VOICE_ID; // example: lxYfHSkYm1EzQzGhdbfc
    const apiKey = process.env.ELEVENLABS_API_KEY;

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

    const writer = fs.createWriteStream('./public/intro.mp3');
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('✅ ElevenLabs MP3 saved');
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (err) {
    console.error('❌ ElevenLabs error:', err.message);
  }
};

// Twilio voice webhook – returns <Play> to ElevenLabs MP3
app.post('/voice', (req, res) => {
  const twiml = `
    <Response>
      <Play>https://${req.headers.host}/intro.mp3</Play>
    </Response>
  `;
  res.type('text/xml');
  res.send(twiml);
});

// Start server and generate audio
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await generateElevenLabsAudio();
});
