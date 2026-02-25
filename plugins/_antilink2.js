// plugins/_antilink2.js
const blockedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i

export async function before(m, { conn, isBotAdmin }) {
    if (!m?.text) return true
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return true
    if (!isBotAdmin) return true

    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat?.antiLink2) return true

    const who = m.sender
    const mentions = [who]

    if (blockedLinks.test(m.text)) {
        try {
            // 🔹 Borra el mensaje
            await conn.sendMessage(m.chat, { delete: m.key })

            // 🔹 Mensaje de aviso con mención
            await conn.sendMessage(m.chat, {
                text: `⚠️ @${who.split('@')[0]}, ese link de Instagram, TikTok o YouTube no está permitido.`,
                mentions
            })
        } catch (e) {
            console.error('Error en Anti-Link2:', e)
        }
    }

    return true
}
