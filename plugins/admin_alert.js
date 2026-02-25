// plugins/admin-warn.js — FELI 2026 — ADVERTENCIAS PARA ADMINS 🔥
import fs from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data')
if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true })

const warnsFile = path.join(DATA_PATH, 'admin_warns.json')

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

// 🔹 Lista universal de owners
function getOwnersJid() {
  return (global.owner || []).map(v => {
    if (Array.isArray(v)) v = v[0]
    if (typeof v !== 'string') return null
    return v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  }).filter(Boolean)
}

const handler = async (m, { conn, text = '', usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('🚫 Este comando solo se puede usar en grupos.')

  const warnsDB = loadWarns()
  if (!warnsDB[m.chat]) warnsDB[m.chat] = {}
  const warns = warnsDB[m.chat]

  const meta = await conn.groupMetadata(m.chat)
  const participants = meta.participants

  const ownersJid = getOwnersJid()
  const sender = normalizeJid(m.sender)

  // 🔒 Solo owners pueden ciertos comandos
  const ownerOnly = ['clearadmad']
  if (ownerOnly.includes(command) && !ownersJid.includes(sender))
    return m.reply('⚠️ Solo los dueños del bot pueden usar este comando.')

  // 🔹 Determinar admin objetivo
  let target = m.quoted?.sender || m.mentionedJid?.[0]
  target = normalizeJid(target)
  if (target) {
    const adminCheck = participants.find(p => p.id === target)
    if (!adminCheck?.admin) return m.reply('⚠️ Solo puedes advertir a administradores.')
  }

  // ---------- ⚠️ PONER ADVERTENCIA ----------
  if (command === 'admad') {
    if (!target) return m.reply(`⚠️ Debes mencionar o responder a un administrador.\nEj: ${usedPrefix}${command} @admin [motivo]`)

    let motivo = text?.replace(`@${target.split('@')[0]}`, '').replace(`${usedPrefix}${command}`, '').trim()
    if (!motivo) motivo = 'Sin especificar 💤'

    const fecha = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })

    if (!warns[target]) warns[target] = { count: 0, motivos: [] }
    warns[target].count += 1
    warns[target].motivos.push({ motivo, fecha })
    saveWarns(warnsDB)

    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })

    const count = warns[target].count
    if (count >= 3) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [target], 'demote')
        delete warns[target]
        saveWarns(warnsDB)
        return conn.sendMessage(m.chat, { text: `🚫 *El administrador @${target.split('@')[0]} ha sido despromovido por acumular 3 advertencias.*\n🧹 Adiós 👋`, mentions: [target], quoted: m })
      } catch {
        return m.reply('❌ No se pudo despromover al administrador. Verifica los permisos del bot.')
      }
    } else {
      const restantes = 3 - count
      return conn.sendMessage(m.chat, {
        text: `⚠️ *Advertencia para admin:* @${target.split('@')[0]}\n📝 Motivo: ${motivo}\n📋 Total: ${count}/3\n🕒 Restan *${restantes}*`,
        mentions: [target],
        quoted: m
      })
    }
  }

  // ---------- 🟢 QUITAR ADVERTENCIA ----------
  else if (command === 'unadmad') {
    if (!target) return m.reply('⚠️ Debes mencionar o responder al administrador para quitarle una advertencia.')
    const userWarn = warns[target]
    if (!userWarn || !userWarn.count)
      return m.reply(`✅ @${target.split('@')[0]} no tiene advertencias.`)

    userWarn.count = Math.max(0, userWarn.count - 1)
    userWarn.motivos?.pop()
    if (userWarn.count === 0) delete warns[target]
    saveWarns(warnsDB)

    await conn.sendMessage(m.chat, { react: { text: '🟢', key: m.key } })
    return conn.sendMessage(m.chat, {
      text: `🟢 *Advertencia retirada a admin:* @${target.split('@')[0]}\n📋 Ahora tiene *${userWarn?.count || 0}/3* advertencias.`,
      mentions: [target],
      quoted: m
    })
  }

  // ---------- 📜 LISTA DE ADVERTENCIAS ----------
  else if (command === 'listadmad') {
    const entries = Object.entries(warns).filter(([_, w]) => w.count > 0)
    if (!entries.length) return m.reply('✅ No hay administradores con advertencias.')

    let textList = '⚠️ *Advertencias activas a administradores:*\n\n'
    let mentions = []

    for (const [jid, w] of entries) {
      const ultimo = w.motivos?.length ? w.motivos[w.motivos.length - 1] : null
      const motivo = ultimo ? ultimo.motivo : 'Sin motivo'
      textList += `• @${jid.split('@')[0]} → ${w.count}/3 — 📝 ${motivo}\n`
      mentions.push(jid)
    }

    await conn.sendMessage(m.chat, { text: textList.trim(), mentions, quoted: m })
  }

  // ---------- 🧹 LIMPIAR TODAS LAS ADVERTENCIAS ----------
  else if (command === 'clearadmad') {
    Object.keys(warns).forEach(k => delete warns[k])
    saveWarns(warnsDB)
    return conn.sendMessage(m.chat, { text: '🧹 Todas las advertencias a administradores han sido eliminadas.' })
  }
}

handler.command = ['admad','unadmad','listadmad','clearadmad']
handler.group = true
handler.admin = true
export default handler
