// plugins/nsfw-spank.js
let handler = async (m, { conn }) => {
    const chat = global.db.data.chats[m.chat] || {};

    // Verificar si NSFW está activado
    if (!chat.nsfw && m.isGroup) {
        return conn.sendMessage(
            m.chat,
            { text: `⚠️ El contenido *NSFW* está desactivado en este grupo.\n> Un dueño puede activarlo con *#nsfw*` },
            { quoted: m }
        );
    }

    // Detectar usuario objetivo
    let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;

    // Solo usernames
    const usernameTarget = `@${who.split("@")[0]}`;
    const usernameSender = `@${m.sender.split("@")[0]}`;

    // Construir mensaje
    let str;
    if (m.mentionedJid?.length || m.quoted) {
        str = `${usernameSender} *le dio una nalgada a* ${usernameTarget}.`;
    } else {
        str = `${usernameSender} *está repartiendo nalgadas! >.<*`;
    }

    // Lista de videos NSFW
    const videos = [
        'https://files.catbox.moe/yjulgu.mp4',
        'https://telegra.ph/file/07fe0023525be2b2579f9.mp4',
        'https://telegra.ph/file/f830f235f844e30d22e8e.mp4',
        'https://telegra.ph/file/e278ca6dc7d26a2cfda46.mp4',
        'https://files.catbox.moe/mf3tve.mp4',
        'https://files.catbox.moe/hobfrw.mp4',
        'https://files.catbox.moe/rzijb5.mp4'
    ];

    const video = videos[Math.floor(Math.random() * videos.length)];

    // Enviar video con mención de ambos
    const mentions = [m.sender, who];
    await conn.sendMessage(
        m.chat,
        { video: { url: video }, gifPlayback: true, caption: str, mentions },
        { quoted: m }
    );
};

handler.help = ['spank/nalgada @tag'];
handler.tags = ['nsfw'];
handler.command = ['spank', 'nalgada'];
handler.group = true;

export default handler;
