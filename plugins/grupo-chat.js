let handler = async (m, { conn, command }) => {

    if (!(m.chat in global.db.data.chats)) {
        return conn.reply(m.chat, '🔥 *¡Este chat no está registrado!*', m)
    }

    let chat = global.db.data.chats[m.chat]

    command = command.toLowerCase()

    // 🟢 SI ESTÁ APAGADO, SOLO PERMITIR .ba
    if (chat.isBanned && command !== 'ba') {
        return conn.reply(m.chat, '🔒 *FelixCat-Bot está apagado en este grupo.*\nUsa *.ba* para activarlo.', m)
    }

    // 🔴 APAGAR BOT
    if (command === 'bc') {

        if (chat.isBanned) {
            return conn.reply(m.chat, '⚠️ *¡FelixCat-Bot ya está apagado en este grupo!*', m)
        }

        chat.isBanned = true
        return conn.reply(m.chat, '🔒 *FelixCat-Bot fue apagado en este grupo.*', m)
    }

    // 🟢 ACTIVAR BOT
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
handler.command = /^(bc|ba)$/i
handler.owner = true
handler.botAdmin = true
handler.group = true

export default handler
