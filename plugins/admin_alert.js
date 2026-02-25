// 📂 plugins/admin-warn.js — FELI 2026 — ADVERTENCIAS PARA ADMINS 🔥

import fs from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data')
if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH)

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

const handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('🚫 Este comando solo se puede usar en grupos.')

  const warnsDB = loadWarns()
  if (!warnsDB[m.chat]) warnsDB[m.chat] = {}
  const warns = warnsDB[m.chat]

  // Determinar admin objetivo
  const targetRaw = m.mentionedJid?.[0] || m.quoted?.sender
  const target = normalizeJid(targetRaw)
  if (!target) return m.reply(`⚠️ Debes mencionar o responder a un administrador.\nEj: ${usedPrefix}${command} @admin [motivo]`)

  const meta = await conn.groupMetadata(m.chat)
  const participants = meta.participants
  const targetAdmin = participants.find(p => p.id === target)
  if (!targetAdmin?.admin) return m.reply('⚠️ Solo puedes advertir a administradores.')

  if (!warns[target]) warns[target] = { count: 0, motivos: [] }
  if (!Array.isArray(warns[target].motivos)) warns[target].motivos = []

  // ---------- ⚠️ DAR ADVERTENCIA ----------
  if (['admad','advertenciaadmin','alertadmin'].includes(command)) {
    if (!isAdmin) return m.reply('❌ Solo los administradores pueden advertir.')
    if (!isBotAdmin) return m.reply('🤖 Necesito ser administrador para poder demotar.')

    let motivo = text?.trim()
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
      const msg = `🚫 *El administrador @${target.split('@')[0]} ha sido despromovido por acumular 3 advertencias.*\n🧹 Adiós 👋`
      try {
        await conn.sendMessage(m.chat, { text: msg, mentions: [target], quoted: m })
        await conn.groupParticipantsUpdate(m.chat, [target], 'demote')
        warns[target] = { count: 0, motivos: [] }
        saveWarns(warnsDB)
      } catch (e) {
        console.error(e)
        return m.reply('❌ No se pudo despromover al administrador. Verifica los permisos del bot.')
      }
    } else {
      const restantes = 3 - count
      await conn.sendMessage(m.chat, {
        text: `⚠️ *Advertencia para admin:* @${target.split('@')[0]}\n📝 Motivo: ${motivo}\n📅 Fecha: ${fecha}\n\n📋 Total: ${count}/3\n🕒 Restan *${restantes}* para ser despromovido.`,
        mentions: [target],
        quoted: m
      })
    }
  }

  // ---------- 🟢 QUITAR ADVERTENCIA ----------
  else if (['unadmad','quitaradvertenciaadmin'].includes(command)) {
    if (!isAdmin) return m.reply('❌ Solo los administradores pueden quitar advertencias.')

    const userWarn = warns[target]
    if (!userWarn || !userWarn.count)
      return conn.sendMessage(m.chat, { text: `✅ @${target.split('@')[0]} no tiene advertencias.`, mentions: [target], quoted: m })

    userWarn.count = Math.max(0, userWarn.count - 1)
    userWarn.motivos?.pop()
    if (userWarn.count === 0 && (!userWarn.motivos || userWarn.motivos.length === 0)) delete warns[target]
    saveWarns(warnsDB)

    await conn.sendMessage(m.chat, { react: { text: '🟢', key: m.key } })
    await conn.sendMessage(m.chat, {
      text: `🟢 *Advertencia retirada a admin:* @${target.split('@')[0]}\n📋 Ahora tiene *${userWarn?.count || 0}/3* advertencias.`,
      mentions: [target],
      quoted: m
    })
  }

  // ---------- 📜 LISTA DE ADVERTENCIAS ----------
  else if (['listadmad','listaadmin','warnadmin'].includes(command)) {
    const entries = Object.entries(warns)
      .filter(([jid, w]) => w.count && w.count > 0)

    if (entries.length === 0) return m.reply('✅ No hay administradores con advertencias.')

    let textList = '⚠️ *Advertencias activas a administradores:*\n\n'
    const mentions = []

    for (const [jid, w] of entries) {
      const ultimo = w.motivos?.length ? w.motivos[w.motivos.length - 1] : null
      const motivo = ultimo ? ultimo.motivo : 'Sin motivo'
      textList += `• @${jid.split('@')[0]} → ${w.count}/3 — 📝 ${motivo}\n`
      mentions.push(jid)
    }

    await conn.sendMessage(m.chat, { text: textList.trim(), mentions, quoted: m })
  }

  // ---------- 🧹 LIMPIAR TODAS LAS ADVERTENCIAS ----------
  else if (['clearadmad','limpiaradvertenciasadmin'].includes(command)) {
    if (!isAdmin) return m.reply('❌ Solo los administradores pueden limpiar advertencias de admins.')

    Object.keys(warns).forEach(k => delete warns[k])
    saveWarns(warnsDB)
    await conn.sendMessage(m.chat, { text: '🧹 Todas las advertencias a administradores han sido eliminadas.' })
  }
}

handler.command = [
  'admad','advertenciaadmin','alertadmin',
  'unadmad','quitaradvertenciaadmin',
  'listadmad','listaadmin','warnadmin',
  'clearadmad','limpiaradvertenciasadmin'
]
handler.tags = ['admin']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
