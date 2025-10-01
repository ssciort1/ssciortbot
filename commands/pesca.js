const { aggiornaClassifica } = require('./classifica');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'pesca',
    description: 'Sistema di pesca con inventario e streak system',
    async execute(msg, client) {
        const sender = msg.author || msg.from;
        const args = msg.body.split(' ').slice(1);
        
        // Lista admin
        const adminIds = ['16209290481885@lid'];
        const isAdmin = adminIds.includes(sender);
        
        // Files
        const inventarioFile = path.join(__dirname, '..', 'data', 'inventario_pesca.json');
        const cooldownFile = path.join(__dirname, '..', 'data', 'cooldown_pesca.json');
        const streakFile = path.join(__dirname, '..', 'data', 'streak_pesca.json');
        
        // Helper functions
        function caricaFile(filePath, defaultValue = {}) {
            try {
                if (!fs.existsSync(filePath)) return defaultValue;
                return JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (e) {
                return defaultValue;
            }
        }
        
        function salvaFile(filePath, data) {
            const dataDir = path.dirname(filePath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        }
        
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        // Comando admin - pesca leggendaria
        if (args[0] === 'leggendaria' && isAdmin) {
            const cooldowns = caricaFile(cooldownFile);
            const now = Date.now();
            const cooldownTime = 7000;
            
            if (cooldowns[sender] && now - cooldowns[sender] < cooldownTime) {
                const rimanente = Math.ceil((cooldownTime - (now - cooldowns[sender])) / 1000);
                await msg.reply(`⏰ Aspetta ancora ${rimanente} secondi prima di pescare!`);
                return;
            }
            
            cooldowns[sender] = now;
            salvaFile(cooldownFile, cooldowns);
            
            const leggendariIds = [37, 38, 39, 40, 41, 42, 43, 44, 45];
            const randomId = leggendariIds[Math.floor(Math.random() * leggendariIds.length)];
            const pescato = { id: randomId, nome: 'Drago Marino', emoji: '🐉', prezzo: 200 };
            
            if (randomId === 38) { pescato.nome = 'Kraken'; pescato.emoji = '🐙'; pescato.prezzo = 250; }
            else if (randomId === 39) { pescato.nome = 'Leviatano'; pescato.emoji = '🐋'; pescato.prezzo = 300; }
            else if (randomId === 40) { pescato.nome = 'Poseidon'; pescato.emoji = '🔱'; pescato.prezzo = 400; }
            else if (randomId === 41) { pescato.nome = 'Pesce Sirena'; pescato.emoji = '🧜♀️'; pescato.prezzo = 450; }
            else if (randomId === 42) { pescato.nome = 'Pesce Fantasma'; pescato.emoji = '👻'; pescato.prezzo = 500; }
            else if (randomId === 43) { pescato.nome = 'Pesce Arcobaleno'; pescato.emoji = '🌈'; pescato.prezzo = 600; }
            else if (randomId === 44) { pescato.nome = 'Pesce Stellare'; pescato.emoji = '⭐'; pescato.prezzo = 750; }
            else if (randomId === 45) { pescato.nome = 'Pesce Cosmico'; pescato.emoji = '✨'; pescato.prezzo = 1000; }
            
            const inventario = caricaFile(inventarioFile);
            if (!inventario[sender]) inventario[sender] = { pesci: {}, statistiche: { pescate: 0 } };
            if (!inventario[sender].pesci[pescato.id]) inventario[sender].pesci[pescato.id] = 0;
            inventario[sender].pesci[pescato.id]++;
            inventario[sender].statistiche.pescate++;
            
            salvaFile(inventarioFile, inventario);
            
            await msg.reply(`🎣 HAI PESCATO! 🎣\n\n${pescato.emoji} ${pescato.nome}\n🟡 Rarità: Leggendario\n💰 Valore: ${pescato.prezzo} punti`);
            return;
        }
        
        // Comando admin - ruba pesce
        if (args[0] === 'ruba' && isAdmin) {
            const mentions = await msg.getMentions();
            if (!mentions.length || !args[2]) {
                await msg.reply('❌ Uso: .pesca ruba @utente [nome_pesce]');
                return;
            }
            
            const targetId = mentions[0].id._serialized;
            const nomePesce = args.slice(2).join(' ').toLowerCase();
            const inventario = caricaFile(inventarioFile);
            
            if (!inventario[targetId]) {
                await msg.reply('❌ Utente non trovato nell\'inventario!');
                return;
            }
            
            const pesci = {
                1: { nome: 'Sardina', emoji: '🐟' }, 2: { nome: 'Acciuga', emoji: '🐟' }, 3: { nome: 'Aringa', emoji: '🐠' },
                4: { nome: 'Sgombro', emoji: '🐟' }, 5: { nome: 'Merluzzo', emoji: '🐟' }, 6: { nome: 'Nasello', emoji: '🐠' },
                7: { nome: 'Platessa', emoji: '🐟' }, 8: { nome: 'Sogliola', emoji: '🐠' }, 9: { nome: 'Baccalà', emoji: '🐟' },
                10: { nome: 'Carpa', emoji: '🐠' }, 11: { nome: 'Luccio', emoji: '🐟' }, 12: { nome: 'Pesce Persico', emoji: '🐠' },
                13: { nome: 'Anguilla', emoji: '🐍' }, 14: { nome: 'Rombo', emoji: '🐟' }, 15: { nome: 'Spigola', emoji: '🐠' },
                16: { nome: 'Trota', emoji: '🐠' }, 17: { nome: 'Salmone', emoji: '🍣' }, 18: { nome: 'Branzino', emoji: '🐟' },
                19: { nome: 'Orata', emoji: '🐠' }, 20: { nome: 'Tonno', emoji: '🐟' }, 21: { nome: 'Dentice', emoji: '🐠' },
                22: { nome: 'Ricciola', emoji: '🐟' }, 23: { nome: 'Cernia', emoji: '🐠' }, 24: { nome: 'San Pietro', emoji: '🐟' },
                25: { nome: 'Ombrina', emoji: '🐠' }, 26: { nome: 'Sarago', emoji: '🐟' }, 27: { nome: 'Pagello', emoji: '🐠' },
                28: { nome: 'Squalo Bianco', emoji: '🦈' }, 29: { nome: 'Pesce Spada', emoji: '🗡️' }, 30: { nome: 'Marlin', emoji: '🐠' },
                31: { nome: 'Manta', emoji: '🐠' }, 32: { nome: 'Squalo Tigre', emoji: '🦈' }, 33: { nome: 'Barracuda', emoji: '🐟' },
                34: { nome: 'Pesce Dorato', emoji: '🟨' }, 35: { nome: 'Squalo Martello', emoji: '🦈' }, 36: { nome: 'Razza Gigante', emoji: '🐠' },
                37: { nome: 'Drago Marino', emoji: '🐉' }, 38: { nome: 'Kraken', emoji: '🐙' }, 39: { nome: 'Leviatano', emoji: '🐋' },
                40: { nome: 'Poseidon', emoji: '🔱' }, 41: { nome: 'Pesce Sirena', emoji: '🧜♀️' }, 42: { nome: 'Pesce Fantasma', emoji: '👻' },
                43: { nome: 'Pesce Arcobaleno', emoji: '🌈' }, 44: { nome: 'Pesce Stellare', emoji: '⭐' }, 45: { nome: 'Pesce Cosmico', emoji: '✨' }
            };
            
            let pesceTrovato = null;
            for (const [id, pesce] of Object.entries(pesci)) {
                if (pesce.nome.toLowerCase() === nomePesce) {
                    pesceTrovato = { id: parseInt(id), ...pesce };
                    break;
                }
            }
            
            if (!pesceTrovato || !inventario[targetId].pesci[pesceTrovato.id] || inventario[targetId].pesci[pesceTrovato.id] === 0) {
                await msg.reply('❌ L\'utente non ha questo pesce!');
                return;
            }
            
            inventario[targetId].pesci[pesceTrovato.id]--;
            if (!inventario[sender]) inventario[sender] = { pesci: {} };
            if (!inventario[sender].pesci[pesceTrovato.id]) inventario[sender].pesci[pesceTrovato.id] = 0;
            inventario[sender].pesci[pesceTrovato.id]++;
            
            salvaFile(inventarioFile, inventario);
            
            await msg.reply(`🏴☠️ PESCE RUBATO! 🏴☠️\n\n${pesceTrovato.emoji} ${pesceTrovato.nome} rubato da @${targetId.split('@')[0]}!`);
            return;
        }
        
        // Sistema pesca principale
        if (args.length === 0) {
            const cooldowns = caricaFile(cooldownFile);
            const now = Date.now();
            const cooldownTime = 7000;
            
            if (cooldowns[sender] && now - cooldowns[sender] < cooldownTime) {
                const rimanente = Math.ceil((cooldownTime - (now - cooldowns[sender])) / 1000);
                await msg.reply(`⏰ Aspetta ancora ${rimanente} secondi prima di pescare!`);
                return;
            }
            
            cooldowns[sender] = now;
            salvaFile(cooldownFile, cooldowns);
            
            // Carica streak
            const streaks = caricaFile(streakFile);
            if (!streaks[sender]) {
                streaks[sender] = { comuni: 0, rari: 0, epici: 0 };
            }
            
            // Carica inventario
            const inventario = caricaFile(inventarioFile);
            const mioNome = msg._data?.notifyName || msg.contact?.pushname;
            const userName = mioNome || sender;
            
            if (!inventario[sender]) {
                inventario[sender] = { 
                    nome: userName, 
                    pesci: {},
                    statistiche: { pescate: 0 }
                };
            }
            
            // Controlla streak per leggendario garantito
            if (streaks[sender].epici >= 8) {
                // ANIMAZIONE LEGGENDARIO
                const animationMsg = await msg.reply('🎣 Pescando...');
                await sleep(1500);
                
                await animationMsg.edit('🌊 Qualcosa si muove nelle profondità...');
                await sleep(1500);
                
                await animationMsg.edit('⚡ La lenza vibra intensamente!');
                await sleep(1500);
                
                await animationMsg.edit('🔥 ENERGIA LEGGENDARIA RILEVATA!');
                await sleep(1500);
                
                await animationMsg.edit('✨ DESTINO SUPREMO ATTIVO! ✨');
                await sleep(1500);
                
                // Pesca leggendario garantito
                const leggendariIds = [37, 38, 39, 40, 41, 42, 43, 44, 45];
                const randomId = leggendariIds[Math.floor(Math.random() * leggendariIds.length)];
                const pescato = { id: randomId, nome: 'Drago Marino', emoji: '🐉', prezzo: 200 };
                
                if (randomId === 38) { pescato.nome = 'Kraken'; pescato.emoji = '🐙'; pescato.prezzo = 250; }
                else if (randomId === 39) { pescato.nome = 'Leviatano'; pescato.emoji = '🐋'; pescato.prezzo = 300; }
                else if (randomId === 40) { pescato.nome = 'Poseidon'; pescato.emoji = '🔱'; pescato.prezzo = 400; }
                else if (randomId === 41) { pescato.nome = 'Pesce Sirena'; pescato.emoji = '🧜♀️'; pescato.prezzo = 450; }
                else if (randomId === 42) { pescato.nome = 'Pesce Fantasma'; pescato.emoji = '👻'; pescato.prezzo = 500; }
                else if (randomId === 43) { pescato.nome = 'Pesce Arcobaleno'; pescato.emoji = '🌈'; pescato.prezzo = 600; }
                else if (randomId === 44) { pescato.nome = 'Pesce Stellare'; pescato.emoji = '⭐'; pescato.prezzo = 750; }
                else if (randomId === 45) { pescato.nome = 'Pesce Cosmico'; pescato.emoji = '✨'; pescato.prezzo = 1000; }
                
                // Reset tutti gli streak
                streaks[sender] = { comuni: 0, rari: 0, epici: 0 };
                
                // Aggiungi al inventario
                if (!inventario[sender].pesci[pescato.id]) inventario[sender].pesci[pescato.id] = 0;
                inventario[sender].pesci[pescato.id]++;
                inventario[sender].statistiche.pescate++;
                
                salvaFile(streakFile, streaks);
                salvaFile(inventarioFile, inventario);
                
                await animationMsg.edit(`💎 LEGGENDARIO PESCATO! 💎\n\n${pescato.emoji} ${pescato.nome}\n🟡 Rarità: Leggendario\n💰 Valore: ${pescato.prezzo} punti\n\n🔥 Streak Reset: 0/40 comuni`);
                return;
            }
            
            // Controlla streak per epico garantito
            if (streaks[sender].rari >= 20) {
                const epiciIds = [28, 29, 30, 31, 32, 33, 34, 35, 36];
                const randomId = epiciIds[Math.floor(Math.random() * epiciIds.length)];
                const pesci = {
                    28: { nome: 'Squalo Bianco', emoji: '🦈', prezzo: 60 },
                    29: { nome: 'Pesce Spada', emoji: '🗡️', prezzo: 70 },
                    30: { nome: 'Marlin', emoji: '🐠', prezzo: 80 },
                    31: { nome: 'Manta', emoji: '🐠', prezzo: 90 },
                    32: { nome: 'Squalo Tigre', emoji: '🦈', prezzo: 100 },
                    33: { nome: 'Barracuda', emoji: '🐟', prezzo: 110 },
                    34: { nome: 'Pesce Dorato', emoji: '🟨', prezzo: 120 },
                    35: { nome: 'Squalo Martello', emoji: '🦈', prezzo: 130 },
                    36: { nome: 'Razza Gigante', emoji: '🐠', prezzo: 140 }
                };
                
                const pescato = { id: randomId, ...pesci[randomId] };
                
                // Reset streak rari, incrementa epici
                streaks[sender].rari = 0;
                streaks[sender].epici++;
                streaks[sender].comuni = 0;
                
                if (!inventario[sender].pesci[pescato.id]) inventario[sender].pesci[pescato.id] = 0;
                inventario[sender].pesci[pescato.id]++;
                inventario[sender].statistiche.pescate++;
                
                salvaFile(streakFile, streaks);
                salvaFile(inventarioFile, inventario);
                
                await msg.reply(`🎣 HAI PESCATO! 🎣\n\n${pescato.emoji} ${pescato.nome}\n🟣 Rarità: Epico\n💰 Valore: ${pescato.prezzo} punti\n\n🌟 Karma Boost Attivato!\n🔥 Streak Reset: 0/40 comuni\n🔥 Streak Epici: ${streaks[sender].epici}/8`);
                return;
            }
            
            // Controlla streak per raro garantito
            if (streaks[sender].comuni >= 40) {
                const rariIds = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
                const randomId = rariIds[Math.floor(Math.random() * rariIds.length)];
                const pesci = {
                    16: { nome: 'Trota', emoji: '🐠', prezzo: 12 },
                    17: { nome: 'Salmone', emoji: '🍣', prezzo: 15 },
                    18: { nome: 'Branzino', emoji: '🐟', prezzo: 18 },
                    19: { nome: 'Orata', emoji: '🐠', prezzo: 20 },
                    20: { nome: 'Tonno', emoji: '🐟', prezzo: 25 },
                    21: { nome: 'Dentice', emoji: '🐠', prezzo: 28 },
                    22: { nome: 'Ricciola', emoji: '🐟', prezzo: 30 },
                    23: { nome: 'Cernia', emoji: '🐠', prezzo: 32 },
                    24: { nome: 'San Pietro', emoji: '🐟', prezzo: 35 },
                    25: { nome: 'Ombrina', emoji: '🐠', prezzo: 38 },
                    26: { nome: 'Sarago', emoji: '🐟', prezzo: 40 },
                    27: { nome: 'Pagello', emoji: '🐠', prezzo: 42 }
                };
                
                const pescato = { id: randomId, ...pesci[randomId] };
                
                // Reset streak comuni, incrementa rari
                streaks[sender].comuni = 0;
                streaks[sender].rari++;
                
                if (!inventario[sender].pesci[pescato.id]) inventario[sender].pesci[pescato.id] = 0;
                inventario[sender].pesci[pescato.id]++;
                inventario[sender].statistiche.pescate++;
                
                salvaFile(streakFile, streaks);
                salvaFile(inventarioFile, inventario);
                
                await msg.reply(`🎣 HAI PESCATO! 🎣\n\n${pescato.emoji} ${pescato.nome}\n🔵 Rarità: Rara\n💰 Valore: ${pescato.prezzo} punti\n\n⚡ Bonus Fortuna Attivato!\n🔥 Streak Reset: 0/40 comuni\n🔥 Streak Rari: ${streaks[sender].rari}/20`);
                return;
            }
            
            // Pesca normale
            const pesciComuni = {
                1: { nome: 'Sardina', emoji: '🐟', prezzo: 2 },
                2: { nome: 'Acciuga', emoji: '🐟', prezzo: 2 },
                3: { nome: 'Aringa', emoji: '🐠', prezzo: 3 },
                4: { nome: 'Sgombro', emoji: '🐟', prezzo: 3 },
                5: { nome: 'Merluzzo', emoji: '🐟', prezzo: 4 },
                6: { nome: 'Nasello', emoji: '🐠', prezzo: 4 },
                7: { nome: 'Platessa', emoji: '🐟', prezzo: 5 },
                8: { nome: 'Sogliola', emoji: '🐠', prezzo: 5 },
                9: { nome: 'Baccalà', emoji: '🐟', prezzo: 6 },
                10: { nome: 'Carpa', emoji: '🐠', prezzo: 6 },
                11: { nome: 'Luccio', emoji: '🐟', prezzo: 7 },
                12: { nome: 'Pesce Persico', emoji: '🐠', prezzo: 7 },
                13: { nome: 'Anguilla', emoji: '🐍', prezzo: 8 },
                14: { nome: 'Rombo', emoji: '🐟', prezzo: 8 },
                15: { nome: 'Spigola', emoji: '🐠', prezzo: 9 }
            };
            
            const randomId = Math.floor(Math.random() * 15) + 1;
            const pescato = { id: randomId, ...pesciComuni[randomId] };
            
            // Incrementa streak comuni
            streaks[sender].comuni++;
            
            if (!inventario[sender].pesci[pescato.id]) inventario[sender].pesci[pescato.id] = 0;
            inventario[sender].pesci[pescato.id]++;
            inventario[sender].statistiche.pescate++;
            
            salvaFile(streakFile, streaks);
            salvaFile(inventarioFile, inventario);
            
            await msg.reply(`🎣 HAI PESCATO! 🎣\n\n${pescato.emoji} ${pescato.nome}\n⚪ Rarità: Comune\n💰 Valore: ${pescato.prezzo} punti\n\n🔥 Streak: ${streaks[sender].comuni}/40 comuni`);
            return;
        }
        
        // Altri comandi esistenti (inventario, vendi, etc.)
        await msg.reply('🎣 SISTEMA PESCA CON STREAK! 🎣\n\n🔥 NUOVO: Sistema Streak Anti-Sfortuna!\n• 40 comuni → Raro garantito\n• 20 rari → Epico garantito  \n• 8 epici → Leggendario garantito\n\n📝 Comandi:\n• .pesca - Pesca con streak system\n• .pesca inventario - Vedi pesci\n• .pesca help - Guida completa');
    }
};