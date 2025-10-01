const fs = require('fs');
const path = require('path');

const COMPITI_FILE = path.join(__dirname, '..', 'data', 'compiti.json');

module.exports = {
    name: 'compiti',
    description: 'Gestisci i compiti della classe',
    async execute(msg) {
        const args = msg.body.split(' ').slice(1);
        const action = args[0];
        
        // Assicurati che la cartella data esista
        const dataDir = path.dirname(COMPITI_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Carica compiti esistenti
        let compiti = [];
        if (fs.existsSync(COMPITI_FILE)) {
            try {
                compiti = JSON.parse(fs.readFileSync(COMPITI_FILE, 'utf8'));
            } catch (error) {
                compiti = [];
            }
        }
        
        if (!action || action === 'list') {
            // Mostra lista compiti
            if (compiti.length === 0) {
                msg.reply('📚 COMPITI\n\n✅ Nessun compito in lista!\n\n💡 Usa: .compiti add [materia] [descrizione]');
                return;
            }
            
            const today = new Date().toLocaleDateString('it-IT');
            let response = `📚 COMPITI (${today})\n\n`;
            
            compiti.forEach((compito, index) => {
                const emoji = getSubjectEmoji(compito.materia);
                response += `${index + 1}. ${emoji} ${compito.materia}: ${compito.descrizione}\n`;
                if (compito.scadenza) {
                    response += `   📅 Scadenza: ${compito.scadenza}\n`;
                }
                response += '\n';
            });
            
            response += '💡 Comandi:\n• .compiti add [materia] [descrizione]\n• .compiti remove [numero]\n• .compiti clear';
            
            msg.reply(response);
            
        } else if (action === 'add') {
            // Aggiungi compito
            if (args.length < 3) {
                msg.reply('❌ Uso: .compiti add [materia] [descrizione]\nEsempio: .compiti add matematica pagina 45 esercizi 1-10');
                return;
            }
            
            const materia = args[1];
            const descrizione = args.slice(2).join(' ');
            
            const nuovoCompito = {
                materia: materia,
                descrizione: descrizione,
                aggiunto: new Date().toLocaleDateString('it-IT'),
                aggiuntoDA: msg.author || 'Anonimo'
            };
            
            compiti.push(nuovoCompito);
            
            // Salva compiti
            fs.writeFileSync(COMPITI_FILE, JSON.stringify(compiti, null, 2));
            
            const emoji = getSubjectEmoji(materia);
            msg.reply(`✅ Compito aggiunto!\n\n${emoji} ${materia}: ${descrizione}\n\n📚 Usa .compiti per vedere la lista completa`);
            
        } else if (action === 'remove') {
            // Rimuovi compito
            const index = parseInt(args[1]) - 1;
            
            if (isNaN(index) || index < 0 || index >= compiti.length) {
                msg.reply('❌ Numero compito non valido. Usa .compiti per vedere la lista.');
                return;
            }
            
            const compitoRimosso = compiti.splice(index, 1)[0];
            
            // Salva compiti
            fs.writeFileSync(COMPITI_FILE, JSON.stringify(compiti, null, 2));
            
            const emoji = getSubjectEmoji(compitoRimosso.materia);
            msg.reply(`🗑️ Compito rimosso!\n\n${emoji} ${compitoRimosso.materia}: ${compitoRimosso.descrizione}`);
            
        } else if (action === 'clear') {
            // Cancella tutti i compiti
            compiti = [];
            fs.writeFileSync(COMPITI_FILE, JSON.stringify(compiti, null, 2));
            msg.reply('🗑️ Tutti i compiti sono stati cancellati!');
            
        } else {
            msg.reply('❌ Comando non riconosciuto.\n\nComandi disponibili:\n• .compiti (mostra lista)\n• .compiti add [materia] [descrizione]\n• .compiti remove [numero]\n• .compiti clear');
        }
    }
};

function getSubjectEmoji(materia) {
    const emojis = {
        'matematica': '📐',
        'italiano': '🇮🇹',
        'inglese': '🇬🇧',
        'storia': '🏛️',
        'geografia': '🌍',
        'scienze': '🔬',
        'fisica': '⚛️',
        'chimica': '⚗️',
        'informatica': '💻',
        'arte': '🎨',
        'musica': '🎵',
        'educazione fisica': '🏃',
        'filosofia': '🤔',
        'latino': '🏛️',
        'greco': '🏺'
    };
    
    return emojis[materia.toLowerCase()] || '📚';
}