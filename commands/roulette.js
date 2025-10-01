const { aggiornaClassifica } = require('./classifica');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'russa',
    description: 'Roulette russa (sicura!) - Sfida un avversario',
    async execute(msg, client) {
        const partiteFile = path.join(__dirname, '..', 'data', 'partite_roulette.json');
        const nomiFile = path.join(__dirname, '..', 'data', 'nomi_giocatori.json');

        const caricaPartite = () => {
            if (!fs.existsSync(partiteFile)) return {};
            return JSON.parse(fs.readFileSync(partiteFile, 'utf8'));
        };

        const salvaPartite = (data) => {
            const dir = path.dirname(partiteFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(partiteFile, JSON.stringify(data, null, 2));
        };

        const caricaNomi = () => {
            if (!fs.existsSync(nomiFile)) return {};
            return JSON.parse(fs.readFileSync(nomiFile, 'utf8'));
        };

        const salvaNomi = (data) => {
            const dir = path.dirname(nomiFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(nomiFile, JSON.stringify(data, null, 2));
        };

        const ottieniNome = (id) => {
            const nomi = caricaNomi();
            return nomi[id] || id;
        };

        const salvaNome = (id, nome) => {
            const nomi = caricaNomi();
            nomi[id] = nome;
            salvaNomi(nomi);
        };

        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const args = msg.body.split(' ').slice(1);
        const from = msg.from;
        const sender = msg.author || msg.from;
        const mioNome = msg._data?.notifyName || msg.contact?.pushname;
        if (mioNome && mioNome !== sender) salvaNome(sender, mioNome);

        const partite = caricaPartite();
        const partitaAttiva = partite[from];

        // -------------------------------
        // SFIDA
        // -------------------------------
        if (args[0] === 'sfida') {
            if (args.length < 2) {
                await msg.reply('❌ Devi specificare l\'ID del giocatore da sfidare con @ID!');
                return;
            }

            // Prendi l'ID da @lid
            const targetId = args[1].startsWith('@') ? args[1].slice(1) + '@c.us' : args[1] + '@c.us';
            const targetName = ottieniNome(targetId) || targetId;

            if (targetId === sender) {
                await msg.reply('❌ Non puoi sfidare te stesso!');
                return;
            }

            if (partitaAttiva) {
                await msg.reply("C'è già una partita in corso! ⚠");
                return;
            }

            partite[from] = {
                sfidante: sender,
                sfidato: targetId,
                sfidanteNome: mioNome || 'Sfidante',
                sfidatoNome: targetName,
                stato: 'attesa_risposta',
                timestamp: Date.now()
            };
            salvaPartite(partite);

            const messaggioSfida = `🔫 ROULETTE RUSSA 🔫\n\nSfida lanciata a @${targetId.split('@')[0]}!\n\n🎯 @${targetId.split('@')[0]}, rispondi con:\n.russa accetto\n.russa rifiuto`;
            await client.sendMessage(msg.from, messaggioSfida, { mentions: [targetId] });
            return;
        }

        // -------------------------------
        // ACCETTO / RIFIUTO
        // -------------------------------
        if (args[0] === 'accetto' || args[0] === 'rifiuto') {
            if (!partitaAttiva || partitaAttiva.stato !== 'attesa_risposta') {
                await msg.reply("Nessuna sfida in attesa! ❌");
                return;
            }

            if (args[0] === 'rifiuto') {
                partite[from] = undefined;
                salvaPartite(partite);
                await msg.reply("Sfida rifiutata! 😔");
                return;
            }

            partite[from].stato = 'scelta_proiettili';
            salvaPartite(partite);
            await msg.reply(`✅ Sfida accettata!\n\nScegli proiettili (1-7):\n.russa 3`);
            return;
        }

        // -------------------------------
        // SCELTA PROIETTILI
        // -------------------------------
        if (!isNaN(args[0])) {
            if (!partitaAttiva || partitaAttiva.stato !== 'scelta_proiettili') {
                await msg.reply("Nessuna partita in configurazione! ❌");
                return;
            }

            const numProiettili = parseInt(args[0]);
            if (numProiettili < 1 || numProiettili > 7) {
                await msg.reply("Numero tra 1 e 7! ❌");
                return;
            }

            let tamburo = new Array(8).fill(false);
            for (let i = 0; i < numProiettili; i++) tamburo[i] = true;
            tamburo = shuffleArray(tamburo);

            partite[from] = {
                ...partitaAttiva,
                stato: 'in_gioco',
                tamburo,
                posizione: 0,
                turno: partitaAttiva.sfidante,
                proiettiliVeri: numProiettili,
                doveSparare: null
            };
            salvaPartite(partite);

            const messaggioInizio = `🔫 PARTITA INIZIATA!\n\nTamburo: 8 colpi (${numProiettili} veri)\n\nÈ il turno di @${partitaAttiva.sfidante.split('@')[0]}!\n\n.russa attacco\n.russa sparo`;
            await client.sendMessage(msg.from, messaggioInizio, { mentions: [partitaAttiva.sfidante] });
            return;
        }

        // -------------------------------
        // ANNULLA
        // -------------------------------
        if (args[0] === 'annulla') {
            if (!partitaAttiva) {
                await msg.reply("Nessuna partita da annullare! ❌");
                return;
            }

            partite[from] = undefined;
            salvaPartite(partite);
            await msg.reply("🚫 Partita annullata!");
            return;
        }

        // -------------------------------
        // RESET CLASSIFICA
        // -------------------------------
        if (args[0] === 'reset') {
            const classificaFile = path.join(__dirname, '..', 'data', 'classifica_roulette.json');
            if (fs.existsSync(classificaFile)) fs.writeFileSync(classificaFile, JSON.stringify({}, null, 2));
            await msg.reply("🗑️ Classifica roulette azzerata!");
            return;
        }

        // -------------------------------
        // AZIONI DI GIOCO
        // -------------------------------
        if (args[0] === 'attacco' || args[0] === 'sparo') {
            if (!partitaAttiva || partitaAttiva.stato !== 'in_gioco') {
                await msg.reply("Nessuna partita in corso! ❌");
                return;
            }

            if (partitaAttiva.turno !== sender) {
                const messaggioTurno = `Non è il tuo turno! È il turno di @${partitaAttiva.turno.split('@')[0]}! ❌`;
                await client.sendMessage(msg.from, messaggioTurno, { mentions: [partitaAttiva.turno] });
                return;
            }

            if (partitaAttiva.doveSparare && args[0] !== 'sparo') {
                await msg.reply("Devi scrivere: .russa sparo! ❌");
                return;
            }

            const colpoVero = partitaAttiva.tamburo[partitaAttiva.posizione];
            const bersaglio = args[0] === 'attacco'
                ? (sender === partitaAttiva.sfidante ? partitaAttiva.sfidato : partitaAttiva.sfidante)
                : sender;

            if (colpoVero) {
                partite[from] = undefined;
                salvaPartite(partite);

                const vincitore = bersaglio === sender
                    ? (sender === partitaAttiva.sfidante ? partitaAttiva.sfidato : partitaAttiva.sfidante)
                    : sender;

                const nomeBersaglio = bersaglio === partitaAttiva.sfidante ? partitaAttiva.sfidanteNome : partitaAttiva.sfidatoNome;
                const nomeVincitore = vincitore === partitaAttiva.sfidante ? partitaAttiva.sfidanteNome : partitaAttiva.sfidatoNome;

                aggiornaClassifica(bersaglio, -3, false, 'roulette', nomeBersaglio);
                aggiornaClassifica(vincitore, 8, true, 'roulette', nomeVincitore);

                const messaggioFinale = `💥 BANG! 💥\n\nPartita finita!\n\n🏆 Vincitore: @${vincitore.split('@')[0]}!\n\n📊 Usa .classifica`;
                await client.sendMessage(msg.from, messaggioFinale, { mentions: [vincitore] });
                return;
            }

            partite[from].posizione++;
            if (args[0] === 'attacco') {
                partite[from].doveSparare = 'sparo';
                salvaPartite(partite);

                const messaggioSparo = `CLICK 🔫\n\nColpo vuoto! Ora @${sender.split('@')[0]} devi spararti!\n\n.russa sparo`;
                await client.sendMessage(msg.from, messaggioSparo, { mentions: [sender] });
            } else {
                const prossimoTurno = sender === partitaAttiva.sfidante ? partitaAttiva.sfidato : partitaAttiva.sfidante;
                partite[from].turno = prossimoTurno;
                partite[from].doveSparare = null;
                salvaPartite(partite);

                const messaggioTurno = `CLICK 🔫\n\nSalvo! È il turno di @${prossimoTurno.split('@')[0]}!\n\n.russa attacco\n.russa sparo`;
                await client.sendMessage(msg.from, messaggioTurno, { mentions: [prossimoTurno] });
            }
            return;
        }

        // -------------------------------
        // MESSAGGIO HELP
        // -------------------------------
        await msg.reply("🔫 ROULETTE RUSSA 🔫\n\n.russa sfida @ID - sfida\n.russa accetto/rifiuto\n.russa [1-7] - proiettili\n.russa attacco/sparo\n.russa annulla - annulla partita\n.russa reset - azzera classifica");
    }
};