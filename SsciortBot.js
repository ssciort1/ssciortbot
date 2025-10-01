// WhatsApp bot using whatsapp-web.js
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

// Initialize uptime tracking
const startTime = Date.now();
global.getUptime = () => Date.now() - startTime;

// Load commands
const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.set(command.name, command);
}

// Create WhatsApp client with session persistence
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate QR code for authentication
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

// Messaggi di avvio configurabili
const STARTUP_MESSAGES = {
    current: {
        type: 'major_update',
        title: '🚀 SSCIORTBOT 2.0 - MEGA AGGIORNAMENTO! 🚀',
        content: `🎆 NOVITÀ INCREDIBILI: (HO PROGRAMMATO TUTTA LA CAZZO DI NOTTE)

🎮 GIOCHI POTENZIATI:
• Slot con 15 tipi di vincite reali
• Pesca con 45 pesci + sistema streak
• Blackjack completo
• Cavalli con animazioni live
• Roulette russa strategica

⚔️ SISTEMA COMBATTIMENTI:
• Duelli 1v1 epici
• Tornei fino a 21 giocatori
• Battaglie tra fazioni

📈 CLASSIFICHE AVANZATE:
• Leaderboard per ogni gioco
• Classifica totale
• 150+ ACHIEVEMENT per tutti i giochi!
• Sistema streak universale
• Record personali e vittorie

🌅 MEDIA & SOCIAL:
• .meme - Meme da internet
• .buongiorno - Foto mattutine
• .musica - Brani casuali
• Sistema confessioni anonime

🎓 GESTIONE CLASSE:
• Promemoria compiti 16:00
• Cleanup automatico mezzanotte
• Orari, verifiche, compleanni

🔇 ADMIN POWERS:
• Sistema mute avanzato
• Comandi troll segreti
• Pulizia messaggi bot

🎆 35+ COMANDI TOTALI!
🎆 1000+ RIGHE DI CODICE!
🎆 TUTTO GRATUITO!

📝 Scrivi .help per iniziare!

🔥 SSCIORTBOT È DIVENTATO UNA BESTIA! 🔥`,
        fallback: '🚀 SSCIORTBOT 2.0 ONLINE! 🚀\n\n🎆 MEGA AGGIORNAMENTO COMPLETATO!\n🎮 35+ comandi disponibili!\n\n📝 Usa .help per scoprire tutto!'
    },
    normal: {
        type: 'normal',
        title: '🤖 SSCIORTBOT ONLINE! 🤖',
        content: '✅ Bot avviato con successo!\n🎮 Tutti i comandi sono disponibili!\n\n📝 Usa .help per vedere i comandi',
        fallback: '🤖 SSCIORTBOT ONLINE! 🤖\n\n✅ Bot avviato con successo!\n📝 Usa .help per i comandi'
    }
};

// When client is ready
client.on('ready', async () => {
    console.log('Client is ready!');
    setTimeout(async () => {
        await sendStartupMessage();
    }, 1000);
});

// Funzione per inviare messaggio di avvio
async function sendStartupMessage() {
    const GROUP_IDS = ['120363046559211268@g.us', '120363423664616339@g.us'];
    const message = STARTUP_MESSAGES.normal;
    
    for (const GROUP_ID of GROUP_IDS) {
        try {
            if (message.type === 'normal') {
                const chat = await client.getChatById(GROUP_ID);
                const participants = chat.participants;
                const mentions = participants.map(p => p.id._serialized);
                const mentionText = participants.map(p => `@${p.id.user}`).join(' ');
                
                const fullMessage = `${message.title}\n\n${mentionText}\n\n${message.content}`;
                await client.sendMessage(GROUP_ID, fullMessage, { mentions });
                console.log(`Messaggio aggiornamento inviato al gruppo ${GROUP_ID}`);
            } else {
                const fullMessage = `${message.title}\n\n${message.content}`;
                await client.sendMessage(GROUP_ID, fullMessage);
                console.log(`Messaggio avvio inviato al gruppo ${GROUP_ID}`);
            }
        } catch (error) {
            console.error(`Errore invio messaggio a ${GROUP_ID}:`, error);
            await client.sendMessage(GROUP_ID, message.fallback);
        }
    }
}

// Handle incoming messages
client.on('message', async msg => {
    const sender = msg.author || msg.from;
    
    if (!msg.body.startsWith('.')) return;
    
    if (await isUserMuted(sender)) {
        return;
    }
    
    const args = msg.body.slice(1).split(' ');
    const commandName = args[0];
    const command = commands.get(commandName);
    
    if (command) {
        try {
            await command.execute(msg, client);
        } catch (error) {
            console.error('Errore comando:', error);
            msg.reply('Errore nell\'esecuzione del comando.');
        }
    }
});

