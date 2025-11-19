// plugins/antitoxico.js
let handler = async (m, { conn, isAdmin }) => {
    if (!m.isGroup) return; // solo grupos

    if (m.text && m.text.startsWith('.antitoxico')) {
        // Activar/Desactivar
        if (!isAdmin) return m.reply("❌ Solo admins pueden usar este comando.");
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
        let chat = global.db.data.chats[m.chat];
        chat.antitoxico = !chat.antitoxico;
        return m.reply(`✅ Anti-Tóxico ahora está *${chat.antitoxico ? "activado" : "desactivado"}* para todos los miembros.`);
    }

    // Comprobamos si está activado
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.antitoxico) return;

    // Lista de palabras tóxicas
    const toxicWords = ['tonto','idiota','estúpido','burro','feo','mierda','gil'];
    const text = m.text ? m.text.toLowerCase() : '';
    const found = toxicWords.find(w => text.includes(w));
    if (!found) return;

    let who = m.sender;
    let userMention = `@${who.split("@")[0]}`;

    await conn.sendMessage(m.chat, {
        text: `⚠️ ${userMention}, cuidado con tu lenguaje, no se permiten insultos.`,
        mentions: [who]
    });
};

handler.command = ['antitoxico'];
handler.group = true;
handler.admin = true; // solo admins pueden activar/desactivar
export default handler;
