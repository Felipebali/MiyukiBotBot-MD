// plugins/grupo-warn.js
function normalizeJid(jid) {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

const handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin, isROwner }) => {
  if (!m.isGroup) return m.reply('🚫 Este comando solo se puede usar en grupos.')

  const chatDB = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
  if (!chatDB.warns) chatDB.warns = {}
  const warns = chatDB.warns

  // ---------- ⚠️ DAR ADVERTENCIA ----------
  if (['advertencia', 'ad', 'daradvertencia', 'advertir', 'warn'].includes(command)) {
    if (!isAdmin) return m.reply('❌ Solo los administradores pueden advertir.')
    if (!isBotAdmin) return m.reply('🤖 Necesito ser administrador para poder eliminar usuarios.')

    const userRaw = m.mentionedJid?.[0] || m.quoted?.sender
    const user = normalizeJid(userRaw)
    if (!user) return m.reply(`⚠️ Debes mencionar o responder a alguien.\n📌 Ejemplo: ${usedPrefix}${command} @usuario [motivo]`)

    let motivo = text?.trim()
      .replace(new RegExp(`^@${user.split('@')[0]}`, 'gi'), '')
      .replace(new RegExp(`^${usedPrefix}${command}`, 'gi'), '')
      .trim()
    if (!motivo) motivo = 'Sin especificar 💤'

    const fecha = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })

    const uid = normalizeJid(user)
    if (!warns[uid]) warns[uid] = { count: 0, motivos: [] }
    if (!Array.isArray(warns[uid].motivos)) warns[uid].motivos = []

    warns[uid].count += 1
    warns[uid].motivos.push({ motivo, fecha })
    const count = warns[uid].count
    await global.db.write()

    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })

    if (count >= 3) {
      const msg = `🚫 *El usuario @${uid.split('@')[0]} fue eliminado por acumular 3 advertencias.*\n🧹 Adiós 👋`
      try {
        await conn.sendMessage(m.chat, { text: msg, mentions: [uid], quoted: m })
        await conn.groupParticipantsUpdate(m.chat, [uid], 'remove')
        delete warns[uid]
        await global.db.write()
      } catch (e) {
        console.error(e)
        return m.reply('❌ No se pudo eliminar al usuario. Verifica los permisos del bot.')
      }
    } else {
      const restantes = 3 - count
      await conn.sendMessage(m.chat, {
        text: `⚠️ *Advertencia para:* @${uid.split('@')[0]}\n🧾 *Motivo:* ${motivo}\n📅 *Fecha:* ${fecha}\n\n📋 *Advertencias:* ${count}/3\n🕒 Restan *${restantes}* antes de ser expulsado.`,
        mentions: [uid],
        quoted: m
      })
    }
  }

  // ---------- 🟢 QUITAR ADVERTENCIA ----------
  else if (['unwarn', 'quitarwarn', 'sacarwarn'].includes(command)) {
    if (!isAdmin && !isROwner) return m.reply('⚠️ Solo los administradores o el dueño pueden quitar advertencias.')

    const targetRaw = m.quoted?.sender || m.mentionedJid?.[0]
    const target = normalizeJid(targetRaw)
    if (!target) return m.reply('❌ Debes mencionar o responder al mensaje del usuario para quitarle una advertencia.')

    const uid = normalizeJid(target)
    const userWarn = warns[uid]

    if (!userWarn || !userWarn.count)
      return conn.sendMessage(m.chat, { text: `✅ @${uid.split('@')[0]} no tiene advertencias.`, mentions: [uid], quoted: m })

    userWarn.count = Math.max(0, userWarn.count - 1)
    userWarn.motivos?.pop()
    if (userWarn.count === 0 && (!userWarn.motivos || userWarn.motivos.length === 0)) delete warns[uid]
    await global.db.write()

    await conn.sendMessage(m.chat, { react: { text: '🟢', key: m.key } })
    await conn.sendMessage(m.chat, {
      text: `🟢 *Advertencia retirada a:* @${uid.split('@')[0]}\n📋 Ahora tiene *${userWarn?.count || 0}/3* advertencias.`,
      mentions: [uid],
      quoted: m
    })
  }

  // ---------- 📜 LISTA DE ADVERTENCIAS ----------
  else if (['warnlist', 'advertencias', 'listaad'].includes(command)) {
    const entries = Object.entries(warns)
      .map(([jid, data]) => [normalizeJid(jid), data])
      .filter(([_, w]) => w.count && w.count > 0)

    if (entries.length === 0) return m.reply('✅ No hay usuarios con advertencias en este grupo.')

    let textList = '⚠️ *Usuarios con advertencias:*\n\n'
    let mentions = []

    for (const [jid, w] of entries) {
      textList += `👤 @${jid.split('@')[0]} → ${w.count}/3\n`
      if (w.motivos?.length) {
        w.motivos.slice(-3).forEach((m, i) => {
          textList += `   ${i + 1}. ${m.motivo} — 🗓️ ${m.fecha}\n`
        })
      }
      textList += '\n'
      mentions.push(jid)
    }

    await conn.sendMessage(m.chat, {
      text: textList.trim(),
      mentions,
      quoted: m
    })
  }

  // ---------- 🧹 LIMPIAR TODAS LAS ADVERTENCIAS (solo owner) ----------
  else if (['clearwarn', 'limpiarwarn'].includes(command)) {
    if (!isROwner) return m.reply('⚠️ Solo el dueño del bot puede limpiar todas las advertencias.')

    const keys = Object.keys(warns)
    if (keys.length === 0) return m.reply('✅ No hay advertencias para limpiar.')

    keys.forEach(k => delete warns[k])
    await global.db.write()

    await conn.sendMessage(m.chat, { text: '🧹 Todas las advertencias del grupo han sido eliminadas.' })
  }
}

handler.command = [
  'advertencia','ad','daradvertencia','advertir','warn',
  'unwarn','quitarwarn','sacarwarn',
  'warnlist','advertencias','listaad',
  'clearwarn','limpiarwarn'
]
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
