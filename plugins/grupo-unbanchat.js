let handler = async (m, { conn }) => {
    if (!(m.chat in global.db.data.chats)) 
        return conn.reply(m.chat, '🔥 *¡Este chat no está registrado!*', m)

    let chat = global.db.data.chats[m.chat]
    if (!chat.isBanned) 
        return conn.reply(m.chat, '👑 *¡FelixCat-Bot no está baneado en este chat!*', m)

    chat.isBanned = false
    await conn.reply(m.chat, '⚡ *¡FelixCat-Bot ya fue desbaneado en este chat!*', m)
}

handler.help = ['ba']
handler.tags = ['grupo']
handler.command = ['ba']
handler.owner = true
handler.botAdmin = true
handler.group = true

export default handler
