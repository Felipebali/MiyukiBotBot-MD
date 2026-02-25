// 📂 plugins/admin-alert.js — FELI 2026 — ALERTAS PARA ADMINS 🔥

import fs from 'fs'
import path from 'path'

const DATABASE_DIR = './database'
const ALERT_FILE = path.join(DATABASE_DIR, 'admin_alerts.json')

// Crear carpeta y archivo si no existen
if (!fs.existsSync(DATABASE_DIR)) fs.mkdirSync(DATABASE_DIR, { recursive: true })
if (!fs.existsSync(ALERT_FILE)) fs.writeFileSync(ALERT_FILE, JSON.stringify({}))

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function normalizeJid(jid = '') {
  if (!jid) return null
  jid = jid.toString().trim().replace(/^\+/, '')
  if (jid.endsWith('@c.us')) return jid.replace('@c.us', '@s.whatsapp.net')
  if (jid.endsWith('@s.whatsapp.net')) return jid
  if (jid.includes('@')) return jid
  const cleaned = jid.replace(/[^0-9]/g, '')
  if (!cleaned) return null
  return cleaned + '@s.whatsapp.net'
}

function readAlerts() {
  try { return JSON.parse(fs.readFileSync(ALERT_FILE)) } 
  catch { return {} }
}

function writeAlerts(data) { fs.writeFileSync(ALERT_FILE, JSON.stringify(data, null, 2)) }

// ================= HANDLER =================
const handler = async (m, { conn, command, text }) => {
  if (!m.isGroup) return
  const meta = await conn.groupMetadata(m.chat)
  const participants = meta.participants

  // Solo admins pueden usar
  const isAdmin = participants.some(p => p.id === m.sender && p.admin)
  if (!isAdmin) return conn.reply(m.chat, '⚠️ Solo administradores pueden usar este comando.', m)

  const ICON = { alert: '⚠️', ok: '✅' }
  const SEP = '━━━━━━━━━━━━━━━━━━━━'
  const dbAlerts = readAlerts()

  // Determinar admin objetivo
  let targetJid = null
  if (m.mentionedJid?.length) targetJid = normalizeJid(m.mentionedJid[0])
  else if (m.quoted) targetJid = normalizeJid(m.quoted.sender || m.quoted.participant)
  if (!targetJid) return conn.reply(m.chat, `${ICON.alert} Debes mencionar o responder a un administrador.`, m)

  // Verificar que el usuario sea admin
  const targetAdmin = participants.find(p => p.id === targetJid)
  if (!targetAdmin?.admin) return conn.reply(m.chat, '⚠️ Solo puedes alertar a administradores.', m)

  if (!dbAlerts[m.chat]) dbAlerts[m.chat] = {}
  if (!dbAlerts[m.chat][targetJid]) dbAlerts[m.chat][targetJid] = { count: 0, reasons: [] }

  const reason = text?.trim() || 'No especificado'

  // ================= DAR ALERTA =================
  if (command === 'alerta') {
    dbAlerts[m.chat][targetJid].count += 1
    dbAlerts[m.chat][targetJid].reasons.push({ reason, by: m.sender, date: new Date().toISOString() })
    writeAlerts(dbAlerts)

    let msg = `${ICON.alert} *ALERTA A ADMIN*\n${SEP}\n👤 @${targetJid.split('@')[0]}\n📝 Motivo: ${reason}\n⚠️ Total: ${dbAlerts[m.chat][targetJid].count}`

    // ================= QUITAR ADMIN A LA 3ª ALERTA =================
    if (dbAlerts[m.chat][targetJid].count >= 3) {
      await conn.groupParticipantsUpdate(m.chat, [targetJid], 'demote')
      msg += `\n❌ *Alcanzó 3 alertas — Rol de admin removido*`
      dbAlerts[m.chat][targetJid].count = 0
      dbAlerts[m.chat][targetJid].reasons = []
      writeAlerts(dbAlerts)
    }

    await conn.sendMessage(m.chat, { text: msg, mentions: [targetJid] })
  }

  // ================= QUITAR ALERTA =================
  else if (command === 'quitaralerta') {
    if (dbAlerts[m.chat][targetJid].count <= 0) return conn.reply(m.chat, `${ICON.alert} Este admin no tiene alertas.`, m)
    dbAlerts[m.chat][targetJid].count -= 1
    dbAlerts[m.chat][targetJid].reasons.pop()
    writeAlerts(dbAlerts)

    await conn.sendMessage(m.chat, {
      text: `${ICON.ok} *ALERTA ELIMINADA*\n${SEP}\n👤 @${targetJid.split('@')[0]}\n⚠️ Total: ${dbAlerts[m.chat][targetJid].count}`,
      mentions: [targetJid]
    })
  }

  // ================= VER ALERTAS =================
  else if (command === 'veralertas') {
    const alerts = dbAlerts[m.chat] || {}
    const entries = Object.entries(alerts)
    if (!entries.length) return conn.reply(m.chat, `${ICON.ok} No hay alertas en este grupo.`, m)

    let msg = `${ICON.alert} *ALERTAS DE ADMINS — ${entries.length}*\n${SEP}\n`
    const mentions = []

    entries.forEach(([jid, data], i) => {
      const adminCheck = participants.some(p => p.id === jid && p.admin)
      if (!adminCheck) return
      msg += `*${i + 1}.* 👤 @${jid.split('@')[0]}\n⚠️ Total: ${data.count}\n`
      mentions.push(jid)
    })

    msg += SEP
    await conn.sendMessage(m.chat, { text: msg.trim(), mentions })
  }

  // ================= LIMPIAR ALERTAS =================
  else if (command === 'limpiaralertas') {
    for (const jid in dbAlerts[m.chat]) dbAlerts[m.chat][jid] = { count: 0, reasons: [] }
    writeAlerts(dbAlerts)
    await conn.sendMessage(m.chat, { text: `${ICON.ok} *Todas las alertas de administradores han sido limpiadas*\n${SEP}` })
  }
}

// ================= CONFIG =================
handler.help = ['alerta','quitaralerta','veralertas','limpiaralertas']
handler.tags = ['admin']
handler.command = ['alerta','quitaralerta','veralertas','limpiaralertas']
handler.group = true
handler.rowner = false

console.log('✅ Plugin admin-alert cargado')

export default handler
