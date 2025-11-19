// plugins/nsfw-boobs.js
let handler = async (m, { conn }) => {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.nsfw) return; // ⚠️ Sale si NSFW está desactivado

    // Username del sender
    const usernameSender = `@${m.sender.split("@")[0]}`;

    // Imagen y caption
    let img = 'https://delirius-apiofc.vercel.app/nsfw/boobs';
    let text = `*🫨 TETAS de ${usernameSender}*`;

    // Enviar imagen con mención
    await conn.sendMessage(
        m.chat,
        { image: { url: img }, caption: text, mentions: [m.sender] },
        { quoted: m }
    );

    m.react('✅');
};

handler.help = ['tetas'];
handler.command = ['tetas'];
handler.tags = ['nsfw'];
handler.group = true;

export default handler;
