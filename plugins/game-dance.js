let handler = async (m, { conn, usedPrefix, command }) => {
    // Verificar si los juegos están activados en este chat
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.' }, { quoted: m });
    }

    let pp = 'https://tinyurl.com/26djysdo';
    let pp2 = 'https://tinyurl.com/294oahv9';

    let who;
    if (m.isGroup) who = m.mentionedJid?.[0];
    else who = m.chat;

    if (!who) return conn.reply(m.chat, '🚩 Menciona al usuario con *@user*', m);

    let name2 = conn.getName(who);
    let name = conn.getName(m.sender);

    // Elegir video aleatorio
    const videoUrl = [pp, pp2][Math.floor(Math.random() * 2)];

    // Enviar mensaje con video/gif
    await conn.sendMessage(
        m.chat,
        {
            video: { url: videoUrl },
            gifPlayback: true,
            caption: `💃 *${name}* está bailando con *${name2}* 🎶\n\n(ﾉ^ヮ^)ﾉ*:・ﾟ✧ ¡A bailar! 🕺`
        },
        { quoted: m }
    );
};

handler.help = ['dance *<@user>*'];
handler.tags = ['game'];
handler.command = ['dance', 'bailar'];
export default handler;
