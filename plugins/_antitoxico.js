// plugins/antitoxico.js

// Alias compatibles con tu panel y con el resto de plugins
const aliasMap = ["antitoxico", "antitoxic", "antiToxico", "antiToxic"];

let handler = async (m, { conn, isAdmin, usedPrefix, command }) => {
    if (!m.isGroup) return;

    // ---------------------------
    // ACTIVAR / DESACTIVAR
    // ---------------------------
    if (aliasMap.includes(command)) {

        if (!isAdmin) 
            return m.reply("❌ Solo admins pueden activar o desactivar el Anti-Tóxico.");

        if (!global.db.data.chats[m.chat]) 
            global.db.data.chats[m.chat] = {};

        let chat = global.db.data.chats[m.chat];

        // Usamos la clave correcta que espera tu panel
        chat.antitoxic = !chat.antitoxic;

        return m.reply(
            `🤬 Anti-Tóxico *${chat.antitoxic ? "ACTIVADO" : "DESACTIVADO"}*\n` +
            `Los insultos ahora ${chat.antitoxic ? "serán advertidos." : "no serán moderados."}`
        );
    }

    // ---------------------------
    // FILTRO DE TOXICIDAD
    // ---------------------------
    const chat = global.db.data.chats[m.chat] || {};

    if (!chat.antitoxic) return;

    // obtener el texto del mensaje (caption, texto plano, etc.)
    const text =
        m.text ||
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        "";

    if (!text) return;

    const msg = text.toLowerCase();

    const toxicWords = [
        'tonto','idiota','estúpido','burro','feo','mierda','gil',
        'pelotudo','bobo','pendejo','forro','tarado'
    ];

    const found = toxicWords.find(w => msg.includes(w));
    if (!found) return;

    let who = m.sender;

    await conn.sendMessage(m.chat, {
        text: `⚠️ @${who.split("@")[0]} calmate un poco, no se permiten insultos 😾`,
        mentions: [who]
    });
};

handler.command = aliasMap; // acepta varios nombres
handler.group = true;
handler.admin = false; // manejo interno

export default handler;
