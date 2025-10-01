const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'streaks',
    description: 'Mostra i tuoi streak di vittorie',
    async execute(msg) {
        const sender = msg.author || msg.from;
        const streaksFile = path.join(__dirname, '..', 'data', 'game_streaks.json');
        
        try {
            let streaks = {};
            if (fs.existsSync(streaksFile)) {
                streaks = JSON.parse(fs.readFileSync(streaksFile, 'utf8'));
            }
            
            const userStreaks = streaks[sender] || {};
            
            let message = `🔥 I TUOI STREAK DI VITTORIE 🔥\n\n`;
            
            const games = {
                'slot': { name: '🎰 Slot', emoji: '🎰' },
                'dado': { name: '🎲 Dado', emoji: '🎲' },
                'blackjack': { name: '🃏 Blackjack', emoji: '🃏' },
                'cavalli': { name: '🐎 Cavalli', emoji: '🐎' },
                'duello': { name: '⚔️ Duello', emoji: '⚔️' },
                'pesca': { name: '🎣 Pesca', emoji: '🎣' }
            };
            
            let hasStreaks = false;
            
            for (const [gameId, gameInfo] of Object.entries(games)) {
                const gameStreak = userStreaks[gameId] || { current: 0, best: 0 };
                
                if (gameStreak.current > 0 || gameStreak.best > 0) {
                    hasStreaks = true;
                    const currentIcon = gameStreak.current > 0 ? '🔥' : '❄️';
                    message += `${gameInfo.emoji} ${gameInfo.name}:\n`;
                    message += `  ${currentIcon} Attuale: ${gameStreak.current}\n`;
                    message += `  🏆 Record: ${gameStreak.best}\n\n`;
                }
            }
            
            if (!hasStreaks) {
                message += `🎯 Nessun streak ancora!\n\n`;
                message += `💡 Vinci consecutivamente per creare streak!\n`;
                message += `🔥 Ogni vittoria aumenta lo streak\n`;
                message += `❄️ Ogni sconfitta lo resetta\n\n`;
                message += `🚀 Inizia a giocare per creare streak!`;
            } else {
                message += `🎯 Continua a vincere per aumentare gli streak!`;
            }
            
            await msg.reply(message);
            
        } catch (error) {
            console.error('Errore streaks:', error);
            await msg.reply('❌ Errore nel caricamento delle strisce!');
        }
    }
};

// Sistema streak universale
global.updateStreak = function(userId, game, isWin) {
    const streaksFile = path.join(__dirname, '..', 'data', 'game_streaks.json');
    
    try {
        let streaks = {};
        if (fs.existsSync(streaksFile)) {
            streaks = JSON.parse(fs.readFileSync(streaksFile, 'utf8'));
        }
        
        if (!streaks[userId]) streaks[userId] = {};
        if (!streaks[userId][game]) streaks[userId][game] = { current: 0, best: 0 };
        
        if (isWin) {
            // Incrementa striscia attuale
            streaks[userId][game].current++;
            
            // Aggiorna record se necessario
            if (streaks[userId][game].current > streaks[userId][game].best) {
                streaks[userId][game].best = streaks[userId][game].current;
            }
        } else {
            // Reset striscia attuale
            streaks[userId][game].current = 0;
        }
        
        // Salva
        const dataDir = path.dirname(streaksFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(streaksFile, JSON.stringify(streaks, null, 2));
        
        return streaks[userId][game];
        
    } catch (error) {
        console.error('Errore aggiornamento streak:', error);
        return { current: 0, best: 0 };
    }
};

// Funzione per ottenere streak
global.getStreak = function(userId, game) {
    const streaksFile = path.join(__dirname, '..', 'data', 'game_streaks.json');
    
    try {
        if (!fs.existsSync(streaksFile)) return { current: 0, best: 0 };
        
        const streaks = JSON.parse(fs.readFileSync(streaksFile, 'utf8'));
        return streaks[userId]?.[game] || { current: 0, best: 0 };
        
    } catch (error) {
        console.error('Errore lettura streak:', error);
        return { current: 0, best: 0 };
    }
};