// 📂 plugins/propietario-listanegra.js — FELI 2026 — BLACKLIST JSON 🔥
import fs from 'fs'
import path from 'path'

const DATABASE_DIR = './database'
const BLACKLIST_FILE = path.join(DATABASE_DIR, 'blacklist.json')

// 🔹 Crear carpeta si no existe
if (!fs.existsSync(DATABASE_DIR)) fs.mkdirSync(DATABASE_DIR, { recursive: true })
if (!fs.existsSync(BLACKLIST_FILE)) fs.writeFileSync(BLACKLIST_FILE, JSON.stringify({}))

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ================= UTILIDADES =================
function digitsOnly(text = '') { return text.toString().replace(/[^0-9]/g, '') }
function normalizeJid(jid = '') { 
  if (!jid) return null
  const d = digitsOnly(jid)
  if (!d) return null
  return d + '@s.whatsapp.net' 
}
function extractPhoneNumber(text = '') {
  const d = digitsOnly(text)
  if (!d || d.length < 5) return null
  return d
}
function findParticipantByDigits(metadata, digits) {
  return metadata.participants.find(p => {
    const pd = digitsOnly(p.id)
    return pd === digits || pd.endsWith(digits)
  })
}

// ================= BASE DE DATOS =================
function readBlacklist() {
  try { return JSON.parse(fs.readFileSync(BLACKLIST_FILE)) } 
  catch { return {} }
}
function writeBlacklist(data) { fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(data, null, 2)) }

// =====================================================
// ================= HANDLER PRINCIPAL =================
const handler = async (m, { conn, command, text }) => {
  const SEP = '━━━━━━━━━━━━━━━━━━━━'
  const ICON = { ban:'🚫', ok:'✅', warn:'⚠️', alert:'🚨' }
  const dbUsers = readBlacklist()

  if (command==='ln') await m.react('🚫')
  if (command==='unln') await m.react('🕊️')
  if (command==='vln') await m.react('📋')
  if (command==='clrn') await m.react('🧹')

  const bannedList = Object.entries(dbUsers).filter(([_, d])=>d.banned)
  let userJid = null
  let reason = text?.replace(/@/g,'').replace(/\d{5,}/g,'').trim() || 'No especificado'

  // ================= DETERMINAR USUARIO =================
  if (command==='unln' && /^\d+$/.test(text?.trim())) {
    const index = parseInt(text.trim())-1
    if (!bannedList[index]) { await m.react('❌'); return conn.reply(m.chat, `${ICON.ban} Número inválido.`, m) }
    userJid = bannedList[index][0]
  } else if (m.quoted) userJid = m.quoted.sender || m.quoted.participant
  else if (m.mentionedJid?.length) userJid = m.mentionedJid[0]
  else if (text) { 
    const num = extractPhoneNumber(text)
    if(num) userJid = normalizeJid(num) 
  }

  if (!userJid && !['vln','clrn'].includes(command)) { 
    await m.react('❌'); 
    return conn.reply(m.chat, `${ICON.warn} Debes responder, mencionar o usar índice.`, m) 
  }

  // ================= AGREGAR NOMBRE REAL =================
  if (userJid && !dbUsers[userJid]) {
    let name = userJid.split('@')[0] // por defecto número
    if (m.isGroup) {
      try {
        const meta = await conn.groupMetadata(m.chat)
        const participant = meta.participants.find(p => p.id === userJid)
        if (participant) name = participant.notify || name
      } catch {}
    }
    dbUsers[userJid] = { name }
  }

  // ================= AGREGAR A LISTA NEGRA =================
  if (command==='ln') {
    dbUsers[userJid].banned = true
    dbUsers[userJid].reason = reason
    dbUsers[userJid].addedBy = m.sender
    writeBlacklist(dbUsers)

    // auto-kick en todos los grupos
    try {
      const groups = Object.keys(await conn.groupFetchAllParticipating())
      for(const jid of groups){
        await sleep(800)
        try{
          const meta = await conn.groupMetadata(jid)
          const participant = meta.participants.find(p => p.id === userJid)
          if(!participant) continue

          await conn.groupParticipantsUpdate(jid, [participant.id], 'remove')
          await sleep(700)
          await conn.sendMessage(jid,{
            text:`${ICON.ban} *USUARIO BLOQUEADO — LISTA NEGRA*\n${SEP}\n👤 @${participant.notify || participant.id.split('@')[0]}\n📝 *Motivo:* ${reason}\n🚷 *Expulsión automática*\n${SEP}`,
            mentions:[participant.id]
          })
        } catch {}
      }
    } catch {}
  }

  // ================= REMOVER DE LISTA NEGRA =================
  else if(command==='unln'){
    if(!dbUsers[userJid]?.banned){ 
      await m.react('❌'); 
      return conn.reply(m.chat, `${ICON.ban} No está en la lista negra.`, m) 
    }
    dbUsers[userJid].banned = false
    writeBlacklist(dbUsers)
    await conn.sendMessage(m.chat,{
      text:`${ICON.ok} *USUARIO LIBERADO*\n${SEP}\n👤 @${dbUsers[userJid].name}\n${SEP}`,
      mentions:[userJid]
    })
  }

  // ================= LISTAR =================
  else if(command==='vln'){
    if(!bannedList.length) return conn.reply(m.chat, `${ICON.ok} Lista negra vacía.`, m)
    let msg = `${ICON.ban} *LISTA NEGRA — ${bannedList.length} USUARIOS*\n${SEP}\n`
    const mentions=[]
    bannedList.forEach(([jid, info], i)=>{ 
      msg += `*${i+1}.* 👤 @${info.name}\n📝 ${info.reason}\n\n`
      mentions.push(jid)
    })
    msg += SEP
    await conn.sendMessage(m.chat,{text:msg.trim(),mentions})
  }

  // ================= LIMPIAR =================
  else if(command==='clrn'){
    for(const d in dbUsers) dbUsers[d].banned = false
    writeBlacklist(dbUsers)
    await conn.sendMessage(m.chat,{text:`${ICON.ok} *LISTA NEGRA VACIADA*\n${SEP}`})
  }
}

