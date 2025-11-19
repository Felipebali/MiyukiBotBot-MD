let handler = async (m, { conn }) => {
    if (!(m.chat in global.db.data.chats)) 
        return conn.reply(m.chat, '🔥 *¡Este chat no está registrado!*', m)

    let chat = global.db.data.chats[m.chat]
    if (chat.isBanned) 
        return conn.reply(m.chat, '⚠️ *¡FelixCat-Bot ya está baneado en este chat!*', m)

    chat.isBanned = true
    await conn.reply(m.chat, '👑 *¡Este chat fue baneado con éxito por FelixCat-Bot!*', m)
}

handler.help = ['bc']
handler.tags = ['grupo']
handler.command = ['bc']
handler.owner = true
handler.botAdmin = true
handler.group = true

export default handler
