import fs from 'fs'

const ownerFile = './database/owner.json'

// Crear archivo si no existe
if (!fs.existsSync(ownerFile)) {
  fs.writeFileSync(ownerFile, JSON.stringify({
    rowner: ['59898719147@s.whatsapp.net'],
    owner: []
  }, null, 2))
}

const loadOwner = () => JSON.parse(fs.readFileSync(ownerFile))
const saveOwner = (data) => fs.writeFileSync(ownerFile, JSON.stringify(data, null, 2))

let handler = async (m, { conn, command }) => {

  const sender = m.sender
  const owners = loadOwner()

  const isRowner = owners.rowner.includes(sender)
  const isOwner = owners.owner.includes(sender)
  const isAnyOwner = isRowner || isOwner

  // =========================
  // 🛡 AGREGAR OWNER
  // =========================
  if (command === 'adowner') {

    if (!isRowner)
      return m.reply('❌ Solo el Root Owner puede agregar owners.')

    const target = m.mentionedJid?.[0] || m.quoted?.sender
    if (!target)
      return m.reply('⚠️ Menciona o responde al usuario.')

    if (owners.owner.includes(target))
      return m.reply('⚠️ Ya es owner.')

    owners.owner.push(target)
    saveOwner(owners)

    return conn.reply(
      m.chat,
      `🛡 Nuevo Owner agregado:\n@${target.split('@')[0]}`,
      m,
      { mentions: [target] }
    )
  }

  // =========================
  // 👑 ELIMINAR OWNER
  // =========================
  if (command === 'rowner') {

    if (!isRowner)
      return m.reply('❌ Solo el Root Owner puede quitar owners.')

    const target = m.mentionedJid?.[0] || m.quoted?.sender
    if (!target)
      return m.reply('⚠️ Menciona o responde al usuario.')

    if (!owners.owner.includes(target))
      return m.reply('⚠️ Ese usuario no es owner.')

    owners.owner = owners.owner.filter(v => v !== target)
    saveOwner(owners)

    return conn.reply(
      m.chat,
      `👑 Owner eliminado:\n@${target.split('@')[0]}`,
      m,
      { mentions: [target] }
    )
  }

  // =========================
  // 📜 LISTAR OWNERS
  // =========================
  if (command === 'listowner') {

    if (!isAnyOwner)
      return m.reply('❌ Solo owner.')

    let texto = '👑 *Lista de Owners*\n\n'

    texto += '🛡 Root Owner:\n'
    owners.rowner.forEach(v => {
      texto += `- @${v.split('@')[0]}\n`
    })

    texto += '\n👤 Owners:\n'
    if (!owners.owner.length) {
      texto += 'Sin owners secundarios.\n'
    } else {
      owners.owner.forEach(v => {
        texto += `- @${v.split('@')[0]}\n`
      })
    }

    return conn.reply(
      m.chat,
      texto.trim(),
      m,
      { mentions: [...owners.rowner, ...owners.owner] }
    )
  }
}

handler.command = ['adowner', 'rowner', 'listowner']

export default handler
