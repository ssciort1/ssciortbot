// WhatsApp bot using whatsapp-web.js
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const express = require('express'); // Nuovo: server per ping

// =====================
// Server HTTP minimale
// =====================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 SsciortBot attivo!');
});

const crypto = require('crypto');
const { MessageMedia } = require('whatsapp-web.js');
app.use(express.json({ limit: '50mb' })); // per ricevere base64 o JSON grandi
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // per form-data

// 🔐 Frase segreta da usare anche in PHP
const SECRET_PHRASE = 'vediamo_se_indovini';

// === ENDPOINT PER INVIO MESSAGGI E IMMAGINI ===
app.post('/sendPHP', async (req, res) => {
    try {
        const { phone, text, image, token, token_chiaro } = req.body;

        if (!phone || !token) {
            return res.status(400).json({ success: false, error: 'Parametri mancanti (phone o token).' });
        }

        // ✅ Verifica token di sicurezza
        // Costruzione stringa
        const str = (phone + SECRET_PHRASE + text).trim(); // trim per eliminare spazi invisibili

        // Calcolo hash MD5 in binario
        const md5Binary = crypto.createHash('md5').update(str, 'utf8').digest(); // buffer binario

        // Converti in base64
        const miotoken = md5Binary.toString('base64');

/*
        const expectedHash = crypto.createHash('md5').update(phone + SECRET_PHRASE + (text || '')).digest('hex');
        const expectedToken = Buffer.from(expectedHash).toString('base64');
*/
        /*
        if (token !== expectedToken) {
            console.warn('Tentativo di accesso non autorizzato!');
            return res.status(403).json({ success: false, error: 'Token non valido.' });
        }
*/
        if (token !== miotoken) {
            //const debugString = phone + SECRET_PHRASE + (text || '');
            //const md5Hex = crypto.createHash('md5').update(debugString).digest('hex');

            console.warn('⚠️ Tentativo di accesso non autorizzato!');
            console.warn('👉 Stringa usata per hash:', debugString);
            console.warn('👉 Hash MD5 calcolato:', md5Hex);
            console.warn('👉 Token atteso (base64):', expectedToken);
            console.warn('👉 Token ricevuto:', token);

            return res.status(403).json({
                success: false,
                error: 'Token non valido.',
                debug: {
                    jsToken: md5Binary,
                    jsToken64: miotoken,
                    received_token: token,
                    token_chiaro: token_chiaro
                }
            });
        }
        const chatId = phone.replace(/\D/g, '') + '@c.us';

        // === Caso 1: messaggio con immagine ===
        if (image) {
            let media;

            if (image.startsWith('http')) {
                media = await MessageMedia.fromUrl(image);
            } else if (image.startsWith('data:')) {
                media = new MessageMedia(
                    image.split(';')[0].split(':')[1],
                    image.split(',')[1]
                );
            } else {
                return res.status(400).json({ success: false, error: 'Formato immagine non valido (usa URL o base64).' });
            }

            await client.sendMessage(chatId, media, { caption: text || '' });
            console.log(`📸 Immagine inviata a ${chatId} (${text || 'senza testo'})`);
            return res.json({ success: true, type: 'image', sent_to: chatId });
        }

        // === Caso 2: solo testo ===
        if (text) {
            await client.sendMessage(chatId, text);
            console.log(`💬 Messaggio inviato a ${chatId}: ${text}`);
            return res.json({ success: true, type: 'text', sent_to: chatId });
        }

        return res.status(400).json({ success: false, error: 'Nessun contenuto da inviare.' });

    } catch (error) {
        console.error('❌ Errore invio messaggio:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server di ping attivo su porta ${PORT}`));

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
    startScheduledMessage();
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

// ============================
// Messaggio programmato a un contatto
// ============================
function startScheduledMessage() {
    setInterval(async () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // Imposta qui l'ora e i minuti (es: 18:30)
        if (hours === 13 && minutes === 30) {
            await sendScheduledMessage();
        }
    }, 40000); // controlla ogni 40 secondi
}

async function sendScheduledMessage() {
    const CONTACT_ID = '393286287755@c.us'; // numero WhatsApp nel formato internazionale
    const message = `🌇 Buonasera! Questo è un messaggio automatico inviato alle 13:30.`;

    try {
        await client.sendMessage(CONTACT_ID, message);
        console.log(`Messaggio programmato inviato a ${CONTACT_ID}`);
    } catch (error) {
        console.error('Errore invio messaggio programmato:', error);
    }
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