// =====================================================
// ================= AUTO-KICK SI HABLA =================
handler.all = async function(m){
  try{
    if(!m.isGroup) return
    const sender = m.sender
    const dbUsers = readBlacklist()
    if(!dbUsers[sender]?.banned) return

    const meta = await this.groupMetadata(m.chat)
    const participant = meta.participants.find(p => p.id === sender)
    if(!participant) return

    await this.groupParticipantsUpdate(m.chat, [participant.id], 'remove')
    await sleep(700)
    await this.sendMessage(m.chat,{
      text:`🚫 *USUARIO BLOQUEADO — LISTA NEGRA*\n━━━━━━━━━━━━━━━━━━━━\n👤 @${participant.notify || participant.id.split('@')[0]}\n🚷 *Expulsión automática*\n━━━━━━━━━━━━━━━━━━━━`,
      mentions:[participant.id]
    })
  }catch{}
}

// =====================================================
// ========== AUTO-KICK + AVISO AL ENTRAR =================
handler.before = async function(m){
  try{
    if(![27,31].includes(m.messageStubType)) return
    if(!m.isGroup) return
    const dbUsers = readBlacklist()
    const meta = await this.groupMetadata(m.chat)
    for(const u of m.messageStubParameters || []){
      const jid = u
      const data = dbUsers[jid]
      if(!data?.banned) continue
      const participant = meta.participants.find(p => p.id === jid)
      if(!participant) continue
      const reason = data.reason || 'No especificado'

      await this.groupParticipantsUpdate(m.chat,[participant.id],'remove')
      await sleep(700)
      await this.sendMessage(m.chat,{
        text:`🚨 *USUARIO EN LISTA NEGRA*\n━━━━━━━━━━━━━━━━━━━━\n👤 @${participant.notify || participant.id.split('@')[0]}\n📝 *Motivo:* ${reason}\n🚷 *Expulsión inmediata*\n━━━━━━━━━━━━━━━━━━━━`,
        mentions:[participant.id]
      })
    }
  }catch{}
}

// ================= CONFIG =================
handler.help=['ln','unln','vln','clrn']
handler.tags=['owner']
handler.command=['ln','unln','vln','clrn']
handler.rowner=true
export default handler
