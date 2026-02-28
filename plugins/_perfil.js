// 📂 plugins/perfil.js — PERFIL FelixCat 🐾

let handler = async (m, { conn, text, command }) => {
  try {

    // =====================
    // NORMALIZAR SENDER
    // =====================

    const jid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender

    // =====================
    // DATABASE
    // =====================

    if (!global.db.data) global.db.data = {}
    if (!global.db.data.users) global.db.data.users = {}

    if (!global.db.data.users[jid]) {
      global.db.data.users[jid] = {
        registered: Date.now(),
        joinGroup: null,
        insignias: [],
        genero: null,
        birth: null,
        bio: null
      }
    }

    // =====================
    // OWNER SYSTEM
    // =====================

    const senderNumber = jid.replace(/[^0-9]/g, '')

    const ownerNumbers = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      return String(v).replace(/[^0-9]/g, '')
    })

    const isRealOwner = ownerNumbers.includes(senderNumber)

    // =====================
    // OBTENER TARGET
    // =====================

    const getTarget = () => {
      if (m.mentionedJid?.length) return m.mentionedJid[0]
      if (m.quoted?.sender) return m.quoted.sender
      return null
    }

    // =====================
    // OTORGAR INSIGNIA
    // =====================

    if (command === 'otorgar') {

      if (!isRealOwner)
        return m.reply('❌ Solo los dueños pueden otorgar insignias.')

      let target = getTarget()
      if (!target)
        return m.reply('⚠️ Menciona o responde al usuario.')

      // 🔥 NORMALIZAR TARGET
      target = conn.decodeJid ? conn.decodeJid(target) : target

      if (!text)
        return m.reply('✏️ Escribe la insignia.\nEjemplo: .otorgar VIP @usuario')

      if (!global.db.data.users[target]) {
        global.db.data.users[target] = {
          registered: Date.now(),
          insignias: [],
          genero: null,
          birth: null,
          bio: null
        }
      }

      let userTarget = global.db.data.users[target]

      if (!Array.isArray(userTarget.insignias))
        userTarget.insignias = []

      if (userTarget.insignias.includes(text))
        return m.reply('⚠️ Ese usuario ya tiene esa insignia.')

      userTarget.insignias.push(text)

      return conn.reply(
        m.chat,
        `🏅 Insignia otorgada a @${target.split('@')[0]}\n✨ Nueva insignia: ${text}`,
        m,
        { mentions: [target] }
      )
    }

    // =====================
    // QUITAR TODAS LAS INSIGNIAS
    // =====================

    if (command === 'quitar') {

      if (!isRealOwner)
        return m.reply('❌ Solo los dueños pueden quitar insignias.')

      let target = getTarget()
      if (!target)
        return m.reply('⚠️ Menciona o responde al usuario.')

      // 🔥 NORMALIZAR TARGET
      target = conn.decodeJid ? conn.decodeJid(target) : target

      if (!global.db.data.users[target])
        return m.reply('❌ Ese usuario no está registrado.')

      let userTarget = global.db.data.users[target]

      if (!Array.isArray(userTarget.insignias) || !userTarget.insignias.length)
        return m.reply('❌ Ese usuario no tiene insignias.')

      const cantidad = userTarget.insignias.length

      // Vaciar todas
      userTarget.insignias = []

      return conn.reply(
        m.chat,
        `🗑️ Se eliminaron ${cantidad} insignias de @${target.split('@')[0]}`,
        m,
        { mentions: [target] }
      )
    }

    // =====================
    // VER INSIGNIAS
    // =====================

    if (command === 'insignias') {

      if (!isRealOwner)
        return m.reply('❌ Solo los dueños.')

      let lista = []
      let mentions = []

      for (let id in global.db.data.users) {
        let u = global.db.data.users[id]
        if (Array.isArray(u.insignias) && u.insignias.length) {
          lista.push(`👤 @${id.split('@')[0]}\n🏅 ${u.insignias.join(', ')}`)
          mentions.push(id)
        }
      }

      if (!lista.length)
        return m.reply('❌ Nadie tiene insignias.')

      return conn.reply(
        m.chat,
        `🏅 *USUARIOS CON INSIGNIAS*\n\n${lista.join('\n\n')}`,
        m,
        { mentions }
      )
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Ocurrió un error.')
  }
}

handler.command = [
  'perfil',
  'setbr',
  'bio',
  'genero',
  'otorgar',
  'quitar',
  'insignias'
]

export default handler
