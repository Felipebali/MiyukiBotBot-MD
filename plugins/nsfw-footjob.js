// plugins/nsfw-footjob.js
let handler = async (m, { conn }) => {
    try {
        const chat = global.db.data.chats[m.chat] || {};

        // Verificar si NSFW está activado
        if (!chat.nsfw && m.isGroup) {
            return conn.sendMessage(m.chat, { 
                text: `⚠️ El contenido *NSFW* está desactivado en este grupo.\n> Un dueño puede activarlo con *#nsfw*` 
            }, { quoted: m });
        }

        // Detectar usuario objetivo
        let who;
        if (m.mentionedJid?.length) who = m.mentionedJid[0];
        else if (m.quoted) who = m.quoted.sender;
        else who = m.sender;

        // Solo usernames
        const usernameTarget = `@${who.split("@")[0]}`;
        const usernameSender = `@${m.sender.split("@")[0]}`;

        // Construir mensaje usando solo usernames
        let str;
        if (m.mentionedJid?.length || m.quoted) {
            str = `${usernameSender} le hizo una paja con los pies a ${usernameTarget}.`;
        } else {
            str = `${usernameSender} está haciendo una paja con los pies!`;
        }

        // Lista de videos NSFW
        const videos = [
            'https://qu.ax/aTGxj.mp4',
            'https://qu.ax/SCxhs.mp4',
            'https://qu.ax/ASKQT.mp4',
            'https://qu.ax/UQzPO.mp4',
            'https://qu.ax/yexqZ.mp4',
            'https://qu.ax/Agxmr.mp4',
            'https://qu.ax/dvgDr.mp4'
        ];

        const video = videos[Math.floor(Math.random() * videos.length)];

        // Enviar video con mención de ambos
        const mentions = [m.sender, who];
        await conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '✖️ Ocurrió un error al ejecutar el comando NSFW.' }, { quoted: m });
    }
};

handler.help = ['footjob/pies @tag'];
handler.tags = ['nsfw'];
handler.command = ['footjob', 'pies'];
handler.group = true;

export default handler;
