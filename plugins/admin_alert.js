// 📂 plugins/admin-warn.js — FELI 2026 — ADVERTENCIAS PARA ADMINS 🔥
import fs from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data')
if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true })

const warnsFile = path.join(DATA_PATH, 'admin_warns.json')
if (!fs.existsSync(warnsFile)) fs.writeFileSync(warnsFile, JSON.stringify({}, null, 2))

const loadWarns = () => JSON.parse(fs.readFileSync(warnsFile))
const saveWarns = (data) => fs.writeFileSync(warnsFile, JSON.stringify(data, null, 2))

const normalizeJid = (jid) => {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

// ── LISTA UNIVERSAL DE OWNERS ──
function getOwnersJid() {
  return (global.owner || [])
    .map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string') return null
      return v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    })
    .filter(Boolean)
}

let handler = async (m, { conn, text = '', usedPrefix = '.', command }) => {
  const ownersJid = getOwnersJid()
  const sender = normalizeJid(m.sender)

  // 🔒 SOLO OWNER
  if (!ownersJid.includes(sender)) {
    return conn.sendMessage(m.chat, { text: '❌ Solo los dueños del bot pueden usar este comando.', quoted: m })
  }

  if (!m.isGroup) return conn.sendMessage(m.chat, { text: '🚫 Este comando solo se puede usar en grupos.', quoted: m })

  const warnsDB = loadWarns()
  if (!warnsDB[m.chat]) warnsDB[m.chat] = {}
  const warns = warnsDB[m.chat]

  const meta = await conn.groupMetadata(m.chat)
  const participants = meta.participants

  // Determinar admin objetivo
  const targetRaw = m.mentionedJid?.[0] || m.quoted?.sender
  const target = normalizeJid(targetRaw)
  if (!target) return conn.sendMessage(m.chat, { text: `⚠️ Debes mencionar o responder a un administrador.\nEj: ${usedPrefix}${command} @admin [motivo]`, quoted: m })

  const targetAdmin = participants.find(p => p.id === target)
  if (!targetAdmin?.admin) return conn.sendMessage(m.chat, { text: '⚠️ Solo puedes advertir a administradores.', quoted: m })

  if (!warns[target]) warns[target] = { count: 0, motivos: [] }
  if (!Array.isArray(warns[target].motivos)) warns[target].motivos = []

  // ---------- ⚠️ PONER ADVERTENCIA ----------
  if (command === 'admad') {
    let motivo = text.trim()
      .replace(new RegExp(`^@${target.split('@')[0]}`, 'gi'), '')
      .replace(new RegExp(`^${usedPrefix}${command}`, 'gi'), '')
      .trim()
    if (!motivo) motivo = 'Sin especificar 💤'

    const fecha = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })

    warns[target].count += 1
    warns[target].motivos.push({ motivo, fecha })
    const count = warns[target].count
    saveWarns(warnsDB)

    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })

    if (count >= 3) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [target], 'demote')
        warns[target] = { count: 0, motivos: [] }
        saveWarns(warnsDB)
        return conn.sendMessage(m.chat, { text: `🚫 *El administrador @${target.split('@')[0]} ha sido despromovido por acumular 3 advertencias.*\n🧹 Adiós 👋`, mentions: [target], quoted: m })
      } catch (e) {
        console.error(e)
        return conn.sendMessage(m.chat, { text: '❌ No se pudo despromover al administrador. Verifica los permisos del bot.', quoted: m })
      }
    } else {
      const restantes = 3 - count
      return conn.sendMessage(m.chat, { 
        text: `⚠️ *Advertencia para admin:* @${target.split('@')[0]}\n📝 Motivo: ${motivo}\n📅 Fecha: ${fecha}\n\n📋 Total: ${count}/3\n🕒 Restan *${restantes}* para ser despromovido.`, 
        mentions: [target],
        quoted: m 
      })
    }
  }

  // ---------- 🟢 QUITAR ADVERTENCIA ----------
  else if (command === 'unadmad') {
    const userWarn = warns[target]
    if (!userWarn || !userWarn.count) return conn.sendMessage(m.chat, { text: `✅ @${target.split('@')[0]} no tiene advertencias.`, mentions: [target], quoted: m })

    userWarn.count = Math.max(0, userWarn.count - 1)
    userWarn.motivos?.pop()
    if (userWarn.count === 0 && (!userWarn.motivos || userWarn.motivos.length === 0)) delete warns[target]
    saveWarns(warnsDB)

    await conn.sendMessage(m.chat, { react: { text: '🟢', key: m.key } })
    return conn.sendMessage(m.chat, { text: `🟢 *Advertencia retirada a admin:* @${target.split('@')[0]}\n📋 Ahora tiene *${userWarn?.count || 0}/3* advertencias.`, mentions: [target], quoted: m })
  }

  // ---------- 📜 LISTA DE ADVERTENCIAS ----------
  else if (command === 'listadmad') {
    const entries = Object.entries(warns).filter(([jid, w]) => w.count && w.count > 0)
    if (!entries.length) return conn.sendMessage(m.chat, { text: '✅ No hay administradores con advertencias.', quoted: m })

    let textList = '⚠️ *Advertencias activas a administradores:*\n\n'
    const mentions = []

    for (const [jid, w] of entries) {
      const ultimo = w.motivos?.length ? w.motivos[w.motivos.length - 1] : null
      const motivo = ultimo ? ultimo.motivo : 'Sin motivo'
      textList += `• @${jid.split('@')[0]} → ${w.count}/3 — 📝 ${motivo}\n`
      mentions.push(jid)
    }

    return conn.sendMessage(m.chat, { text: textList.trim(), mentions, quoted: m })
  }

  // ---------- 🧹 LIMPIAR TODAS LAS ADVERTENCIAS ----------
  else if (command === 'clearadmad') {
    Object.keys(warns).forEach(k => delete warns[k])
    saveWarns(warnsDB)
    return conn.sendMessage(m.chat, { text: '🧹 Todas las advertencias a administradores han sido eliminadas.', quoted: m })
  }
}

handler.command = [
  'admad',    // poner advertencia
  'unadmad',  // quitar advertencia
  'listadmad',// ver lista
  'clearadmad'// limpiar todas
]

export default handler
