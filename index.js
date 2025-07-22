const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code received, scan with WhatsApp.');
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot is ready!');
});

client.on('message', async msg => {
    const text = msg.body.toLowerCase();

    // ✅ Auto-mark seen and online
    client.sendSeen(msg.from);
    client.sendPresenceAvailable();

    // ✅ Fake Typing
    if (text === 'typing') {
        client.sendPresenceTyping(msg.from);
        setTimeout(() => {
            msg.reply("⌨️ Typing... done!");
        }, 3000);
        return;
    }

    // ✅ Fake Recording
    if (text === 'record') {
        client.sendPresenceRecording(msg.from);
        setTimeout(() => {
            msg.reply("🎤 Recording complete!");
        }, 3000);
        return;
    }

    // ✅ Autolike (auto-react ✅)
    if (text === 'autolike') {
        await msg.react('✅');
        msg.reply('Auto-like (✅) activated!');
        return;
    }

    // ✅ Basic Command Handler
    if (text === 'start') {
        msg.reply("🤖 Bot activated! Type *help* to see available commands.");
        return;
    }

    if (text === 'status') {
        msg.reply("✅ I'm online and working fine!");
        return;
    }

    if (text === 'help') {
        msg.reply(`🧠 Available Commands:
- start
- status
- help
- typing
- record
- autolike
- antidelete
        `);
        return;
    }

    // ✅ Fallback response
    if (!text.startsWith('/')) {
        msg.reply('🤖 I didn’t understand that. Type *help* to see commands.');
    }
});

// ✅ View Once Detector
client.on('message', async msg => {
    if (msg.hasMedia && msg.isViewOnce) {
        msg.reply('👀 View-once media detected!');
    }
});

// ✅ Anti-Delete
client.on('message_revoke_everyone', async (after, before) => {
    if (before) {
        const chat = await before.getChat();
        chat.sendMessage(`🚫 Someone deleted: "${before.body}"`);
    }
});

// ✅ Express server for Paystack webhook
app.use(express.json());
app.post('/paystack-webhook', async (req, res) => {
    const event = req.body;

    if (event.event === 'charge.success') {
        const phone = event.data.metadata.phone; // Must be included in Paystack metadata
        console.log(`✅ Payment from: ${phone}`);
        // You can send a message directly (must have a session running)
        const chatId = `254${phone}@c.us`; // Change if different format
        client.sendMessage(chatId, "✅ Thank you for your payment! Your bot is now activated. Type 'start' to begin.");
    }

    res.sendStatus(200);
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Start WhatsApp client
client.initialize();
