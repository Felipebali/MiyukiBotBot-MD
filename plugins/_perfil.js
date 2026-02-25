// 📂 plugins/perfil.js — PERFIL FelixCat 🐾 ZODIACO PRO + GENERO LIBRE

let handler = async (m, { conn, text, command }) => {
  try {

    const jid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    const username = jid.split('@')[0]

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

    let user = global.db.data.users[jid]

    if (m.isGroup && !user.joinGroup) {
      user.joinGroup = Date.now()
    }

    // =====================
    // OWNER
    // =====================

    const senderNumber = jid.replace(/[^0-9]/g, '')

    const ownerNumbers = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      return String(v).replace(/[^0-9]/g, '')
    })

    const isRealOwner = ownerNumbers.includes(senderNumber)

    // =====================
    // ADMIN
    // =====================

    let isAdmin = false

    if (m.isAdmin !== undefined) {
      isAdmin = m.isAdmin
    } else if (m.isGroup) {
      try {
        const meta = await conn.groupMetadata(m.chat)
        const participant = meta.participants.find(p =>
          (conn.decodeJid ? conn.decodeJid(p.id) : p.id) === jid
        )
        if (participant) {
          isAdmin =
            participant.admin === 'admin' ||
            participant.admin === 'superadmin'
        }
      } catch {}
    }

    // =====================
    // FUNCIONES FECHA
    // =====================

    const calcularEdad = (fecha) => {
      const [d, m, a] = fecha.split('/').map(Number)
      if (!d || !m || !a) return null
      const nacimiento = new Date(a, m - 1, d)
      const hoy = new Date()
      let edad = hoy.getFullYear() - nacimiento.getFullYear()
      const diff = hoy.getMonth() - nacimiento.getMonth()
      if (diff < 0 || (diff === 0 && hoy.getDate() < nacimiento.getDate()))
        edad--
      return edad
    }

    const diasParaCumple = (fecha) => {
      const [d, m] = fecha.split('/').map(Number)
      if (!d || !m) return null
      const hoy = new Date()
      let cumple = new Date(hoy.getFullYear(), m - 1, d)
      if (cumple < hoy) cumple.setFullYear(hoy.getFullYear() + 1)
      return Math.ceil((cumple - hoy) / 86400000)
    }

    // =====================
    // SIGNO ZODIACAL
    // =====================

    const obtenerZodiaco = (fecha) => {
      const [d, m] = fecha.split('/').map(Number)
      if (!d || !m) return null

      const signos = [
        { nombre: 'Capricornio ♑', elemento: '🌍 Tierra', personalidad: 'Ambicioso, disciplinado y responsable.' },
        { nombre: 'Acuario ♒', elemento: '🌪️ Aire', personalidad: 'Original, independiente y visionario.' },
        { nombre: 'Piscis ♓', elemento: '💧 Agua', personalidad: 'Empático, sensible y creativo.' },
        { nombre: 'Aries ♈', elemento: '🔥 Fuego', personalidad: 'Valiente, impulsivo y líder natural.' },
        { nombre: 'Tauro ♉', elemento: '🌍 Tierra', personalidad: 'Paciente, leal y perseverante.' },
        { nombre: 'Géminis ♊', elemento: '🌪️ Aire', personalidad: 'Comunicativo, curioso y adaptable.' },
        { nombre: 'Cáncer ♋', elemento: '💧 Agua', personalidad: 'Protector, emocional y familiar.' },
        { nombre: 'Leo ♌', elemento: '🔥 Fuego', personalidad: 'Carismático, orgulloso y creativo.' },
        { nombre: 'Virgo ♍', elemento: '🌍 Tierra', personalidad: 'Analítico, perfeccionista y servicial.' },
        { nombre: 'Libra ♎', elemento: '🌪️ Aire', personalidad: 'Equilibrado, sociable y diplomático.' },
        { nombre: 'Escorpio ♏', elemento: '💧 Agua', personalidad: 'Intenso, apasionado y misterioso.' },
        { nombre: 'Sagitario ♐', elemento: '🔥 Fuego', personalidad: 'Aventurero, optimista y sincero.' }
      ]

      let index = 0

      if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) index = 1
      else if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) index = 2
      else if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) index = 3
      else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) index = 4
      else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) index = 5
      else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) index = 6
      else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) index = 7
      else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) index = 8
      else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) index = 9
      else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) index = 10
      else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) index = 11
      else index = 0

      return signos[index]
    }

    // =====================
    // TARGET
    // =====================

    const getTarget = () => {
      if (m.mentionedJid && m.mentionedJid.length) return m.mentionedJid[0]
      if (m.quoted && m.quoted.sender) return m.quoted.sender
      return null
    }

    // =====================
    // COMANDOS
    // =====================

    if (command === 'setbr') {
      if (!text) return m.reply('✏️ Uso:\n.setbr 31/12/1998')
      user.birth = text.trim()
      return m.reply('✅ Fecha guardada.')
    }

    if (command === 'bio') {
      if (!text) return m.reply('✏️ Uso:\n.bio texto')
      user.bio = text.trim()
      return m.reply('✅ Bio guardada.')
    }

    if (command === 'genero') {
      if (!text) return m.reply('✏️ Escribe tu género')
      user.genero = text.trim()
      return m.reply(`✅ Género guardado:\n${user.genero}`)
    }

    // =====================
    // OTORGAR INSIGNIA
    // =====================

    if (command === 'otorgar') {

      if (!isRealOwner) return m.reply('❌ Solo los dueños.')

      const target = getTarget()
      if (!target) return m.reply('✏️ Menciona usuario.')

      const nombre = text.replace(/@\d+/g, '').trim()
      if (!nombre) return m.reply('✏️ Escribe insignia.')

      if (!global.db.data.users[target])
        global.db.data.users[target] = { insignias: [] }

      let tu = global.db.data.users[target]

      if (!tu.insignias) tu.insignias = []

      if (!tu.insignias.includes(nombre))
        tu.insignias.push(nombre)

      return conn.reply(
        m.chat,
        `🏅 Insignia otorgada\n👤 @${target.split('@')[0]}\n🎖️ ${nombre}`,
        m,
        { mentions: [target] }
      )
    }

    // =====================
    // 🔥 QUITAR INSIGNIAS (MEJORADO)
    // =====================

    if (command === 'quitar') {

      if (!isRealOwner) return m.reply('❌ Solo los dueños.')

      const target = getTarget()
      if (!target) return m.reply('✏️ Menciona usuario.')

      if (!global.db.data.users[target])
        return m.reply('❌ Usuario sin datos.')

      let tu = global.db.data.users[target]

      if (!tu.insignias || !tu.insignias.length)
        return m.reply('❌ No tiene insignias.')

      const antes = tu.insignias.join(', ')

      tu.insignias = []

      return conn.reply(
        m.chat,
`🗑️ *Insignias eliminadas*

👤 @${target.split('@')[0]}
🏅 Antes tenía:
${antes}`,
        m,
        { mentions: [target] }
      )
    }

    // =====================
    // VER INSIGNIAS
    // =====================

    if (command === 'verinsignias') {

      if (!isRealOwner) return m.reply('❌ Solo los dueños.')

      let lista = []
      let mentions = []

      for (let id in global.db.data.users) {
        let u = global.db.data.users[id]
        if (u.insignias?.length) {
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

    // =====================
    // PERFIL
    // =====================

    if (command === 'perfil') {

      const nacimiento = user.birth || 'No registrado'
      const bio = user.bio || 'Sin biografía'
      const genero = user.genero || 'No definido'

      const edad = user.birth ? calcularEdad(user.birth) : null
      const edadTexto = edad !== null ? edad + ' años' : 'No disponible'

      const dias = user.birth ? diasParaCumple(user.birth) : null
      let cumpleTexto = dias !== null
        ? (dias <= 0 ? '🎉 Hoy' : `⏳ ${dias} días`)
        : 'No disponible'

      const zodiaco = user.birth ? obtenerZodiaco(user.birth) : null
      const signo = zodiaco?.nombre || 'No disponible'
      const elemento = zodiaco?.elemento || 'No disponible'
      const personalidad = zodiaco?.personalidad || 'No disponible'

      let insignias = []

      if (isRealOwner) insignias.push('👑 Dueño')
      else if (isAdmin) insignias.push('🛡️ Admin')

      if (user.insignias?.length)
        insignias.push(...user.insignias)

      if (!insignias.length) insignias.push('Ninguna')

      let rol = 'Usuario 👤'
      if (isRealOwner) rol = 'Dueño 👑'
      else if (isAdmin) rol = 'Admin 🛡️'

      let ingresoTexto = 'No disponible'

      if (user.joinGroup) {
        const ingreso = new Date(user.joinGroup)
        const hoy = new Date()
        const diasGrupo = Math.floor((hoy - ingreso) / 86400000)
        ingresoTexto = `${ingreso.toLocaleDateString()} (${diasGrupo} días)`
      }

      const txt = `
👤 *PERFIL DE USUARIO*

🆔 @${username}
⭐ Rol: ${rol}

🏅 Insignias:
${insignias.join('\n')}

🚻 Género: ${genero}

🎂 Nacimiento: ${nacimiento}
♑ Signo: ${signo}
🌌 Elemento: ${elemento}
🧠 Personalidad: ${personalidad}

🎉 Edad: ${edadTexto}
🎂 Cumple en: ${cumpleTexto}

📥 Ingreso: ${ingresoTexto}

📝 Bio: ${bio}
`.trim()

      let pp = null
      try {
        pp = await conn.profilePictureUrl(jid, 'image')
      } catch {}

      await conn.sendMessage(
        m.chat,
        pp
          ? { image: { url: pp }, caption: txt, mentions: [jid] }
          : { text: txt, mentions: [jid] },
        { quoted: m }
      )
    }

  } catch (e) {
    console.error(e)
  }
}

handler.command = [
  'perfil',
  'setbr',
  'bio',
  'genero',
  'otorgar',
  'quitar',
  'verinsignias'
]

export default handler
