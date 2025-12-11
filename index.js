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

// --- PASTE YOUR ADMIN ID HERE ---
const ADMIN_ID = '1094362464'; // <--- Paste the number from @userinfobot here

bot.on('web_app_data', async (ctx) => {
    try {
        const data = JSON.parse(ctx.message.web_app_data.data);
        
        if (data.type === 'ORDER_UBAGS') {
            const { customer, cart, total } = data;
            
            // 1. Create the Receipt Text
            const itemsList = cart.map(i => `• ${i.title} (x${i.qty})`).join('\n');
            const receipt = `
✅ *NEW ORDER*
👤 ${customer.name}
📱 ${customer.phone}

🛒 *Items:*
${itemsList}

💰 *Total:* ${total} ETB
            `;

            // 2. Send Receipt to the CUSTOMER (The person who clicked)
            await ctx.replyWithMarkdown("Thank you! We received your order:\n" + receipt);

            // 3. Send Notification to YOU (The Seller)
            // We use telegram.sendMessage to message a specific ID
            await bot.telegram.sendMessage(ADMIN_ID, "🔔 *YOU HAVE A NEW ORDER!* \n" + receipt, { parse_mode: 'Markdown' });
        }
    } catch (e) {
        console.error(e);
    }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));