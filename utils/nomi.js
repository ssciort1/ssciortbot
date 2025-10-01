// Funzione helper per ottenere nomi veri dai gruppi WhatsApp
async function ottieniNomeVero(msg, userId) {
    try {
        // Se non è un gruppo, usa fallback normale
        if (!msg.from.includes('@g.us')) {
            return msg._data?.notifyName || msg.contact?.pushname || userId;
        }
        
        // Ottieni info del gruppo
        const chat = await msg.getChat();
        const participants = chat.participants;
        
        // Cerca il partecipante
        const participant = participants.find(p => p.id._serialized === userId);
        
        if (participant) {
            // Usa solo quello che sappiamo funziona
            return participant.id.user || userId;
        }
        
        // Fallback completo
        return msg._data?.notifyName || msg.contact?.pushname || userId;
        
    } catch (error) {
        console.error('Errore ottenimento nome:', error);
        // Fallback sicuro
        return msg._data?.notifyName || msg.contact?.pushname || userId;
    }
}

module.exports = { ottieniNomeVero };