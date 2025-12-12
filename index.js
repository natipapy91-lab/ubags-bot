const { Telegraf } = require('telegraf');
const express = require('express');

// --- 1. CONFIGURATION (FILL THESE CAREFULLY) ---
const BOT_TOKEN = '8472338569:AAHRT0shFIYFgDlX4YRnDAoFhw4VKArX-dI';     // (Your actual long code)
const ADMIN_ID = '1094362464';        // (Your actual number)
const SHOP_URL = 'https://ubags-frontend.vercel.app/';       // https://ubags-frontend.vercel.app

// --- 2. SETUP SERVER (Keep Render Alive) ---
const app = express();
app.get('/', (req, res) => res.send('UBAGS Bot is Online!'));
app.listen(process.env.PORT || 3000);

// --- 3. BOT LOGIC ---
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply("Welcome to UBAGS! Tap the button below to visit our Boutique:", {
        reply_markup: {
            // This button must match your Shop URL exactly
            keyboard: [[{ text: "Shop Bags", web_app: { url: SHOP_URL } }]],
            resize_keyboard: true
        }
    });
});

bot.on('web_app_data', async (ctx) => {
    try {
        const data = JSON.parse(ctx.message.web_app_data.data);

        if (data.type === 'ORDER_UBAGS') {
            const { customer, cart, total } = data;

            // Format the list of items
            const itemsList = cart
                .map(i => `• ${i.title} (x${i.qty})`)
                .join('\n');

            // The Message Text
            const receipt = `
🛍️ *NEW ORDER RECEIVED*

👤 *Customer:* ${customer.name}
📱 *Phone:* ${customer.phone}

🛒 *Items:*
${itemsList}

💰 *TOTAL:* ${total} ETB
            `;

            // A. Send confirmation to the Customer (The person who clicked)
            await ctx.replyWithMarkdown("✅ *Order Confirmed!* We will contact you shortly.");

            // B. Send notification to YOU (The Owner)
            await bot.telegram.sendMessage(ADMIN_ID, "🔔 *ADMIN ALERT*\n" + receipt, { parse_mode: 'Markdown' });
        }
    } catch (e) {
        console.error("❌ Bot Error:", e);
    }
});


bot.launch();
