let handler = async (m, { conn, command }) => {

    // Verificar que el chat exista en la base
    if (!(m.chat in global.db.data.chats)) {
        return conn.reply(m.chat, '🔥 *¡Este chat no está registrado!*', m)
    }

    let chat = global.db.data.chats[m.chat]

    // 🔴 APAGAR BOT (.bc)
    if (command === 'bc') {

        if (chat.isBanned) {
            return conn.reply(m.chat, '⚠️ *¡FelixCat-Bot ya está apagado en este grupo!*', m)
        }

        chat.isBanned = true
        return conn.reply(m.chat, '🔒 *FelixCat-Bot fue apagado en este grupo.*', m)
    }

    // 🟢 ACTIVAR BOT (.ba)
    if (command === 'ba') {

        if (!chat.isBanned) {
            return conn.reply(m.chat, '👑 *¡FelixCat-Bot ya está activo en este grupo!*', m)
        }

        chat.isBanned = false
        return conn.reply(m.chat, '⚡ *FelixCat-Bot fue activado nuevamente en este grupo.*', m)
    }
}

handler.help = ['bc', 'ba']
handler.tags = ['grupo']
handler.command = ['bc', 'ba']
handler.owner = true
handler.botAdmin = true
handler.group = true

export default handler
