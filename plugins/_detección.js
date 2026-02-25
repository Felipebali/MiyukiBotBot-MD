// ✨ FATÍDICO PLUGIN DETECT — FELIXCAT BOT — FULL STUB SUPPORT ✨
import fetch from 'node-fetch'
let { default: WAMessageStubType } = await import('@whiskeysockets/baileys')

const lidCache = new Map()

// =====================================================
// COMANDO .evento (TOGGLE)
// =====================================================
let handler = async function (m, { conn, isAdmin, isOwner }) {
  if (!m.isGroup) return
  if (!isAdmin && !isOwner)
    return conn.reply(m.chat, '🚫 Solo admins pueden usar este comando.', m)

  const chat = global.db.data.chats[m.chat]
  if (!chat) return

  chat.detect = !chat.detect

  await conn.reply(
    m.chat,
    `✨ *Detector de eventos*\n\nEstado: ${
      chat.detect ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'
    }`,
    m
  )
}

handler.command = ['evento']
handler.group = true
handler.admin = true

export default handler

// =====================================================
// BEFORE — DETECTOR DE EVENTOS
// =====================================================
handler.before = async function (m, { conn, participants }) {
  if (!m.messageStubType || !m.isGroup) return

  const chat = global.db.data.chats[m.chat]
  if (!chat || !chat.detect) return

  const primaryBot = chat.primaryBot
  if (primaryBot && conn.user.jid !== primaryBot) return

  const users = m.messageStubParameters?.[0] || ''
  const usuario = await resolveLidToRealJid(m.sender, conn, m.chat)
  const groupAdmins = participants.filter(p => p.admin)

  const pp =
    (await conn.profilePictureUrl(m.chat, 'image').catch(() => null)) ||
    'https://files.catbox.moe/xr2m6u.jpg'

  const nombre = `🌸✨ ¡NUEVO NOMBRE! ✨🌸

@${usuario.split('@')[0]} decidió darle un nuevo nombre.
💌 Ahora se llama: *${m.messageStubParameters[0]}*`

  const foto = `🖼️🌷 ¡Foto renovada! 🌷🖼️

👀 Acción hecha por: @${usuario.split('@')[0]}`

  const newlink = `🔗💫 ¡Enlace del grupo actualizado! 💫🔗

✦ Gracias a: @${usuario.split('@')[0]}`

  const edit = `🔧✨ Configuración del grupo ✨🔧

@${usuario.split('@')[0]} decidió que ${
    m.messageStubParameters[0] === 'on'
      ? 'solo los admins 🌟'
      : 'todos los miembros 🌼'
  } puedan modificar el grupo.`

  const descripcion = `📝✨ ¡Descripción actualizada! ✨📝

@${usuario.split('@')[0]} modificó la descripción del grupo.

📄 Nueva descripción:
*${m.messageStubParameters[0]}*`

  const admingp = `🌟✨ ¡Admin nuevo! ✨🌟

@${users.split('@')[0]} ahora es admin.
🖇️ Acción de: @${usuario.split('@')[0]}`

  const noadmingp = `🌸⚡ ¡Admin removido! ⚡🌸

@${users.split('@')[0]} ya no es admin.
🖇️ Acción de: @${usuario.split('@')[0]}`

  if (m.messageStubType == 21)
    return conn.sendMessage(m.chat, { text: nombre, mentions: [usuario] })

  if (m.messageStubType == 22)
    return conn.sendMessage(m.chat, {
      image: { url: pp },
      caption: foto,
      mentions: [usuario]
    })

  if (m.messageStubType == 23)
    return conn.sendMessage(m.chat, { text: newlink, mentions: [usuario] })

  if (m.messageStubType == 24)
    return conn.sendMessage(m.chat, { text: descripcion, mentions: [usuario] })

  if (m.messageStubType == 25)
    return conn.sendMessage(m.chat, { text: edit, mentions: [usuario] })

  if (m.messageStubType == 29)
    return conn.sendMessage(m.chat, {
      text: admingp,
      mentions: [usuario, users].filter(Boolean)
    })

  if (m.messageStubType == 30)
    return conn.sendMessage(m.chat, {
      text: noadmingp,
      mentions: [usuario, users].filter(Boolean)
    })
}

// =====================================================
// RESOLVE LID → JID REAL
// =====================================================
async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
  const inputJid = lid.toString()

  if (!inputJid.endsWith('@lid') || !groupChatId.endsWith('@g.us'))
    return inputJid.includes('@') ? inputJid : `${inputJid}@s.whatsapp.net`

  if (lidCache.has(inputJid)) return lidCache.get(inputJid)

  const lidToFind = inputJid.split('@')[0]

  for (let i = 0; i < maxRetries; i++) {
    try {
      const meta = await conn.groupMetadata(groupChatId)
      for (const p of meta.participants) {
        const check = await conn.onWhatsApp(p.jid)
        if (check?.[0]?.lid?.startsWith(lidToFind)) {
          lidCache.set(inputJid, p.jid)
          return p.jid
        }
      }
    } catch {}
    await new Promise(r => setTimeout(r, retryDelay))
  }

  return inputJid
}
