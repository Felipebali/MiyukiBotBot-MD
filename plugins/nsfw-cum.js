// Código creado por Destroy wa.me/584120346669
import fs from 'fs'
import path from 'path'

const owners = ['59896026646@s.whatsapp.net', '59898719147@s.whatsapp.net'] // Números de owner

let handler = async (m, { conn, usedPrefix }) => {
    // Verifica si el contenido NSFW está activado
    if (m.isGroup && !global.db.data.chats[m.chat]?.nsfw) {
        if (owners.includes(m.sender)) {
            await m.reply(`《✦》El contenido *NSFW* está desactivado en este grupo.\n> Puedes activarlo con el comando » *#nsfw on*`)
        }
        return // si está desactivado, no continúa
    }

    // Determina a quién se menciona o cita
    let who
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0]
    } else if (m.quoted) {
        who = m.quoted.sender
    } else {
        who = m.sender
    }

    // Solo usernames
    const usernameTarget = `@${who.split("@")[0]}`
    const usernameSender = `@${m.sender.split("@")[0]}`

    // Texto del caption
    let str
    if (m.mentionedJid && m.mentionedJid.length > 0 || m.quoted) {
        str = `${usernameSender} *se vino dentro de* ${usernameTarget}. 💦`
    } else {
        str = `${usernameSender} *se vino dentro de... mejor no lo decimos 🥛*`
    }

    // Lista de videos NSFW
    const videos = [
        'https://telegra.ph/file/9243544e7ab350ce747d7.mp4',
        'https://telegra.ph/file/fadc180ae9c212e2bd3e1.mp4',
        'https://telegra.ph/file/79a5a0042dd8c44754942.mp4',
        'https://telegra.ph/file/035e84b8767a9f1ac070b.mp4',
        'https://telegra.ph/file/0103144b636efcbdc069b.mp4',
        'https://telegra.ph/file/4d97457142dff96a3f382.mp4',
        'https://telegra.ph/file/b1b4c9f48eaae4a79ae0e.mp4',
        'https://telegra.ph/file/5094ac53709aa11683a54.mp4',
        'https://telegra.ph/file/dc279553e1ccfec6783f3.mp4',
        'https://telegra.ph/file/acdb5c2703ee8390aaf33.mp4'
    ]

    const video = videos[Math.floor(Math.random() * videos.length)]

    try {
        // Enviar video con mención de ambos
        const mentions = [m.sender, who]
        await conn.sendMessage(
            m.chat,
            { video: { url: video }, gifPlayback: true, caption: str, mentions },
            { quoted: m }
        )
        await m.react('🥛') // Reacciona con un vaso de leche
    } catch (e) {
        console.error(e)
        await m.reply('❌ No se pudo enviar el contenido NSFW. Intenta más tarde.')
    }
}

handler.help = ['cum', 'leche']
handler.tags = ['nsfw']
handler.command = ['cum', 'leche']
handler.group = true

export default handler
