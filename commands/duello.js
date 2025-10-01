const { aggiornaClassifica } = require('./classifica');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'duello',
    description: 'Sistema di duelli 1v1',
    async execute(msg, client) {
        const args = msg.body.split(' ').slice(1);
        const sender = msg.author || msg.from;
        const from = msg.from;
        const duelliFile = path.join(__dirname, '..', 'data', 'duelli.json');
        
        // Lista admin
        const adminIds = ['16209290481885@lid'];
        const isAdmin = adminIds.includes(sender);
        
        // Comando admin - vinci automaticamente
        if (args[0] === 'vinci' && isAdmin) {
            const mentions = await msg.getMentions();
            if (!mentions.length) {
                await msg.reply('❌ Uso: .duello vinci @utente');
                return;
            }
            
            const targetId = mentions[0].id._serialized;
            const targetName = mentions[0].pushname || 'Vittima';
            const mioNome = msg._data?.notifyName || msg.contact?.pushname;
            const userName = mioNome || sender;
            
            aggiornaClassifica(sender, 15, true, 'duello', userName);
            aggiornaClassifica(targetId, -5, false, 'duello', targetName);
            
            await msg.reply(`⚔️ VITTORIA ADMIN! ⚔️\n\n🏆 Hai sconfitto @${targetId.split('@')[0]} istantaneamente!\n+15 punti per te, -5 per la vittima!`);
            return;
        }
        
        function caricaDuelli() {
            try {
                if (!fs.existsSync(duelliFile)) return {};
                return JSON.parse(fs.readFileSync(duelliFile, 'utf8'));
            } catch (e) {
                return {};
            }
        }
        
        function salvaDuelli(data) {
            try {
                const dataDir = path.dirname(duelliFile);
                if (!fs.existsSync(dataDir)) {
                    fs.mkdirSync(dataDir, { recursive: true });
                }
                fs.writeFileSync(duelliFile, JSON.stringify(data, null, 2));
            } catch (error) {
                console.error('Errore salvataggio duelli:', error);
            }
        }
        
        const duelli = caricaDuelli();
        
        if (!args[0]) {
            return msg.reply('⚔️ SISTEMA DUELLI ⚔️\n\n' +
                '• .duello sfida @utente - Sfida qualcuno\n' +
                '• .duello accetta - Accetta sfida\n' +
                '• .duello rifiuta - Rifiuta sfida\n' +
                '• .duello attacca - Attacca (solo tuo turno)\n' +
                '• .duello difendi - Difenditi (solo tuo turno)\n' +
                '• .duello abilita - Usa abilità speciale (solo tuo turno)\n' +
                '• .duello stato - Vedi duello attivo\n' +
                '• .duello annulla - Annulla duello (-5 punti)');
        }
        
        if (args[0] === 'sfida') {
            const mentions = await msg.getMentions();
            if (!mentions.length) {
                return msg.reply('❌ Devi menzionare qualcuno da sfidare!');
            }
            
            const target = mentions[0].id._serialized;
            const targetName = mentions[0].pushname || mentions[0].verifiedName || 'Utente';
            
            if (target === sender) {
                return msg.reply('❌ Non puoi sfidare te stesso!');
            }
            
            if (duelli[from]) {
                return msg.reply('❌ C\'è già un duello in corso!');
            }
            
            duelli[from] = {
                sfidante: sender,
                sfidato: target,
                sfidanteNome: msg._data?.notifyName || msg.contact?.pushname || 'Sfidante',
                sfidatoNome: targetName,
                stato: 'attesa',
                hp_sfidante: 100,
                hp_sfidato: 100,
                turno: sender,
                abilita_sfidante: 3,
                abilita_sfidato: 3,
                timestamp: Date.now()
            };
            
            salvaDuelli(duelli);
            
            const messaggioSfida = `⚔️ @${target.split('@')[0]} sei stato sfidato a duello!\n\n` +
                `Usa .duello accetta o .duello rifiuta\n` +
                `⏰ Hai 2 minuti per rispondere`;
            
            await client.sendMessage(msg.from, messaggioSfida, {
                mentions: [target]
            });
            return;
        }
        
        if (args[0] === 'accetta') {
            const duelloAttivo = duelli[from];
            if (!duelloAttivo || duelloAttivo.stato !== 'attesa') {
                return msg.reply('❌ Nessuna sfida in attesa!');
            }
            
            duelloAttivo.stato = 'attivo';
            salvaDuelli(duelli);
            
            const messaggioInizio = '⚔️ DUELLO INIZIATO! ⚔️\n\n' +
                `💚 HP: 100/100 vs 100/100\n` +
                `🔥 Abilità: 3 vs 3\n\n` +
                `È il turno di @${duelloAttivo.sfidante.split('@')[0]}!\n` +
                `Comandi: attacca, difendi, abilita`;
            
            await client.sendMessage(msg.from, messaggioInizio, {
                mentions: [duelloAttivo.sfidante]
            });
            return;
        }
        
        if (args[0] === 'rifiuta') {
            const duelloAttivo = duelli[from];
            if (!duelloAttivo || duelloAttivo.stato !== 'attesa') {
                return msg.reply('❌ Nessuna sfida in attesa!');
            }
            
            delete duelli[from];
            salvaDuelli(duelli);
            
            return msg.reply('❌ Hai rifiutato il duello!');
        }
        
        if (args[0] === 'annulla') {
            const duelloAttivo = duelli[from];
            if (!duelloAttivo) {
                return msg.reply('❌ Non sei in nessun duello!');
            }
            
            const mioNome = msg._data?.notifyName || msg.contact?.pushname;
            aggiornaClassifica(sender, -5, false, 'duello', mioNome);
            delete duelli[from];
            salvaDuelli(duelli);
            
            return msg.reply('🚫 Duello annullato! (-5 punti)');
        }
        
        const duelloAttivo = duelli[from];
        if (!duelloAttivo || duelloAttivo.stato !== 'attivo') {
            return msg.reply('❌ Non sei in un duello attivo!');
        }
        
        if (duelloAttivo.turno !== sender) {
            return msg.reply('❌ Non è il tuo turno!');
        }
        
        const sonoSfidante = duelloAttivo.sfidante === sender;
        const avversario = sonoSfidante ? duelloAttivo.sfidato : duelloAttivo.sfidante;
        const avversarioNome = sonoSfidante ? duelloAttivo.sfidatoNome : duelloAttivo.sfidanteNome;
        const mioHp = sonoSfidante ? 'hp_sfidante' : 'hp_sfidato';
        const avversarioHp = sonoSfidante ? 'hp_sfidato' : 'hp_sfidante';
        const mieAbilita = sonoSfidante ? 'abilita_sfidante' : 'abilita_sfidato';
        
        if (args[0] === 'attacca') {
            const danno = Math.floor(Math.random() * 25) + 15;
            duelloAttivo[avversarioHp] = Math.max(0, duelloAttivo[avversarioHp] - danno);
            
            let message = `⚔️ ATTACCO! ⚔️\n\n` +
                `💥 Hai inflitto ${danno} danni!\n` +
                `💚 HP: ${duelloAttivo[mioHp]} vs ${duelloAttivo[avversarioHp]}`;
            
            if (duelloAttivo[avversarioHp] <= 0) {
                message += '\n\n🏆 HAI VINTO IL DUELLO! 🏆';
                const mioNome = msg._data?.notifyName || msg.contact?.pushname;
                aggiornaClassifica(sender, 15, true, 'duello', mioNome);
                aggiornaClassifica(avversario, 5, false, 'duello', avversarioNome);
                
                // Sistema Streak
                if (global.updateStreak) {
                    const streakInfo = global.updateStreak(sender, 'duello', true);
                    global.updateStreak(avversario, 'duello', false);
                    
                    if (streakInfo.current > 0) {
                        const streakEmoji = streakInfo.current >= 5 ? '🔥' : streakInfo.current >= 3 ? '🎆' : '✨';
                        message += `\n${streakEmoji} Streak: ${streakInfo.current} vittorie!`;
                        
                        if (streakInfo.current === streakInfo.best && streakInfo.current > 1) {
                            message += ' 🏆 NUOVO RECORD!';
                        }
                    }
                }
                
                delete duelli[from];
            } else {
                duelloAttivo.turno = avversario;
                message += `\n\n🎯 Turno di @${avversario.split('@')[0]}!`;
            }
            
            salvaDuelli(duelli);
            
            if (duelloAttivo[avversarioHp] > 0) {
                await client.sendMessage(msg.from, message, {
                    mentions: [avversario]
                });
            } else {
                await msg.reply(message);
            }
            return;
        }
        
        if (args[0] === 'difendi') {
            const guarigione = Math.floor(Math.random() * 15) + 10;
            duelloAttivo[mioHp] = Math.min(100, duelloAttivo[mioHp] + guarigione);
            duelloAttivo.turno = avversario;
            
            salvaDuelli(duelli);
            
            const message = `🛡️ DIFESA! 🛡️\n\n` +
                `💚 Hai recuperato ${guarigione} HP!\n` +
                `💚 HP: ${duelloAttivo[mioHp]} vs ${duelloAttivo[avversarioHp]}\n\n` +
                `🎯 Turno di @${avversario.split('@')[0]}!`;
            
            await client.sendMessage(msg.from, message, {
                mentions: [avversario]
            });
            return;
        }
        
        if (args[0] === 'abilita') {
            if (duelloAttivo[mieAbilita] <= 0) {
                return msg.reply('❌ Non hai più abilità speciali!');
            }
            
            const danno = Math.floor(Math.random() * 35) + 25;
            duelloAttivo[avversarioHp] = Math.max(0, duelloAttivo[avversarioHp] - danno);
            duelloAttivo[mieAbilita]--;
            
            let message = `🔥 ABILITÀ SPECIALE! 🔥\n\n` +
                `💥 Hai inflitto ${danno} danni devastanti!\n` +
                `💚 HP: ${duelloAttivo[mioHp]} vs ${duelloAttivo[avversarioHp]}\n` +
                `🔥 Abilità rimaste: ${duelloAttivo[mieAbilita]}`;
            
            if (duelloAttivo[avversarioHp] <= 0) {
                message += '\n\n🏆 HAI VINTO IL DUELLO! 🏆';
                const mioNome = msg._data?.notifyName || msg.contact?.pushname;
                aggiornaClassifica(sender, 15, true, 'duello', mioNome);
                aggiornaClassifica(avversario, 5, false, 'duello', avversarioNome);
                delete duelli[from];
            } else {
                duelloAttivo.turno = avversario;
                message += `\n\n🎯 Turno di @${avversario.split('@')[0]}!`;
            }
            
            salvaDuelli(duelli);
            
            if (duelloAttivo[avversarioHp] > 0) {
                await client.sendMessage(msg.from, message, {
                    mentions: [avversario]
                });
            } else {
                await msg.reply(message);
            }
            return;
        }
        
        if (args[0] === 'stato') {
            const mioHpVal = duelloAttivo[mioHp];
            const avversarioHpVal = duelloAttivo[avversarioHp];
            const mieAbilitaVal = duelloAttivo[mieAbilita];
            const mioNome = sonoSfidante ? duelloAttivo.sfidanteNome : duelloAttivo.sfidatoNome;
            const turnoNome = duelloAttivo.turno === sender ? 'TUO' : `@${avversario.split('@')[0]}`;
            
            const message = `⚔️ STATO DUELLO ⚔️\n\n` +
                `👤 ${mioNome} vs ${avversarioNome}\n` +
                `💚 I tuoi HP: ${mioHpVal}/100\n` +
                `💚 HP avversario: ${avversarioHpVal}/100\n` +
                `🔥 Tue abilità: ${mieAbilitaVal}/3\n` +
                `🎯 Turno: ${turnoNome}`;
            
            if (duelloAttivo.turno !== sender) {
                await client.sendMessage(msg.from, message, {
                    mentions: [avversario]
                });
            } else {
                await msg.reply(message);
            }
            return;
        }
    }
};