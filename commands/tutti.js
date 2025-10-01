module.exports = {
    name: 'tutti',
    description: 'Tagga tutti i membri del gruppo',
    async execute(msg, client) {
        // Controlla se è un gruppo
        if (!msg.from.includes('@g.us')) {
            msg.reply('❌ Questo comando funziona solo nei gruppi!');
            return;
        }
        
        const args = msg.body.split(' ').slice(1);
        const customMessage = args.length > 0 ? args.join(' ') : '';
        
        try {
            // Ottieni informazioni del gruppo
            const chat = await msg.getChat();
            const participants = chat.participants;
            
            if (participants.length === 0) {
                msg.reply('❌ Impossibile ottenere la lista dei membri.');
                return;
            }
            
            // Crea la lista di mention
            let mentions = [];
            let messageText = '📢 ATTENZIONE TUTTI!\n\n';
            
            if (customMessage) {
                messageText += `💬 ${customMessage}\n\n`;
            }
            
            messageText += '👥 Membri taggati:\n';
            
            // Aggiungi ogni partecipante
            participants.forEach((participant, index) => {
                const contact = participant.id._serialized;
                mentions.push(contact);
                
                // Ottieni il nome del contatto
                const name = participant.id.user;
                messageText += `${index + 1}. @${name}\n`;
            });
            
            messageText += `\n🔔 ${participants.length} membri taggati!`;
            
            // Invia il messaggio con i mention
            await client.sendMessage(msg.from, messageText, {
                mentions: mentions
            });
            
            console.log(`Comando tutti eseguito nel gruppo ${chat.name} - ${participants.length} membri taggati`);
            
        } catch (error) {
            console.error('Errore comando tutti:', error);
            msg.reply('❌ Errore nel taggare i membri. Riprova più tardi.');
        }
    }
};