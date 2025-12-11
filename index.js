const { Telegraf } = require('telegraf');
const express = require('express');

// 1. SETUP DUMMY SERVER (To keep the cloud app running)
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 2. SETUP BOT
// REPLACE THIS with your Token
const bot = new Telegraf('8472338569:AAHRT0shFIYFgDlX4YRnDAoFhw4VKArX-dI');

bot.start((ctx) => {
    ctx.reply("Welcome! Click below to shop:", {
        reply_markup: {
            keyboard: [[{ text: "Shop Bags", web_app: { url: "https://classy-pothos-359340.netlify.app/" } }]],
            resize_keyboard: true
        }
    });
});

bot.on('web_app_data', async (ctx) => {
    try {
        const data = JSON.parse(ctx.message.web_app_data.data);
        if (data.type === 'ORDER_UBAGS') {
            const { customer, cart, total } = data;
            const itemsList = cart.map(i => `• ${i.title} (x${i.qty})`).join('\n');
            
            const receipt = `
✅ *ORDER RECEIVED*
👤 ${customer.name}
📱 ${customer.phone}

🛒 *Order:*
${itemsList}

💰 *Total:* ${total} ETB
            `;
            await ctx.replyWithMarkdown(receipt);
        }
    } catch (e) {
        console.error(e);
    }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));

process.once('SIGTERM', () => bot.stop('SIGTERM'));
