const { aggiornaClassifica } = require('./classifica');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'pesca',
    description: 'Sistema di pesca con inventario',
    async execute(msg, client) {
        const sender = msg.author || msg.from;
        const args = msg.body.split(' ').slice(1);
        
        // Lista admin
        const adminIds = ['16209290481885@lid'];
        const isAdmin = adminIds.includes(sender);
        
        // Comando admin - pesca leggendaria
        if (args[0] === 'leggendaria' && isAdmin) {
            const inventarioFile = path.join(__dirname, '..', 'data', 'inventario_pesca.json');
            const cooldownFile = path.join(__dirname, '..', 'data', 'cooldown_pesca.json');
            
            function caricaCooldown() {
                try {
                    if (!fs.existsSync(cooldownFile)) return {};
                    return JSON.parse(fs.readFileSync(cooldownFile, 'utf8'));
                } catch (e) {
                    return {};
                }
            }
            
            function salvaCooldown(data) {
                const dataDir = path.dirname(cooldownFile);
                if (!fs.existsSync(dataDir)) {
                    fs.mkdirSync(dataDir, { recursive: true });
                }
                fs.writeFileSync(cooldownFile, JSON.stringify(data, null, 2));
            }
            
            const cooldowns = caricaCooldown();
            const now = Date.now();
            const cooldownTime = 7000;
            
            if (cooldowns[sender] && now - cooldowns[sender] < cooldownTime) {
                const rimanente = Math.ceil((cooldownTime - (now - cooldowns[sender])) / 1000);
                await msg.reply(`⏰ Aspetta ancora ${rimanente} secondi prima di pescare!`);
                return;
            }
            
            cooldowns[sender] = now;
            salvaCooldown(cooldowns);
            
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
            
            const inventario = JSON.parse(fs.readFileSync(inventarioFile, 'utf8') || '{}');
            if (!inventario[sender]) inventario[sender] = { pesci: {}, statistiche: { pescate: 0 } };
            if (!inventario[sender].pesci[pescato.id]) inventario[sender].pesci[pescato.id] = 0;
            inventario[sender].pesci[pescato.id]++;
            inventario[sender].statistiche.pescate++;
            
            fs.writeFileSync(inventarioFile, JSON.stringify(inventario, null, 2));
            
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
            const inventario = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'inventario_pesca.json'), 'utf8') || '{}');
            
            if (!inventario[targetId]) {
                await msg.reply('❌ Utente non trovato nell\'inventario!');
                return;
            }
            
            let pesceTrovato = null;
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
            
            for (const [id, pesce] of Object.entries(pesci)) {
                if (pesce.nome.toLowerCase() === nomePesce) {
                    pesceTrovato = { id: parseInt(id), ...pesce };
                    break;
                }
            }
            
            if (!pesceTrovato) {
                await msg.reply('❌ Pesce non trovato!');
                return;
            }
            
            if (!inventario[targetId].pesci[pesceTrovato.id] || inventario[targetId].pesci[pesceTrovato.id] === 0) {
                await msg.reply('❌ L\'utente non ha questo pesce!');
                return;
            }
            
            // Ruba il pesce
            inventario[targetId].pesci[pesceTrovato.id]--;
            if (!inventario[sender]) inventario[sender] = { pesci: {} };
            if (!inventario[sender].pesci[pesceTrovato.id]) inventario[sender].pesci[pesceTrovato.id] = 0;
            inventario[sender].pesci[pesceTrovato.id]++;
            
            fs.writeFileSync(path.join(__dirname, '..', 'data', 'inventario_pesca.json'), JSON.stringify(inventario, null, 2));
            
            await msg.reply(`🏴‍☠️ PESCE RUBATO! 🏴‍☠️\n\n${pesceTrovato.emoji} ${pesceTrovato.nome} rubato da @${targetId.split('@')[0]}!`);
            return;
        }
        
        const inventarioFile = path.join(__dirname, '..', 'data', 'inventario_pesca.json');
        const tradeFile = path.join(__dirname, '..', 'data', 'trade_pesca.json');
        
        function caricaTrade() {
            try {
                if (!fs.existsSync(tradeFile)) return {};
                return JSON.parse(fs.readFileSync(tradeFile, 'utf8'));
            } catch (e) {
                return {};
            }
        }
        
        function salvaTrade(data) {
            const dataDir = path.dirname(tradeFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(tradeFile, JSON.stringify(data, null, 2));
        }
        
        const pesci = {
            // ⚪ COMUNI (70%)
            1: { nome: 'Sardina', emoji: '🐟', prezzo: 2, probabilita: 8 },
            2: { nome: 'Acciuga', emoji: '🐟', prezzo: 2, probabilita: 7 },
            3: { nome: 'Aringa', emoji: '🐠', prezzo: 3, probabilita: 7 },
            4: { nome: 'Sgombro', emoji: '🐟', prezzo: 3, probabilita: 6 },
            5: { nome: 'Merluzzo', emoji: '🐟', prezzo: 4, probabilita: 6 },
            6: { nome: 'Nasello', emoji: '🐠', prezzo: 4, probabilita: 5 },
            7: { nome: 'Platessa', emoji: '🐟', prezzo: 5, probabilita: 5 },
            8: { nome: 'Sogliola', emoji: '🐠', prezzo: 5, probabilita: 4 },
            9: { nome: 'Baccalà', emoji: '🐟', prezzo: 6, probabilita: 4 },
            10: { nome: 'Carpa', emoji: '🐠', prezzo: 6, probabilita: 4 },
            11: { nome: 'Luccio', emoji: '🐟', prezzo: 7, probabilita: 3 },
            12: { nome: 'Pesce Persico', emoji: '🐠', prezzo: 7, probabilita: 3 },
            13: { nome: 'Anguilla', emoji: '🐍', prezzo: 8, probabilita: 3 },
            14: { nome: 'Rombo', emoji: '🐟', prezzo: 8, probabilita: 3 },
            15: { nome: 'Spigola', emoji: '🐠', prezzo: 9, probabilita: 2 },
            
            // 🟢 RARI (20%)
            16: { nome: 'Trota', emoji: '🐠', prezzo: 12, probabilita: 3 },
            17: { nome: 'Salmone', emoji: '🍣', prezzo: 15, probabilita: 2.5 },
            18: { nome: 'Branzino', emoji: '🐟', prezzo: 18, probabilita: 2.5 },
            19: { nome: 'Orata', emoji: '🐠', prezzo: 20, probabilita: 2 },
            20: { nome: 'Tonno', emoji: '🐟', prezzo: 25, probabilita: 2 },
            21: { nome: 'Dentice', emoji: '🐠', prezzo: 28, probabilita: 1.5 },
            22: { nome: 'Ricciola', emoji: '🐟', prezzo: 30, probabilita: 1.5 },
            23: { nome: 'Cernia', emoji: '🐠', prezzo: 32, probabilita: 1.5 },
            24: { nome: 'San Pietro', emoji: '🐟', prezzo: 35, probabilita: 1 },
            25: { nome: 'Ombrina', emoji: '🐠', prezzo: 38, probabilita: 1 },
            26: { nome: 'Sarago', emoji: '🐟', prezzo: 40, probabilita: 1 },
            27: { nome: 'Pagello', emoji: '🐠', prezzo: 42, probabilita: 0.5 },
            
            // 🟣 EPICI (8%)
            28: { nome: 'Squalo Bianco', emoji: '🦈', prezzo: 60, probabilita: 1.5 },
            29: { nome: 'Pesce Spada', emoji: '🗡️', prezzo: 70, probabilita: 1.2 },
            30: { nome: 'Marlin', emoji: '🐠', prezzo: 80, probabilita: 1 },
            31: { nome: 'Manta', emoji: '🐠', prezzo: 90, probabilita: 1 },
            32: { nome: 'Squalo Tigre', emoji: '🦈', prezzo: 100, probabilita: 0.8 },
            33: { nome: 'Barracuda', emoji: '🐟', prezzo: 110, probabilita: 0.8 },
            34: { nome: 'Pesce Dorato', emoji: '🟨', prezzo: 120, probabilita: 0.7 },
            35: { nome: 'Squalo Martello', emoji: '🦈', prezzo: 130, probabilita: 0.5 },
            36: { nome: 'Razza Gigante', emoji: '🐠', prezzo: 140, probabilita: 0.5 },
            
            // 🟡 LEGGENDARI (2%)
            37: { nome: 'Drago Marino', emoji: '🐉', prezzo: 200, probabilita: 0.4 },
            38: { nome: 'Kraken', emoji: '🐙', prezzo: 250, probabilita: 0.3 },
            39: { nome: 'Leviatano', emoji: '🐋', prezzo: 300, probabilita: 0.3 },
            40: { nome: 'Poseidon', emoji: '🔱', prezzo: 400, probabilita: 0.2 },
            41: { nome: 'Pesce Sirena', emoji: '🧜‍♀️', prezzo: 450, probabilita: 0.2 },
            42: { nome: 'Pesce Fantasma', emoji: '👻', prezzo: 500, probabilita: 0.2 },
            43: { nome: 'Pesce Arcobaleno', emoji: '🌈', prezzo: 600, probabilita: 0.2 },
            44: { nome: 'Pesce Stellare', emoji: '⭐', prezzo: 750, probabilita: 0.1 },
            45: { nome: 'Pesce Cosmico', emoji: '✨', prezzo: 1000, probabilita: 0.1 }
        };
        
        function caricaInventario() {
            try {
                if (!fs.existsSync(inventarioFile)) return {};
                return JSON.parse(fs.readFileSync(inventarioFile, 'utf8'));
            } catch (e) {
                return {};
            }
        }
        
        function salvaInventario(data) {
            const dataDir = path.dirname(inventarioFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(inventarioFile, JSON.stringify(data, null, 2));
        }
        
        const attrezzature = {
            canne: {
                1: { nome: 'Canna Base', bonus: 0, prezzo: 0 },
                2: { nome: 'Canna Buona', bonus: 5, prezzo: 50 },
                3: { nome: 'Canna Pro', bonus: 15, prezzo: 200 },
                4: { nome: 'Canna Leggendaria', bonus: 30, prezzo: 500 }
            },
            ami: {
                1: { nome: 'Amo Base', bonus: 0, prezzo: 0 },
                2: { nome: 'Amo Affilato', bonus: 3, prezzo: 30 },
                3: { nome: 'Amo Dorato', bonus: 8, prezzo: 100 },
                4: { nome: 'Amo Magico', bonus: 20, prezzo: 300 }
            },
            esche: {
                1: { nome: 'Verme', bonus: 0, prezzo: 0 },
                2: { nome: 'Grillo', bonus: 2, prezzo: 20 },
                3: { nome: 'Esca Speciale', bonus: 6, prezzo: 80 },
                4: { nome: 'Esca Leggendaria', bonus: 15, prezzo: 250 }
            }
        };
        

        
        // Sistema nomi
        const nomiFile = path.join(__dirname, '..', 'data', 'nomi_giocatori.json');
        
        function checkAchievements(playerId, playerData) {
            const achievements = [
                // Pesca base
                { id: 'primo_pesce', nome: 'Primo Pesce', desc: 'Pesca il tuo primo pesce', condizione: () => playerData.statistiche.pescate >= 1 },
                { id: 'pescatore_novizio', nome: 'Pescatore Novizio', desc: 'Pesca 10 pesci', condizione: () => playerData.statistiche.pescate >= 10 },
                { id: 'pescatore', nome: 'Pescatore', desc: 'Pesca 50 pesci', condizione: () => playerData.statistiche.pescate >= 50 },
                { id: 'pescatore_esperto', nome: 'Pescatore Esperto', desc: 'Pesca 100 pesci', condizione: () => playerData.statistiche.pescate >= 100 },
                { id: 'maestro_pescatore', nome: 'Maestro Pescatore', desc: 'Pesca 250 pesci', condizione: () => playerData.statistiche.pescate >= 250 },
                { id: 'leggenda_pesca', nome: 'Leggenda della Pesca', desc: 'Pesca 500 pesci', condizione: () => playerData.statistiche.pescate >= 500 },
                
                // Vendite
                { id: 'primo_affare', nome: 'Primo Affare', desc: 'Vendi il tuo primo pesce', condizione: () => playerData.statistiche.vendite >= 1 },
                { id: 'commerciante', nome: 'Commerciante', desc: 'Vendi 20 pesci', condizione: () => playerData.statistiche.vendite >= 20 },
                { id: 'mercante', nome: 'Mercante del Mare', desc: 'Vendi 100 pesci', condizione: () => playerData.statistiche.vendite >= 100 },
                { id: 'magnate', nome: 'Magnate Ittico', desc: 'Vendi 300 pesci', condizione: () => playerData.statistiche.vendite >= 300 },
                
                // Collezione
                { id: 'collezionista', nome: 'Collezionista', desc: 'Possiedi 10 pesci diversi', condizione: () => Object.keys(playerData.pesci).filter(id => playerData.pesci[id] > 0).length >= 10 },
                { id: 'curatore', nome: 'Curatore Marino', desc: 'Possiedi 20 pesci diversi', condizione: () => Object.keys(playerData.pesci).filter(id => playerData.pesci[id] > 0).length >= 20 },
                { id: 'archivista', nome: 'Archivista Oceanico', desc: 'Possiedi 30 pesci diversi', condizione: () => Object.keys(playerData.pesci).filter(id => playerData.pesci[id] > 0).length >= 30 },
                { id: 'completista', nome: 'Completista Supremo', desc: 'Possiedi tutti i 45 pesci', condizione: () => Object.keys(playerData.pesci).filter(id => playerData.pesci[id] > 0).length >= 45 },
                
                // Rarità specifiche
                { id: 'cacciatore_rari', nome: 'Cacciatore di Rari', desc: 'Pesca 10 pesci rari', condizione: () => Object.keys(playerData.pesci).filter(id => parseInt(id) >= 16 && parseInt(id) <= 27 && playerData.pesci[id] > 0).length >= 10 },
                { id: 'domatore_epici', nome: 'Domatore di Epici', desc: 'Pesca 5 pesci epici', condizione: () => Object.keys(playerData.pesci).filter(id => parseInt(id) >= 28 && parseInt(id) <= 36 && playerData.pesci[id] > 0).length >= 5 },
                { id: 'leggenda', nome: 'Leggenda del Mare', desc: 'Pesca un pesce leggendario', condizione: () => Object.keys(playerData.pesci).some(id => parseInt(id) >= 37 && playerData.pesci[id] > 0) },
                { id: 'signore_abissi', nome: 'Signore degli Abissi', desc: 'Pesca tutti i pesci leggendari', condizione: () => Object.keys(playerData.pesci).filter(id => parseInt(id) >= 37 && playerData.pesci[id] > 0).length >= 9 },
                
                // Pesci specifici
                { id: 'cacciatore_squali', nome: 'Cacciatore di Squali', desc: 'Pesca Squalo Bianco, Tigre e Martello', condizione: () => [28, 32, 35].every(id => playerData.pesci[id] > 0) },
                { id: 'cosmico', nome: 'Pescatore Cosmico', desc: 'Pesca il Pesce Cosmico', condizione: () => playerData.pesci[45] > 0 },
                { id: 'stellare', nome: 'Cacciatore Stellare', desc: 'Pesca il Pesce Stellare', condizione: () => playerData.pesci[44] > 0 },
                
                // Quantità
                { id: 'accumulatore', nome: 'Accumulatore', desc: 'Possiedi 50 pesci totali', condizione: () => Object.values(playerData.pesci).reduce((sum, qty) => sum + qty, 0) >= 50 },
                { id: 'magazziniere', nome: 'Magazziniere', desc: 'Possiedi 100 pesci totali', condizione: () => Object.values(playerData.pesci).reduce((sum, qty) => sum + qty, 0) >= 100 },
                
                // Scambi
                { id: 'primo_scambio', nome: 'Primo Scambio', desc: 'Completa il tuo primo scambio', condizione: () => playerData.statistiche.scambi >= 1 },
                { id: 'diplomatico', nome: 'Diplomatico Marino', desc: 'Completa 10 scambi', condizione: () => playerData.statistiche.scambi >= 10 },
                
                // Attrezzature
                { id: 'equipaggiato', nome: 'Ben Equipaggiato', desc: 'Compra la prima attrezzatura', condizione: () => Object.values(playerData.attrezzatura).some(level => level > 1) },
                { id: 'professionista', nome: 'Professionista', desc: 'Raggiungi livello 3 in tutte le attrezzature', condizione: () => Object.values(playerData.attrezzatura).every(level => level >= 3) },
                { id: 'leggendario_gear', nome: 'Gear Leggendario', desc: 'Raggiungi livello 4 in tutte le attrezzature', condizione: () => Object.values(playerData.attrezzatura).every(level => level >= 4) }
            ];
            
            let newAchievements = [];
            achievements.forEach(achievement => {
                if (!playerData.achievements.includes(achievement.id) && achievement.condizione()) {
                    playerData.achievements.push(achievement.id);
                    newAchievements.push(achievement.nome);
                }
            });
            
            return newAchievements;
        }
        
        function caricaNomi() {
            try {
                if (!fs.existsSync(nomiFile)) return {};
                return JSON.parse(fs.readFileSync(nomiFile, 'utf8'));
            } catch (e) {
                return {};
            }
        }
        
        function salvaNomi(data) {
            const dataDir = path.dirname(nomiFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(nomiFile, JSON.stringify(data, null, 2));
        }
        
        const mioNome = msg._data?.notifyName || msg.contact?.pushname;
        if (mioNome && mioNome !== sender) {
            const nomi = caricaNomi();
            nomi[sender] = mioNome;
            salvaNomi(nomi);
        }
        
        const userName = mioNome || sender;
        const inventario = caricaInventario();
        
        function pescaCasuale() {
            const bonusAttrezzatura = (inventario[sender].attrezzatura?.canna || 1) + 
                                    (inventario[sender].attrezzatura?.amo || 1) + 
                                    (inventario[sender].attrezzatura?.esca || 1);
            const bonusPercentuale = Math.min(bonusAttrezzatura * 2, 50); // Max 50% bonus
            
            const rand = Math.random() * (100 - bonusPercentuale);
            let somma = 0;
            
            for (const [id, pesce] of Object.entries(pesci)) {
                somma += pesce.probabilita;
                if (rand <= somma) {
                    return { id: parseInt(id), ...pesce };
                }
            }
            return { id: 1, ...pesci[1] };
        }
        
        if (!inventario[sender]) {
            inventario[sender] = { 
                nome: userName, 
                pesci: {},
                attrezzatura: { canna: 1, amo: 1, esca: 1 },
                achievements: [],
                statistiche: { pescate: 0, vendite: 0, scambi: 0 }
            };
        }
        
        // Assicurati che tutte le proprietà esistano
        if (!inventario[sender].statistiche) {
            inventario[sender].statistiche = { pescate: 0, vendite: 0, scambi: 0 };
        }
        if (!inventario[sender].attrezzatura) {
            inventario[sender].attrezzatura = { canna: 1, amo: 1, esca: 1 };
        }
        if (!inventario[sender].achievements) {
            inventario[sender].achievements = [];
        }
        
        // Achievements
        if (args[0] === 'achievements' || args[0] === 'obiettivi') {
            let message = '🏆 ACHIEVEMENTS PESCA 🏆\n\n';
            
            const achievements = [
                { id: 'primo_pesce', nome: 'Primo Pesce', desc: 'Pesca il tuo primo pesce' },
                { id: 'pescatore_novizio', nome: 'Pescatore Novizio', desc: 'Pesca 10 pesci' },
                { id: 'pescatore', nome: 'Pescatore', desc: 'Pesca 50 pesci' },
                { id: 'pescatore_esperto', nome: 'Pescatore Esperto', desc: 'Pesca 100 pesci' },
                { id: 'maestro_pescatore', nome: 'Maestro Pescatore', desc: 'Pesca 250 pesci' },
                { id: 'leggenda_pesca', nome: 'Leggenda della Pesca', desc: 'Pesca 500 pesci' },
                { id: 'primo_affare', nome: 'Primo Affare', desc: 'Vendi il tuo primo pesce' },
                { id: 'commerciante', nome: 'Commerciante', desc: 'Vendi 20 pesci' },
                { id: 'mercante', nome: 'Mercante del Mare', desc: 'Vendi 100 pesci' },
                { id: 'magnate', nome: 'Magnate Ittico', desc: 'Vendi 300 pesci' },
                { id: 'collezionista', nome: 'Collezionista', desc: 'Possiedi 10 pesci diversi' },
                { id: 'curatore', nome: 'Curatore Marino', desc: 'Possiedi 20 pesci diversi' },
                { id: 'archivista', nome: 'Archivista Oceanico', desc: 'Possiedi 30 pesci diversi' },
                { id: 'completista', nome: 'Completista Supremo', desc: 'Possiedi tutti i 45 pesci' },
                { id: 'cacciatore_rari', nome: 'Cacciatore di Rari', desc: 'Pesca 10 pesci rari' },
                { id: 'domatore_epici', nome: 'Domatore di Epici', desc: 'Pesca 5 pesci epici' },
                { id: 'leggenda', nome: 'Leggenda del Mare', desc: 'Pesca un pesce leggendario' },
                { id: 'signore_abissi', nome: 'Signore degli Abissi', desc: 'Pesca tutti i pesci leggendari' },
                { id: 'cacciatore_squali', nome: 'Cacciatore di Squali', desc: 'Pesca tutti i tipi di squalo' },
                { id: 'cosmico', nome: 'Pescatore Cosmico', desc: 'Pesca il Pesce Cosmico' },
                { id: 'stellare', nome: 'Cacciatore Stellare', desc: 'Pesca il Pesce Stellare' },
                { id: 'accumulatore', nome: 'Accumulatore', desc: 'Possiedi 50 pesci totali' },
                { id: 'magazziniere', nome: 'Magazziniere', desc: 'Possiedi 100 pesci totali' },
                { id: 'primo_scambio', nome: 'Primo Scambio', desc: 'Completa il tuo primo scambio' },
                { id: 'diplomatico', nome: 'Diplomatico Marino', desc: 'Completa 10 scambi' },
                { id: 'equipaggiato', nome: 'Ben Equipaggiato', desc: 'Compra la prima attrezzatura' },
                { id: 'professionista', nome: 'Professionista', desc: 'Livello 3 in tutte le attrezzature' },
                { id: 'leggendario_gear', nome: 'Gear Leggendario', desc: 'Livello 4 in tutte le attrezzature' }
            ];
            
            achievements.forEach(ach => {
                const sbloccato = inventario[sender].achievements.includes(ach.id);
                const status = sbloccato ? '✅' : '❌';
                message += `${status} ${ach.nome}\n   ${ach.desc}\n\n`;
            });
            
            const sbloccati = inventario[sender].achievements.length;
            message += `🏆 Sbloccati: ${sbloccati}/${achievements.length}`;
            
            await msg.reply(message);
            return;
        }
        
        // Help pesca
        if (args[0] === 'help') {
            let message = '🎣 GUIDA COMPLETA PESCA 🎣\n\n';
            
            message += '🎯 COMANDI BASE:\n';
            message += '• .pesca - Pesca un pesce casuale\n';
            message += '• .pesca inventario - Vedi i tuoi pesci\n';
            message += '• .pesca vendi [nome] - Vendi pesce\n';
            message += '• .pesca vendi tutto - Vendi tutto\n';
            message += '• .pesca vendi [categoria] - Vendi categoria\n';
            message += '• .pesca lista - Tutti i pesci disponibili\n';
            message += '• .pesca achievements - Vedi tutti gli obiettivi\n\n';
            
            message += '🛒 ATTREZZATURE:\n';
            message += '• .pesca negozio - Vedi attrezzature\n';
            message += '• .pesca compra [tipo] [livello] - Compra attrezzatura\n';
            message += '   Es: .pesca compra canna 2\n\n';
            
            message += '🔄 SCAMBI:\n';
            message += '• .pesca scambio @nome [pesce] - Proponi scambio\n';
            message += '• .pesca trades - Vedi scambi in corso\n';
            message += '• .pesca accetta [id] - Accetta scambio\n';
            message += '• .pesca rifiuta [id] - Rifiuta scambio\n\n';
            
            message += '🏆 PROGRESSIONE:\n';
            message += '• .classifica pesca - Classifica pescatori\n\n';
            
            message += '🌊 RARITÀ PESCI:\n';
            message += '⚪ Comuni (60%) - 2-3 punti\n';
            message += '🟢 Rari (25%) - 8-18 punti\n';
            message += '🟣 Epici (12%) - 35-60 punti\n';
            message += '🟡 Leggendari (3%) - 120-500 punti\n\n';
            
            message += '💡 SUGGERIMENTI:\n';
            message += '• Migliora attrezzature per pesci più rari\n';
            message += '• Scambia pesci con altri giocatori\n';
            message += '• Completa achievements per sbloccare tutto\n';
            message += '• Il Pesce Cosmico ✨ è il più raro!';
            
            await msg.reply(message);
            return;
        }
        
        // Cooldown pesca
        const cooldownFile = path.join(__dirname, '..', 'data', 'cooldown_pesca.json');
        
        function caricaCooldown() {
            try {
                if (!fs.existsSync(cooldownFile)) return {};
                return JSON.parse(fs.readFileSync(cooldownFile, 'utf8'));
            } catch (e) {
                return {};
            }
        }
        
        function salvaCooldown(data) {
            const dataDir = path.dirname(cooldownFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(cooldownFile, JSON.stringify(data, null, 2));
        }
        
        // Pesca
        if (args.length === 0) {
            const cooldowns = caricaCooldown();
            const now = Date.now();
            const cooldownTime = 7000; // 7 secondi
            
            if (cooldowns[sender] && now - cooldowns[sender] < cooldownTime) {
                const rimanente = Math.ceil((cooldownTime - (now - cooldowns[sender])) / 1000);
                await msg.reply(`⏰ Aspetta ancora ${rimanente} secondi prima di pescare!`);
                return;
            }
            
            cooldowns[sender] = now;
            salvaCooldown(cooldowns);
            const pescato = pescaCasuale();
            
            if (!inventario[sender].pesci[pescato.id]) {
                inventario[sender].pesci[pescato.id] = 0;
            }
            inventario[sender].pesci[pescato.id]++;
            if (inventario[sender].statistiche) {
                inventario[sender].statistiche.pescate++;
            }
            
            // Check achievements
            const newAchievements = checkAchievements(sender, inventario[sender]);
            
            salvaInventario(inventario);
            
            const rarita = pescato.id <= 15 ? 'Comune' : pescato.id <= 27 ? 'Raro' : pescato.id <= 36 ? 'Epico' : 'Leggendario';
            const colore = pescato.id <= 15 ? '⚪' : pescato.id <= 27 ? '🟢' : pescato.id <= 36 ? '🟣' : '🟡';
            
            let message = '🎣 HAI PESCATO! 🎣\n\n';
            message += `${pescato.emoji} ${pescato.nome}\n`;
            message += `${colore} Rarità: ${rarita}\n`;
            message += `💰 Valore: ${pescato.prezzo} punti\n\n`;
            
            // Mostra nuovi achievements
            if (newAchievements.length > 0) {
                message += '🏆 NUOVO ACHIEVEMENT SBLOCCATO! 🏆\n';
                newAchievements.forEach(ach => {
                    message += `✨ ${ach}\n`;
                });
                message += '\n';
            }
            
            message += '🎒 Usa .pesca inventario per vedere i tuoi pesci\n';
            message += '💰 Usa .pesca vendi [nome] per vendere';
            
            await msg.reply(message);
            return;
        }
        
        // Inventario
        if (args[0] === 'inventario') {
            if (!inventario[sender] || Object.keys(inventario[sender].pesci).length === 0) {
                await msg.reply('🎒 INVENTARIO VUOTO\n\n🎣 Usa .pesca per pescare!\n\n🐟 Raccogli pesci e vendili per punti!');
                return;
            }
            
            let message = `🎒 INVENTARIO DI ${userName} 🎒\n\n`;
            let totaleValore = 0;
            
            Object.entries(inventario[sender].pesci).forEach(([id, quantita]) => {
                if (quantita > 0) {
                    const pesce = pesci[id];
                    const valore = pesce.prezzo * quantita;
                    totaleValore += valore;
                    message += `${pesce.emoji} ${pesce.nome} x${quantita} (${valore} punti)\n`;
                }
            });
            
            message += `\n💰 Valore totale: ${totaleValore} punti\n`;
            message += '💸 Usa .pesca vendi [nome] per vendere';
            
            await msg.reply(message);
            return;
        }
        
        // Vendi tutto
        if (args[0] === 'vendi' && args[1] === 'tutto') {
            if (!inventario[sender] || Object.keys(inventario[sender].pesci).length === 0) {
                await msg.reply('❌ Inventario vuoto!');
                return;
            }
            
            let totaleGuadagno = 0;
            let pesciVenduti = 0;
            
            Object.entries(inventario[sender].pesci).forEach(([id, quantita]) => {
                if (quantita > 0) {
                    const pesce = pesci[id];
                    const guadagno = pesce.prezzo * quantita;
                    totaleGuadagno += guadagno;
                    pesciVenduti += quantita;
                    inventario[sender].pesci[id] = 0;
                }
            });
            
            if (totaleGuadagno === 0) {
                await msg.reply('❌ Nessun pesce da vendere!');
                return;
            }
            
            inventario[sender].statistiche.vendite += pesciVenduti;
            
            // Check achievements dopo vendita
            const newAchievements = checkAchievements(sender, inventario[sender]);
            
            salvaInventario(inventario);
            aggiornaClassifica(sender, totaleGuadagno, false, 'pesca', userName);
            
            let message = `💰 VENDITA TOTALE COMPLETATA!\n\n🐟 Pesci venduti: ${pesciVenduti}\n💵 Guadagno totale: +${totaleGuadagno} punti!\n\n🎉 Inventario svuotato!`;
            
            if (newAchievements.length > 0) {
                message += '\n🏆 NUOVO ACHIEVEMENT SBLOCCATO! 🏆\n';
                newAchievements.forEach(ach => {
                    message += `✨ ${ach}\n`;
                });
            }
            
            await msg.reply(message);
            return;
        }
        
        // Vendi per categoria
        if (args[0] === 'vendi' && ['comuni', 'rari', 'epici', 'leggendari'].includes(args[1])) {
            const categoria = args[1];
            let rangeIds = [];
            
            switch(categoria) {
                case 'comuni': rangeIds = Array.from({length: 15}, (_, i) => i + 1); break;
                case 'rari': rangeIds = Array.from({length: 12}, (_, i) => i + 16); break;
                case 'epici': rangeIds = Array.from({length: 9}, (_, i) => i + 28); break;
                case 'leggendari': rangeIds = Array.from({length: 9}, (_, i) => i + 37); break;
            }
            
            let totaleGuadagno = 0;
            let pesciVenduti = 0;
            
            rangeIds.forEach(id => {
                const quantita = inventario[sender].pesci[id] || 0;
                if (quantita > 0) {
                    const pesce = pesci[id];
                    const guadagno = pesce.prezzo * quantita;
                    totaleGuadagno += guadagno;
                    pesciVenduti += quantita;
                    inventario[sender].pesci[id] = 0;
                }
            });
            
            if (totaleGuadagno === 0) {
                await msg.reply(`❌ Nessun pesce ${categoria} da vendere!`);
                return;
            }
            
            const colore = categoria === 'comuni' ? '⚪' : categoria === 'rari' ? '🟢' : categoria === 'epici' ? '🟣' : '🟡';
            
            inventario[sender].statistiche.vendite += pesciVenduti;
            salvaInventario(inventario);
            aggiornaClassifica(sender, totaleGuadagno, false, 'pesca', userName);
            
            await msg.reply(`💰 VENDITA ${categoria.toUpperCase()} COMPLETATA!\n\n${colore} Pesci ${categoria} venduti: ${pesciVenduti}\n💵 Guadagno: +${totaleGuadagno} punti!`);
            return;
        }
        
        // Vendi singolo pesce
        if (args[0] === 'vendi' && args.length > 1) {
            const nomePesce = args.slice(1).join(' ').toLowerCase();
            
            // Trova il pesce per nome
            let pesceTrovato = null;
            for (const [id, pesce] of Object.entries(pesci)) {
                if (pesce.nome.toLowerCase() === nomePesce) {
                    pesceTrovato = { id: parseInt(id), ...pesce };
                    break;
                }
            }
            
            if (!pesceTrovato) {
                await msg.reply('❌ Pesce non trovato!\n\n🐟 Usa .pesca lista per vedere tutti i pesci disponibili!');
                return;
            }
            
            if (!inventario[sender].pesci[pesceTrovato.id] || inventario[sender].pesci[pesceTrovato.id] === 0) {
                await msg.reply(`❌ Non hai ${pesceTrovato.nome} nell'inventario!\n\n🎣 Pesca prima di vendere!`);
                return;
            }
            
            inventario[sender].pesci[pesceTrovato.id]--;
            inventario[sender].statistiche.vendite++;
            
            // Check achievements dopo vendita
            const newAchievements = checkAchievements(sender, inventario[sender]);
            
            salvaInventario(inventario);
            aggiornaClassifica(sender, pesceTrovato.prezzo, false, 'pesca', userName);
            
            let message = `💰 VENDITA COMPLETATA!\n\n${pesceTrovato.emoji} Hai venduto: ${pesceTrovato.nome}\n💵 Guadagno: +${pesceTrovato.prezzo} punti!\n\n🎒 Usa .pesca inventario per vedere i tuoi pesci`;
            
            if (newAchievements.length > 0) {
                message += '\n\n🏆 NUOVO ACHIEVEMENT SBLOCCATO! 🏆\n';
                newAchievements.forEach(ach => {
                    message += `✨ ${ach}\n`;
                });
            }
            
            await msg.reply(message);
            return;
        }
        
        // Lista pesci
        if (args[0] === 'lista') {
            let message = '🐟 PESCI DISPONIBILI 🐟\n\n';
            // Raggruppa per rarità
            const comuni = Object.entries(pesci).filter(([id]) => parseInt(id) <= 15);
            const rari = Object.entries(pesci).filter(([id]) => parseInt(id) >= 16 && parseInt(id) <= 27);
            const epici = Object.entries(pesci).filter(([id]) => parseInt(id) >= 28 && parseInt(id) <= 36);
            const leggendari = Object.entries(pesci).filter(([id]) => parseInt(id) >= 37);
            
            message += '⚪ COMUNI:\n';
            comuni.forEach(([id, pesce]) => {
                message += `${pesce.emoji} ${pesce.nome} - ${pesce.prezzo}pt\n`;
            });
            
            message += '\n🟢 RARI:\n';
            rari.forEach(([id, pesce]) => {
                message += `${pesce.emoji} ${pesce.nome} - ${pesce.prezzo}pt\n`;
            });
            
            message += '\n🟣 EPICI:\n';
            epici.forEach(([id, pesce]) => {
                message += `${pesce.emoji} ${pesce.nome} - ${pesce.prezzo}pt\n`;
            });
            
            message += '\n🟡 LEGGENDARI:\n';
            leggendari.forEach(([id, pesce]) => {
                message += `${pesce.emoji} ${pesce.nome} - ${pesce.prezzo}pt\n`;
            });
            message += '\n🎣 Più raro = più punti!';
            
            await msg.reply(message);
            return;
        }
        
        // Negozio attrezzature
        if (args[0] === 'negozio') {
            let message = '🏪 NEGOZIO ATTREZZATURE 🏪\n\n';
            message += '🎣 CANNE:\n';
            Object.entries(attrezzature.canne).forEach(([id, item]) => {
                message += `${id}. ${item.nome} - ${item.prezzo}pt (+${item.bonus}% rari)\n`;
            });
            message += '\n🪝 AMI:\n';
            Object.entries(attrezzature.ami).forEach(([id, item]) => {
                message += `${id}. ${item.nome} - ${item.prezzo}pt (+${item.bonus}% rari)\n`;
            });
            message += '\n🐛 ESCHE:\n';
            Object.entries(attrezzature.esche).forEach(([id, item]) => {
                message += `${id}. ${item.nome} - ${item.prezzo}pt (+${item.bonus}% rari)\n`;
            });
            message += '\n💰 Usa .pesca compra [tipo] [numero]\nEs: .pesca compra canna 2';
            await msg.reply(message);
            return;
        }
        
        // Compra attrezzatura
        if (args[0] === 'compra' && args.length === 3) {
            const tipo = args[1];
            const livello = parseInt(args[2]);
            
            if (!['canna', 'amo', 'esca'].includes(tipo)) {
                await msg.reply('❌ Tipo non valido! Usa: canna, amo, esca');
                return;
            }
            
            const tipoPlural = tipo === 'canna' ? 'canne' : tipo === 'amo' ? 'ami' : 'esche';
            const item = attrezzature[tipoPlural][livello];
            
            if (!item) {
                await msg.reply('❌ Livello non valido! Usa 1-4');
                return;
            }
            
            // Controlla punti (dalla classifica pesca)
            const classificaFile = path.join(__dirname, '..', 'data', 'classifica_pesca.json');
            let classifica = {};
            if (fs.existsSync(classificaFile)) {
                classifica = JSON.parse(fs.readFileSync(classificaFile, 'utf8'));
            }
            
            const puntiAttuali = classifica[userName]?.punti || 0;
            
            if (puntiAttuali < item.prezzo) {
                await msg.reply(`❌ Non hai abbastanza punti!\n💰 Servono: ${item.prezzo}pt\n💳 Hai: ${puntiAttuali}pt`);
                return;
            }
            
            // Acquista
            inventario[sender].attrezzatura[tipo] = livello;
            aggiornaClassifica(sender, -item.prezzo, false, 'pesca', userName);
            salvaInventario(inventario);
            
            await msg.reply(`✅ ACQUISTO COMPLETATO!\n\n🛒 ${item.nome} acquistato!\n💰 Spesi: ${item.prezzo}pt\n🎣 Bonus: +${item.bonus}% pesci rari!`);
            return;
        }
        
        // Proponi scambio
        if (args[0] === 'scambio' && args.length >= 2) {
            const mentions = await msg.getMentions();
            if (!mentions.length) {
                await msg.reply('❌ Devi menzionare qualcuno!\nEsempio: .pesca scambio @nome sardina');
                return;
            }
            
            const idDestinatario = mentions[0].id._serialized;
            const nomeDestinatario = mentions[0].pushname || mentions[0].verifiedName || 'Utente';
            const nomePesce = args.slice(2).join(' ').toLowerCase();
            
            if (!nomePesce) {
                await msg.reply('❌ Specifica il pesce da scambiare!\nEsempio: .pesca scambio @nome sardina');
                return;
            }
            
            // Trova pesce
            let pesceTrovato = null;
            for (const [id, pesce] of Object.entries(pesci)) {
                if (pesce.nome.toLowerCase() === nomePesce) {
                    pesceTrovato = { id: parseInt(id), ...pesce };
                    break;
                }
            }
            
            if (!pesceTrovato) {
                await msg.reply('❌ Pesce non trovato!');
                return;
            }
            
            if (!inventario[sender].pesci[pesceTrovato.id] || inventario[sender].pesci[pesceTrovato.id] === 0) {
                await msg.reply(`❌ Non hai ${pesceTrovato.nome}!`);
                return;
            }
            
            // Salva proposta di scambio
            const trades = caricaTrade();
            const tradeId = Math.random().toString(36).substr(2, 6).toUpperCase();
            
            trades[tradeId] = {
                mittente: sender,
                nomeMittente: userName,
                destinatario: idDestinatario,
                nomeDestinatario: nomeDestinatario,
                pesce: pesceTrovato,
                timestamp: Date.now()
            };
            
            salvaTrade(trades);
            
            const messaggioScambio = `🔄 PROPOSTA SCAMBIO INVIATA!\n\n${pesceTrovato.emoji} ${pesceTrovato.nome} → @${idDestinatario.split('@')[0]}\n\n💬 @${idDestinatario.split('@')[0]}, rispondi con:\n• .pesca accetta @${sender.split('@')[0]}\n• .pesca rifiuta @${sender.split('@')[0]}`;
            
            await client.sendMessage(msg.from, messaggioScambio, {
                mentions: [idDestinatario]
            });
            return;
        }
        
        // Accetta scambio
        if (args[0] === 'accetta') {
            const mentions = await msg.getMentions();
            if (!mentions.length) {
                await msg.reply('❌ Devi menzionare chi ha proposto lo scambio!\nEsempio: .pesca accetta @nome');
                return;
            }
            
            const mittenteId = mentions[0].id._serialized;
            const trades = caricaTrade();
            
            // Trova il trade dal mittente
            let tradeId = null;
            let trade = null;
            Object.entries(trades).forEach(([id, t]) => {
                if (t.mittente === mittenteId && t.destinatario === sender) {
                    tradeId = id;
                    trade = t;
                }
            });
            
            if (!trade) {
                await msg.reply('❌ Nessuno scambio trovato da questo utente!');
                return;
            }
            
            // Controlla se il mittente ha ancora il pesce
            if (!inventario[trade.mittente] || !inventario[trade.mittente].pesci[trade.pesce.id] || inventario[trade.mittente].pesci[trade.pesce.id] === 0) {
                await msg.reply('❌ Il mittente non ha più questo pesce!');
                delete trades[tradeId];
                salvaTrade(trades);
                return;
            }
            
            // Esegui scambio
            inventario[trade.mittente].pesci[trade.pesce.id]--;
            inventario[trade.mittente].statistiche.scambi++;
            
            if (!inventario[sender]) {
                inventario[sender] = { nome: userName, pesci: {}, attrezzatura: { canna: 1, amo: 1, esca: 1 }, achievements: [], statistiche: { pescate: 0, vendite: 0, scambi: 0 } };
            }
            if (!inventario[sender].pesci[trade.pesce.id]) {
                inventario[sender].pesci[trade.pesce.id] = 0;
            }
            inventario[sender].pesci[trade.pesce.id]++;
            
            delete trades[tradeId];
            salvaTrade(trades);
            salvaInventario(inventario);
            
            const messaggioAccettato = `✅ SCAMBIO ACCETTATO!\n\n${trade.pesce.emoji} ${trade.pesce.nome} ricevuto da ${trade.nomeMittente}!\n\n🎉 Controlla il tuo inventario!`;
            
            await client.sendMessage(msg.from, messaggioAccettato, {
                mentions: [trade.mittente]
            });
            return;
        }
        
        // Rifiuta scambio
        if (args[0] === 'rifiuta') {
            const mentions = await msg.getMentions();
            if (!mentions.length) {
                await msg.reply('❌ Devi menzionare chi ha proposto lo scambio!\nEsempio: .pesca rifiuta @nome');
                return;
            }
            
            const mittenteId = mentions[0].id._serialized;
            const trades = caricaTrade();
            
            // Trova il trade dal mittente
            let tradeId = null;
            let trade = null;
            Object.entries(trades).forEach(([id, t]) => {
                if (t.mittente === mittenteId && t.destinatario === sender) {
                    tradeId = id;
                    trade = t;
                }
            });
            
            if (!trade) {
                await msg.reply('❌ Nessuno scambio trovato da questo utente!');
                return;
            }
            
            delete trades[tradeId];
            salvaTrade(trades);
            
            await msg.reply(`❌ SCAMBIO RIFIUTATO!\n\n${trade.pesce.emoji} ${trade.pesce.nome} da ${trade.nomeMittente} rifiutato.`);
            return;
        }
        
        // Lista scambi in attesa
        if (args[0] === 'trades') {
            const trades = caricaTrade();
            const mieProposte = Object.entries(trades).filter(([id, trade]) => trade.mittente === sender);
            const proposteRicevute = Object.entries(trades).filter(([id, trade]) => trade.destinatario === sender);
            
            let message = `🔄 I TUOI SCAMBI 🔄\n\n`;
            
            if (proposteRicevute.length > 0) {
                message += '📨 RICEVUTE:\n';
                proposteRicevute.forEach(([id, trade]) => {
                    message += `${trade.pesce.emoji} ${trade.pesce.nome} da ${trade.nomeMittente}\n`;
                    message += `   .pesca accetta ${id}\n   .pesca rifiuta ${id}\n\n`;
                });
            }
            
            if (mieProposte.length > 0) {
                message += '📤 INVIATE:\n';
                mieProposte.forEach(([id, trade]) => {
                    message += `${trade.pesce.emoji} ${trade.pesce.nome} → ${trade.nomeDestinatario}\n`;
                });
            }
            
            if (proposteRicevute.length === 0 && mieProposte.length === 0) {
                message += '💭 Nessuno scambio in corso!';
            }
            
            await msg.reply(message);
            return;
        }
        

        
        await msg.reply('🎣 SISTEMA PESCA 🎣\n\n📝 Comandi principali:\n• .pesca - Pesca un pesce\n• .pesca inventario - Vedi i tuoi pesci\n• .pesca vendi [nome/tutto/categoria] - Vendi\n• .pesca help - Guida completa\n\n🐟 Usa .pesca help per tutti i comandi!');
    }
}