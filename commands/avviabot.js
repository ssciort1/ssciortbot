const { exec } = require('child_process');

module.exports = {
    name: 'avviabot',
    description: 'Riavvia il bot (solo admin)',
    async execute(msg, client) {
        const sender = msg.author || msg.from;

        if (!isAdmin(sender)) {
            return msg.reply("❌ Non hai i permessi per riavviare il bot.");
        }

        await msg.reply("⚡ Riavvio bot in corso...");

        exec("pm2 restart whatsapp-bot", (error, stdout, stderr) => {
            if (error) {
                console.error(`Errore riavvio: ${error}`);
                msg.reply("❌ Errore durante il riavvio.");
                return;
            }
            msg.reply("✅ Bot riavviato correttamente!");
            console.log(stdout);
        });
    }
}

// Funzione di esempio per controllare admin
function isAdmin(userId) {
    const ADMINS = ['16209290481885@lid']; // <-- inserisci i numeri degli admin
    return ADMINS.includes(userId);
}