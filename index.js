const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

const client = new Client();
client.on('qr', (qr) => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('WhatsApp bot is ready'));
client.on('message', msg => {
    if (msg.body.toLowerCase() === 'start') {
        msg.reply('Your bot is now active. How can I help you?');
    }
});
client.initialize();

// Webhook for Paystack
app.post('/paystack-webhook', (req, res) => {
    const event = req.body;

    if (event.event === 'charge.success') {
        const phone = event.data.customer.phone;
        console.log(`Payment received from: ${phone}`);
        // You can trigger message sending here (customized by phone)
        // Requires WhatsApp Web login session active
    }

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
