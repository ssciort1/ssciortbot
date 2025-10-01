const { exec } = require('child_process');

module.exports = {
    name: 'spegnibot',
    description: 'Spegne il bot (solo admin)',
    async execute(msg, client) {
        const sender = msg.author || msg.from;

        if (!isAdmin(sender)) {
            return msg.reply("❌ Non hai i permessi per spegnere il bot.");
        }

        await msg.reply("⚡ Sto spegnendo il bot...");

        // Invia messaggio di spegnimento nei gruppi principali
        const GROUP_IDS = ['120363046559211268@g.us', '120363423664616339@g.us'];
        for (const GROUP_ID of GROUP_IDS) {
            try {
                await client.sendMessage(GROUP_ID, '🤖 SSCIORTBOT OFFLINE! 🤖\n❌ Bot spento per manutenzione.');
            } catch (e) {
                console.error(`Errore invio messaggio spegnimento a ${GROUP_ID}:`, e);
            }
        }

        // Chiude il processo
        setTimeout(() => process.exit(0), 2000);
    }
}

// Funzione di esempio per controllare admin
function isAdmin(userId) {
    const ADMINS = ['16209290481885@lid']; // <-- inserisci i numeri degli admin
    return ADMINS.includes(userId);
}