module.exports = {
    name: 'groupid',
    description: 'Get the current chat/group ID',
    async execute(msg) {
        const chatId = msg.from;
        const isGroup = msg.from.includes('@g.us');
        
        let response = `📋 INFO CHAT\n\n`;
        response += `🆔 ID: ${chatId}\n`;
        response += `👥 Tipo: ${isGroup ? 'Gruppo' : 'Chat privata'}\n\n`;
        response += `💡 Copia questo ID per configurare i promemoria automatici!`;
        
        msg.reply(response);
        
        // Log anche nella console per facilità
        console.log(`Chat ID richiesto: ${chatId} (${isGroup ? 'Gruppo' : 'Privata'})`);
    }
};