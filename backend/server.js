require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = new twilio(accountSid, authToken);

app.use(cors());
app.use(express.json());

// Endpoint to send verification code via WhatsApp
app.post('/send-verification', async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({
        to: `+${phoneNumber}`,
        channel: 'whatsapp'
      });
    res.status(200).send({ success: true, sid: verification.sid });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// Endpoint to verify the code
app.post('/verify-code', async (req, res) => {
  const { phoneNumber, code } = req.body;

  try {
    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({
        to: `+${phoneNumber}`,
        code: code
      });

    if (verificationCheck.status === 'approved') {
      res.status(200).send({ success: true });
    } else {
      res.status(400).send({ success: false, error: 'Invalid verification code.' });
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
