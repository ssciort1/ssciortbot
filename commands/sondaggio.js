module.exports = {
    name: 'sondaggio',
    description: 'Crea un sondaggio per il gruppo',
    async execute(msg, client) {
        // Controlla se è un gruppo
        if (!msg.from.includes('@g.us')) {
            msg.reply('❌ I sondaggi funzionano solo nei gruppi!');
            return;
        }
        
        const args = msg.body.split(' ').slice(1);
        
        if (args.length === 0) {
            msg.reply('📊 CREA SONDAGGIO\n\nUso: .sondaggio [domanda] | [opzione1] | [opzione2] | [opzione3]...\n\nEsempi:\n• .sondaggio Dove andiamo in gita? | Roma | Milano | Napoli\n• .sondaggio Che giorno per la verifica? | Lunedì | Martedì | Mercoledì\n• .sondaggio Pizza o hamburger? | Pizza | Hamburger\n\n📝 Massimo 12 opzioni!');
            return;
        }
        
        const fullText = args.join(' ');
        const parts = fullText.split('|').map(part => part.trim());
        
        if (parts.length < 3) {
            msg.reply('❌ Formato non corretto!\n\nUsa: .sondaggio [domanda] | [opzione1] | [opzione2]\n\nEsempio: .sondaggio Pizza o hamburger? | Pizza | Hamburger');
            return;
        }
        
        const question = parts[0];
        const options = parts.slice(1);
        
        if (options.length > 12) {
            msg.reply('❌ Massimo 12 opzioni per sondaggio!');
            return;
        }
        
        if (options.length < 2) {
            msg.reply('❌ Servono almeno 2 opzioni per il sondaggio!');
            return;
        }
        
        try {
            // Crea il sondaggio nativo di WhatsApp
            await client.sendMessage(msg.from, {
                poll: {
                    name: question,
                    options: options.map(option => ({ name: option })),
                    selectableCount: 1
                }
            });
            
            console.log(`Sondaggio creato: "${question}" con ${options.length} opzioni`);
            
        } catch (error) {
            console.error('Errore creazione sondaggio:', error);
            
            // Fallback con messaggio normale se i sondaggi nativi non funzionano
            let fallbackMessage = `📊 SONDAGGIO\n\n❓ ${question}\n\n`;
            
            options.forEach((option, index) => {
                const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🅰️', '🅱️'][index];
                fallbackMessage += `${emoji} ${option}\n`;
            });
            
            fallbackMessage += '\n👆 Rispondi con il numero/emoji della tua scelta!';
            
            msg.reply(fallbackMessage);
        }
    }
};