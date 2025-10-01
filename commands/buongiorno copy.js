const { MessageMedia } = require('whatsapp-web.js');
const fetch = require('node-fetch');

module.exports = {
    name: 'buongiorno',
    description: 'Invia una foto di buongiorno divertente casuale da Reddit',
    async execute(msg, client) {
        try {
            // Subreddit divertenti per buongiorno
            const subreddits = ['GoodMorning', 'GoodMorningMemes'];
            const randomSub = subreddits[Math.floor(Math.random() * subreddits.length)];

            // Chiamata Reddit JSON
            const url = `https://www.reddit.com/r/${randomSub}/hot.json?limit=50`;
            const res = await fetch(url);
            const data = await res.json();

            // Filtra solo post con immagini
            const posts = data.data.children
                .map(post => post.data)
                .filter(p => p.post_hint === 'image' && p.url);

            if (!posts.length) {
                await msg.reply('❌ Non ho trovato immagini disponibili al momento!');
                return;
            }

            // Scegli un post casuale
            const randomPost = posts[Math.floor(Math.random() * posts.length)];
            const imageUrl = randomPost.url;

            // Scarica l’immagine in base64
            const imageRes = await fetch(imageUrl);
            const buffer = await imageRes.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');

            // Crea MessageMedia
            const media = new MessageMedia('image/jpeg', base64);

            await client.sendMessage(msg.from, media, {
                caption: `🌅 Buongiorno! 🌅\n\n😂 Dal subreddit r/${randomSub}`
            });

        } catch (error) {
            console.error('Errore invio foto:', error);
            await msg.reply('❌ Errore nell\'invio della foto!');
        }
    }
};