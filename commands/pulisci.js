module.exports = {
    name: 'pulisci',
    description: 'Elimina TUTTI i messaggi del bot nella chat (solo admin)',
    async execute(msg) {
        const sender = msg.author || msg.from;
        const adminIds = ['16209290481885@lid'];
        
        if (!adminIds.includes(sender)) {
            return msg.reply('❌ Solo gli admin possono usare questo comando!');
        }
        
        try {
            const chat = await msg.getChat();
            let deletedCount = 0;
            let hasMore = true;
            
            while (hasMore) {
                const messages = await chat.fetchMessages({ limit: 50 });
                
                if (messages.length === 0) {
                    hasMore = false;
                    break;
                }
                
                let foundBotMessage = false;
                
                for (const message of messages) {
                    if (message.fromMe) {
                        foundBotMessage = true;
                        try {
                            await message.delete(true);
                            deletedCount++;
                            await new Promise(resolve => setTimeout(resolve, 200));
                        } catch (e) {
                            // Continua anche se alcuni messaggi non possono essere eliminati
                        }
                    }
                }
                
                // Se non troviamo più messaggi del bot, fermiamo
                if (!foundBotMessage) {
                    hasMore = false;
                }
                
                // Pausa tra i batch per evitare rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            await msg.reply(`🧹 Eliminati ${deletedCount} messaggi del bot!`);
            
        } catch (error) {
            return msg.reply('❌ Errore durante l\'eliminazione dei messaggi!');
        }
    }
};