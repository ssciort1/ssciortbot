module.exports = {
    name: 'ciao',
    description: 'Saluta il bot',
    async execute(msg) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        msg.reply(`Ciao io sono SsciortBot, sono attualmente ${hours}:${minutes}`);
    }
};