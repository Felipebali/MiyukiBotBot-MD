// 📂 plugins/welcome.js
// Welcome + Leave con toggle usando SOLO: welcome

let handler = async (m, { conn, isAdmin }) => {
    if (!m.isGroup)
        return conn.sendMessage(m.chat, { text: "❌ Solo funciona en grupos." });

    if (!isAdmin)
        return conn.sendMessage(m.chat, { text: "⚠️ Solo los administradores pueden usar este comando." });

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};

    let chat = global.db.data.chats[m.chat];

    // Si no existe, por defecto desactivado
    if (typeof chat.welcome === 'undefined') chat.welcome = false;

    chat.welcome = !chat.welcome;

    await conn.sendMessage(m.chat, {
        text: `✨ *Welcome ${chat.welcome ? "ACTIVADO" : "DESACTIVADO"}*\nLos mensajes de entrada y salida están ${chat.welcome ? "habilitados" : "deshabilitados"}.`
    });
};

// --- BEFORE ---
handler.before = async function (m, { conn }) {
    if (!m.isGroup) return;

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];

    // Si welcome está apagado → no hacer nada
    if (!chat.welcome) return;

    // Obtener lista anterior o crearla
    if (!chat.participants) {
        const meta = await conn.groupMetadata(m.chat);
        chat.participants = meta.participants.map(p => p.id);
        return;
    }

    // Metadata actual
    const meta = await conn.groupMetadata(m.chat);
    const current = meta.participants.map(p => p.id);
    const old = chat.participants;

    const added = current.filter(x => !old.includes(x));
    const removed = old.filter(x => !current.includes(x));

    const groupName = meta.subject;

    // 🎉 Bienvenida
    for (let user of added) {
        await conn.sendMessage(m.chat, {
            text: `🎉 ¡Bienvenido/a *@${user.split("@")[0]}* al grupo *${groupName}*!\nDisfruta tu estadía.`,
            mentions: [user]
        });
    }

    // 👋 Despedida
    for (let user of removed) {
        await conn.sendMessage(m.chat, {
            text: `👋 *@${user.split("@")[0]}* salió del grupo *${groupName}*.`,
            mentions: [user]
        });
    }

    chat.participants = current;
};

// 📌 ARRAY DE COMANDOS
handler.command = ["welcome", "welc", "wl"];

handler.group = true;
handler.admin = true;

export default handler;
