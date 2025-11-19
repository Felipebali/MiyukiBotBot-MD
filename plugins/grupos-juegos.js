// plugins/juegos.js
let handler = async (m, { conn, isAdmin, isOwner }) => {
    try {
        const chat = global.db.data.chats[m.chat] || {};
        
        // Solo admins o owners pueden cambiar el estado
        if (!(isAdmin || isOwner)) {
            return await conn.sendMessage(m.chat, { text: '❌ Solo admins o dueños pueden usar este comando.' });
        }

        chat.games = !chat.games; // cambia el estado
        global.db.data.chats[m.chat] = chat;

        const estado = chat.games ? '🟢 Activados' : '🔴 Desactivados';
        await conn.sendMessage(m.chat, { text: `🎮 Mini-juegos ${estado} en este chat.` });

    } catch (e) {
        console.error(e);
        await m.reply('✖️ Error al cambiar el estado de los juegos.');
    }
};

handler.command = ['juegos'];
handler.group = true;
handler.admin = false; // Lo manejamos dentro del handler
handler.rowner = false; // Lo manejamos dentro del handler

export default handler;
