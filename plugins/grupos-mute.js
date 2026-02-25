// 📂 plugins/mute.js

let handler = async (m, { conn, usedPrefix, command, isAdmin, isBotAdmin }) => {

  if (!m.isGroup) return m.reply("❌ Solo funciona en grupos.")
  if (!isAdmin) return m.reply("⚠️ Solo admins pueden usar este comando.")
  if (!isBotAdmin) return m.reply("⚠️ El bot debe ser admin.")

  let who

  if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0]
  } else if (m.quoted) {
    who = m.quoted.sender
  }

  if (!who) return m.reply(`✏️ Uso:\n${usedPrefix + command} citando mensaje.`)

  who = conn.decodeJid(who)

  // 🔐 PROTEGER OWNERS
  const ownerJids = (global.owner || []).map(v => {
    if (Array.isArray(v)) v = v[0]
    return conn.decodeJid(
      String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    )
  })

  if (ownerJids.includes(who)) return m.react("❌")

  // 📂 BASE
  global.db.data = global.db.data || {}
  global.db.data.users = global.db.data.users || {}
  global.db.data.users[who] = global.db.data.users[who] || {}

  let user = global.db.data.users[who]

  user.mute = user.mute || {}
  user.mute[m.chat] =
    (command === "desilenciar" || command === "unmute") ? false : true

  await m.react("✅")

  m.reply(
    user.mute[m.chat]
      ? "🔇 Usuario silenciado correctamente."
      : "🔊 Usuario desilenciado correctamente."
  )
}

handler.command = ["silenciar", "mute", "desilenciar", "unmute"]
handler.group = true
handler.admin = true
handler.botAdmin = true

// =============================
// 🚨 BEFORE REAL — BORRAR MENSAJES
// =============================

handler.before = async function (m, { conn }) {

  if (!m.isGroup) return
  if (!m.sender) return
  if (!m.message) return
  if (m.fromMe) return

  const sender = conn.decodeJid(m.sender)

  global.db.data = global.db.data || {}
  global.db.data.users = global.db.data.users || {}

  let user = global.db.data.users[sender]
  if (!user) return
  if (!user.mute) return
  if (!user.mute[m.chat]) return

  // 🔎 Verificar admin
  let isAdmin = false

  try {
    let meta = await conn.groupMetadata(m.chat)
    let participant = meta.participants.find(
      p => conn.decodeJid(p.id) === sender
    )

    if (participant) {
      isAdmin =
        participant.admin === 'admin' ||
        participant.admin === 'superadmin'
    }
  } catch {}

  if (isAdmin) return

  try {

    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant || sender
      }
    })

  } catch (e) {
    console.log("❌ Error borrando:", e)
  }

}

export default handler
