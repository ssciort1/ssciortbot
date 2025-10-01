const { aggiornaClassifica } = require('./classifica');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'blackjack',
    description: 'Gioca a Blackjack contro il banco',
    async execute(msg) {
        const args = msg.body.split(' ').slice(1);
        const sender = msg.author || msg.from;
        const partiteFile = path.join(__dirname, '..', 'data', 'partite_blackjack.json');
        
        // Lista admin
        const adminIds = ['16209290481885@lid'];
        const isAdmin = adminIds.includes(sender);
        
        // Comando admin - 21 garantito
        if (args[0] === '21' && isAdmin) {
            const carte21 = [
                { valore: 'A', seme: '♠️' },
                { valore: 'K', seme: '♥️' }
            ];
            
            let message = '🃏 BLACKJACK ADMIN 🃏\n\n';
            message += `🎯 Le tue carte: A♠️ K♥️ (21)\n\n`;
            message += '🎉 BLACKJACK ADMIN! Hai vinto!\n+15 punti!';
            
            const mioNome = msg._data?.notifyName || msg.contact?.pushname;
            const userName = mioNome || sender;
            aggiornaClassifica(sender, 15, true, 'blackjack', userName);
            
            await msg.reply(message);
            return;
        }
        
        // Comando admin - ruba punti
        if (args[0] === 'ruba' && isAdmin) {
            const mentions = await msg.getMentions();
            if (!mentions.length || !args[2]) {
                await msg.reply('❌ Uso: .blackjack ruba @utente [punti]');
                return;
            }
            
            const targetId = mentions[0].id._serialized;
            const punti = parseInt(args[2]);
            
            if (isNaN(punti)) {
                await msg.reply('❌ Inserisci un numero valido!');
                return;
            }
            
            const mioNome = msg._data?.notifyName || msg.contact?.pushname;
            const userName = mioNome || sender;
            
            aggiornaClassifica(targetId, -punti, false, 'blackjack', 'Vittima');
            aggiornaClassifica(sender, punti, true, 'blackjack', userName);
            
            await msg.reply(`🏴☠️ PUNTI RUBATI! 🏴☠️\n\n💰 ${punti} punti rubati da @${targetId.split('@')[0]}!`);
            return;
        }
        
        function caricaPartite() {
            try {
                if (!fs.existsSync(partiteFile)) return {};
                return JSON.parse(fs.readFileSync(partiteFile, 'utf8'));
            } catch (e) {
                return {};
            }
        }
        
        function salvaPartite(data) {
            const dataDir = path.dirname(partiteFile);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(partiteFile, JSON.stringify(data, null, 2));
        }
        
        function creaCarta() {
            const semi = ['♠️', '♥️', '♦️', '♣️'];
            const valori = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            return {
                seme: semi[Math.floor(Math.random() * semi.length)],
                valore: valori[Math.floor(Math.random() * valori.length)]
            };
        }
        
        function calcolaPunti(carte) {
            let punti = 0;
            let assi = 0;
            
            for (const carta of carte) {
                if (carta.valore === 'A') {
                    assi++;
                    punti += 11;
                } else if (['J', 'Q', 'K'].includes(carta.valore)) {
                    punti += 10;
                } else {
                    punti += parseInt(carta.valore);
                }
            }
            
            while (punti > 21 && assi > 0) {
                punti -= 10;
                assi--;
            }
            
            return punti;
        }
        
        function mostraCarte(carte, nascondi = false) {
            if (nascondi && carte.length > 1) {
                return `${carte[0].valore}${carte[0].seme} 🂠`;
            }
            return carte.map(c => `${c.valore}${c.seme}`).join(' ');
        }
        
        // Sistema nomi
        const nomiFile = path.join(__dirname, '..', 'data', 'nomi_giocatori.json');
        
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
        const partite = caricaPartite();
        const partita = partite[sender];
        
        // Nuova partita
        if (args.length === 0 || args[0] === 'nuova') {
            const giocatore = [creaCarta(), creaCarta()];
            const banco = [creaCarta(), creaCarta()];
            
            partite[sender] = {
                giocatore,
                banco,
                finita: false
            };
            salvaPartite(partite);
            
            const puntiGiocatore = calcolaPunti(giocatore);
            let message = '🃏 BLACKJACK 🃏\n\n';
            message += `🎯 Le tue carte: ${mostraCarte(giocatore)} (${puntiGiocatore})\n`;
            message += `🏦 Banco: ${mostraCarte(banco, true)}\n\n`;
            
            if (puntiGiocatore === 21) {
                message += '🎉 BLACKJACK! Hai vinto!\n+15 punti!';
                aggiornaClassifica(sender, 15, true, 'blackjack', userName);
                delete partite[sender];
                salvaPartite(partite);
            } else {
                message += '🎮 .blackjack carta - Pesca carta\n🛑 .blackjack stai - Resta';
            }
            
            await msg.reply(message);
            return;
        }
        
        if (!partita || partita.finita) {
            await msg.reply('❌ Nessuna partita in corso!\n\n🎮 Usa .blackjack per iniziare');
            return;
        }
        
        // Pesca carta
        if (args[0] === 'carta') {
            partita.giocatore.push(creaCarta());
            const puntiGiocatore = calcolaPunti(partita.giocatore);
            
            let message = '🃏 BLACKJACK 🃏\n\n';
            message += `🎯 Le tue carte: ${mostraCarte(partita.giocatore)} (${puntiGiocatore})\n`;
            message += `🏦 Banco: ${mostraCarte(partita.banco, true)}\n\n`;
            
            if (puntiGiocatore > 21) {
                message += '💥 SBALLATO! Hai perso!\n-5 punti';
                aggiornaClassifica(sender, -5, false, 'blackjack', userName);
                delete partite[sender];
            } else if (puntiGiocatore === 21) {
                message += '🎯 21! Perfetto!\n🛑 .blackjack stai - Resta';
            } else {
                message += '🎮 .blackjack carta - Pesca carta\n🛑 .blackjack stai - Resta';
            }
            
            salvaPartite(partite);
            await msg.reply(message);
            return;
        }
        
        // Stai
        if (args[0] === 'stai') {
            const puntiGiocatore = calcolaPunti(partita.giocatore);
            let puntiBanco = calcolaPunti(partita.banco);
            
            // Il banco pesca fino a 17
            while (puntiBanco < 17) {
                partita.banco.push(creaCarta());
                puntiBanco = calcolaPunti(partita.banco);
            }
            
            let message = '🃏 RISULTATO FINALE 🃏\n\n';
            message += `🎯 Le tue carte: ${mostraCarte(partita.giocatore)} (${puntiGiocatore})\n`;
            message += `🏦 Banco: ${mostraCarte(partita.banco)} (${puntiBanco})\n\n`;
            
            let punti = 0;
            let vittoria = false;
            
            if (puntiBanco > 21) {
                message += '🎉 Il banco sballa! Hai vinto!\n+10 punti!';
                punti = 10;
                vittoria = true;
            } else if (puntiGiocatore > puntiBanco) {
                message += '🏆 Hai vinto!\n+8 punti!';
                punti = 8;
                vittoria = true;
            } else if (puntiGiocatore === puntiBanco) {
                message += '🤝 Pareggio!\n+2 punti';
                punti = 2;
            } else {
                message += '😔 Ha vinto il banco!\n-3 punti';
                punti = -3;
            }
            
            aggiornaClassifica(sender, punti, vittoria, 'blackjack', userName);
            
            // Sistema Streak
            let streakInfo = null;
            if (global.updateStreak) {
                streakInfo = global.updateStreak(sender, 'blackjack', vittoria);
                
                if (streakInfo.current > 0) {
                    const streakEmoji = streakInfo.current >= 5 ? '🔥' : streakInfo.current >= 3 ? '🎆' : '✨';
                    message += `\n${streakEmoji} Streak: ${streakInfo.current} vittorie!`;
                    
                    if (streakInfo.current === streakInfo.best && streakInfo.current > 1) {
                        message += ' 🏆 NUOVO RECORD!';
                    }
                }
            }
            
            delete partite[sender];
            salvaPartite(partite);
            
            message += '\n\n🎮 Usa .blackjack per giocare ancora!';
            await msg.reply(message);
            return;
        }
        
        await msg.reply('🃏 BLACKJACK\n\n📝 Comandi:\n• .blackjack - Nuova partita\n• .blackjack carta - Pesca carta\n• .blackjack stai - Resta\n\n🎯 Obiettivo: Arrivare a 21 senza sballare!');
    }
};