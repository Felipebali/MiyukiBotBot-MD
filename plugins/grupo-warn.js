// plugins/grupo-warn.js
import fs from 'fs'
import path from 'path'

// ── RUTA DEL ARCHIVO DE ADVERTENCIAS ──
const DATA_PATH = path.join(process.cwd(), 'data')
if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH)

const warnsFile = path.join(DATA_PATH, 'warns.json')

function loadWarns() {
  if (!fs.existsSync(warnsFile)) return {}
  try { return JSON.parse(fs.readFileSync(warnsFile)) } catch { return {} }
}

function saveWarns(warns) {
  fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2))
}

function normalizeJid(jid) {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

const handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin, isROwner }) => {
  if (!m.isGroup) return m.reply('🚫 Este comando solo se puede usar en grupos.')

  const warnsDB = loadWarns()
  if (!warnsDB[m.chat]) warnsDB[m.chat] = {}
  const warns = warnsDB[m.chat]

  // ---------- ⚠️ DAR ADVERTENCIA ----------
  if (['advertencia','ad','daradvertencia','advertir','warn'].includes(command)) {
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

    if (!warns[user]) warns[user] = { count: 0, motivos: [] }
    if (!Array.isArray(warns[user].motivos)) warns[user].motivos = []

    warns[user].count += 1
    warns[user].motivos.push({ motivo, fecha })
    const count = warns[user].count
    saveWarns(warnsDB)

    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })

    if (count >= 3) {
      const msg = `🚫 *El usuario @${user.split('@')[0]} fue eliminado por acumular 3 advertencias.*\n🧹 Adiós 👋`
      try {
        await conn.sendMessage(m.chat, { text: msg, mentions: [user], quoted: m })
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        delete warns[user]
        saveWarns(warnsDB)
      } catch (e) {
        console.error(e)
        return m.reply('❌ No se pudo eliminar al usuario. Verifica los permisos del bot.')
      }
    } else {
      const restantes = 3 - count
      await conn.sendMessage(m.chat, {
        text: `⚠️ *Advertencia para:* @${user.split('@')[0]}\n🧾 *Motivo:* ${motivo}\n📅 *Fecha:* ${fecha}\n\n📋 *Advertencias:* ${count}/3\n🕒 Restan *${restantes}* antes de ser expulsado.`,
        mentions: [user],
        quoted: m
      })
    }
  }

  // ---------- 🟢 QUITAR ADVERTENCIA ----------
  else if (['unwarn','quitarwarn','sacarwarn'].includes(command)) {
    if (!isAdmin && !isROwner) return m.reply('⚠️ Solo los administradores o el dueño pueden quitar advertencias.')

    const targetRaw = m.quoted?.sender || m.mentionedJid?.[0]
    const target = normalizeJid(targetRaw)
    if (!target) return m.reply('❌ Debes mencionar o responder al mensaje del usuario para quitarle una advertencia.')

    const userWarn = warns[target]

    if (!userWarn || !userWarn.count)
      return conn.sendMessage(m.chat, { text: `✅ @${target.split('@')[0]} no tiene advertencias.`, mentions: [target], quoted: m })

    userWarn.count = Math.max(0, userWarn.count - 1)
    userWarn.motivos?.pop()
    if (userWarn.count === 0 && (!userWarn.motivos || userWarn.motivos.length === 0)) delete warns[target]
    saveWarns(warnsDB)

    await conn.sendMessage(m.chat, { react: { text: '🟢', key: m.key } })
    await conn.sendMessage(m.chat, {
      text: `🟢 *Advertencia retirada a:* @${target.split('@')[0]}\n📋 Ahora tiene *${userWarn?.count || 0}/3* advertencias.`,
      mentions: [target],
      quoted: m
    })
  }

  // ---------- 📜 LISTA DE ADVERTENCIAS ORDENADA ----------
  else if (['warnlist','advertencias','listaad'].includes(command)) {

    const entries = Object.entries(warns)
      .filter(([_, w]) => w.count && w.count > 0)
      .sort((a,b) => b[1].count - a[1].count)

    if (entries.length === 0) return m.reply('✅ No hay usuarios con advertencias en este grupo.')

    let textList = '⚠️ *LISTA DE ADVERTENCIAS*\n'
    textList += '━━━━━━━━━━━━━━━\n\n'

    let mentions = []
    let i = 1

    for (const [jid, w] of entries) {

      const ultimo = w.motivos?.length ? w.motivos[w.motivos.length - 1] : null
      const motivo = ultimo?.motivo || 'Sin motivo'
      const fecha = ultimo?.fecha || 'Desconocida'

      textList += `*${i}.* 👤 @${jid.split('@')[0]}\n`
      textList += `⚠️ Advertencias: *${w.count}/3*\n`
      textList += `📝 Motivo: ${motivo}\n`
      textList += `📅 Fecha: ${fecha}\n`
      textList += `━━━━━━━━━━━━━━━\n\n`

      mentions.push(jid)
      i++
    }

    textList += `👮 Usuarios advertidos: *${entries.length}*`

    await conn.sendMessage(m.chat, {
      text: textList.trim(),
      mentions,
      quoted: m
    })
  }

  // ---------- 🧹 LIMPIAR TODAS LAS ADVERTENCIAS ----------
  else if (['clearwarn','limpiarwarn'].includes(command)) {
    if (!isROwner) return m.reply('⚠️ Solo el dueño del bot puede limpiar todas las advertencias.')

    Object.keys(warns).forEach(k => delete warns[k])
    saveWarns(warnsDB)

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