// Funzione per controllare se un utente è mutato
async function isUserMuted(userId) {
    const muteFile = path.join(__dirname, 'data', 'muted_users.json');
    
    try {
        if (!fs.existsSync(muteFile)) return false;
        
        const muted = JSON.parse(fs.readFileSync(muteFile, 'utf8'));
        const now = Date.now();
        
        if (muted[userId] && muted[userId].scadenza > now) {
            return true;
        } else if (muted[userId]) {
            delete muted[userId];
            fs.writeFileSync(muteFile, JSON.stringify(muted, null, 2));
        }
        
        return false;
    } catch (error) {
        console.error('Errore controllo mute:', error);
        return false;
    }
}

// Sistema di promemoria compiti automatico
function startHomeworkReminder() {
    setInterval(async () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        if (hours === 16 && minutes === 0) {
            await sendHomeworkReminder();
        }
        
        if (hours === 0 && minutes === 0) {
            await clearHomeworkAtMidnight();
        }
    }, 40000);
}

async function sendHomeworkReminder() {
    const COMPITI_FILE = path.join(__dirname, 'data', 'compiti.json');
    
    let compiti = [];
    if (fs.existsSync(COMPITI_FILE)) {
        try {
            compiti = JSON.parse(fs.readFileSync(COMPITI_FILE, 'utf8'));
        } catch (error) {
            compiti = [];
        }
    }
    
    if (compiti.length === 0) {
        return;
    }
    
    const today = new Date().toLocaleDateString('it-IT');
    let message = `🔔 PROMEMORIA COMPITI (${today})\n\n`;
    
    compiti.forEach((compito, index) => {
        const emoji = getSubjectEmoji(compito.materia);
        message += `${index + 1}. ${emoji} ${compito.materia}: ${compito.descrizione}\n`;
    });
    
    message += '\n📚 Buono studio a tutti!';
    
    const GROUP_ID = '120363046559211268@g.us';
    
    try {
        await client.sendMessage(GROUP_ID, message);
        console.log('Promemoria compiti inviato alle 16:00');
    } catch (error) {
        console.error('Errore invio promemoria:', error);
    }
}

async function clearHomeworkAtMidnight() {
    const COMPITI_FILE = path.join(__dirname, 'data', 'compiti.json');
    
    try {
        fs.writeFileSync(COMPITI_FILE, JSON.stringify([], null, 2));
        console.log('Compiti cancellati automaticamente a mezzanotte');
    } catch (error) {
        console.error('Errore cancellazione compiti a mezzanotte:', error);
    }
}

function getSubjectEmoji(materia) {
    const emojis = {
        'matematica': '📐',
        'italiano': '🇮🇹',
        'inglese': '🇬🇧',
        'storia': '🏛️',
        'sistemi': '🖥️',
        'tpsit': '🛠️',
        'informatica': '💻',
        'religione': '✝️',
        'civica': '⚖️',
    };
    return emojis[materia.toLowerCase()] || '📚';
}

// Gestione spegnimento graceful
async function sendShutdownMessage() {
    try {
        const GROUP_IDS = ['120363046559211268@g.us', '120363423664616339@g.us'];
        
        for (const GROUP_ID of GROUP_IDS) {
            try {
                await client.sendMessage(GROUP_ID, '🤖 SSCIORTBOT OFFLINE! 🤖\n\n❌ Bot spento per manutenzione\n⏰ Tornerò presto online!\n\n👋 A presto!');
                console.log(`Messaggio di spegnimento inviato a ${GROUP_ID}`);
            } catch (error) {
                console.error(`Errore invio messaggio spegnimento a ${GROUP_ID}:`, error);
            }
        }
    } catch (error) {
        console.error('Errore generale spegnimento:', error);
    }
}

// Gestori per diversi segnali di spegnimento
process.on('SIGINT', async () => {
    console.log('\nRicevuto SIGINT (Ctrl+C), spegnimento in corso...');
    await sendShutdownMessage();
    setTimeout(() => process.exit(0), 3000);
});

process.on('SIGTERM', async () => {
    console.log('\nRicevuto SIGTERM, spegnimento in corso...');
    await sendShutdownMessage();
    setTimeout(() => process.exit(0), 3000);
});

process.on('beforeExit', async () => {
    console.log('\nProcesso in chiusura...');
    await sendShutdownMessage();
});

// Gestore per Windows
if (process.platform === 'win32') {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.on('SIGINT', async () => {
        console.log('\nRicevuto SIGINT (Windows), spegnimento in corso...');
        await sendShutdownMessage();
        setTimeout(() => process.exit(0), 3000);
    });
}

// Crea directory temp per eventuali file futuri
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Initialize client
client.initialize();
