const { aggiornaClassifica } = require('./classifica');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'scelta',
    description: 'Scelta casuale tra opzioni',
    async execute(msg) {
        const args = msg.body.split(' ').slice(1);
        
        if (args.length < 2) {
            msg.reply('🎯 SCELTA CASUALE\n\nUso: .scelta [opzione1] [opzione2] [opzione3]...\n\nEsempi:\n• .scelta pizza hamburger sushi\n• .scelta Marco Giulia Alessandro\n• .scelta studiare giocare dormire\n\n🎲 Sceglierò per te!');
            return;
        }
        
        const sceltaCasuale = args[Math.floor(Math.random() * args.length)];
        
        let message = '🎯 SCELTA CASUALE 🎯\n\n';
        message += `📋 Opzioni: ${args.join(', ')}\n\n`;
        message += `🎊 Ho scelto: **${sceltaCasuale}**!\n\n`;
        
        // Sistema nomi
        const sender = msg.author || msg.from;
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
        
        // Salva nome se disponibile
        const mioNome = msg._data?.notifyName || msg.contact?.pushname;
        if (mioNome && mioNome !== sender) {
            const nomi = caricaNomi();
            nomi[sender] = mioNome;
            salvaNomi(nomi);
        }
        
        const userName = mioNome || sender;
        const punti = Math.max(1, Math.floor(args.length / 2)); // Più opzioni = più punti
        
        aggiornaClassifica(sender, punti, false, 'scelta', userName);
        
        message += `🎲 La fortuna ha deciso! +${punti} punti!`;
        message += '\n📈 Usa .classifica per vedere i punti!';
        
        await msg.reply(message);
    }
};