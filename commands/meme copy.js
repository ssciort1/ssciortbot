const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'meme',
    description: 'Invia meme casuali da internet',
    async execute(msg) {
        try {
            await msg.reply('🎭 Cercando meme epico...');
            
            // API gratuita per meme
            const response = await axios.get('https://meme-api.com/gimme');
            
            if (response.data && response.data.url) {
                const memeUrl = response.data.url;
                const title = response.data.title || 'Meme Casuale';
                const subreddit = response.data.subreddit || 'memes';
                
                // Scarica immagine
                const imageResponse = await axios.get(memeUrl, { responseType: 'arraybuffer' });
                const media = new MessageMedia('image/jpeg', Buffer.from(imageResponse.data).toString('base64'));
                
                await msg.reply(media, undefined, {
                    caption: `🎭 **${title}**\n\n📍 Da: r/${subreddit}\n🔥 Meme fresco dal web!`
                });
                
            } else {
                // Fallback con meme locale se API non funziona
                await msg.reply('🎭 API temporaneamente non disponibile!\n\n😅 Usa .foto per immagini locali\n\n🔄 Riprova tra poco!');
            }
            
        } catch (error) {
            console.error('Errore comando meme:', error);
            
            // Fallback con emoji meme
            const memeFallback = [
                '🎭 MEME TESTUALE! 🎭\n\n😂 "Quando il prof dice che l\'interrogazione è facile"\n👁️👄👁️\n\n🔥 Meme mode: ATTIVATO!',
                '🎭 MEME ASCII! 🎭\n\n( ͡° ͜ʖ ͡°)\n"Sempre quel compagno che copia"\n\n😎 Classic meme vibes!',
                '🎭 MEME EMOJI! 🎭\n\n🐕 This is fine 🔥\n"Io durante le verifiche"\n\n😅 Tutto sotto controllo!'
            ];
            
            const randomMeme = memeFallback[Math.floor(Math.random() * memeFallback.length)];
            await msg.reply(randomMeme);
        }
    }
};