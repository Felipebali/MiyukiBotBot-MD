// 🧩 plugins/_group-log.js — FelixCat_Bot 🐾
// Notifica cambios de nombre, descripción o foto del grupo con mención a admins y dueños

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']

let handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {}
  chat.logGrupo = !chat.logGrupo
  global.db.data.chats[m.chat] = chat

  const estado = chat.logGrupo ? '✅ *Log de cambios activado.*' : '❌ *Log de cambios desactivado.*'
  await conn.sendMessage(m.chat, { text: `${estado}\nUsa *.loggrupo* para alternar.` }, { quoted: m })

  if (!conn._escuchaGrupo) registrarEscucha(conn)
}

handler.help = ['loggrupo']
handler.tags = ['group']
handler.command = /^loggrupo$/i
handler.group = true
handler.admin = true
export default handler

// ───────────────────────────────────────────────
// 🧠 REGISTRO DE ESCUCHA DE EVENTOS
function registrarEscucha(conn) {
  conn._escuchaGrupo = true
  const cache = {}

  conn.ev.on('groups.update', async (updates) => {
    for (const update of updates) {
      const id = update.id
      const chat = global.db.data.chats[id] || {}
      if (!chat.logGrupo) continue

      if (!cache[id]) cache[id] = {}
      const antes = cache[id]
      const cambios = []
      let nuevaFoto = null

      // 📸 FOTO DE PERFIL CAMBIADA
      if (update.icon) {
        try {
          nuevaFoto = await conn.profilePictureUrl(id, 'image').catch(() => null)
        } catch {}
        cambios.push('🖼️ *Se cambió la foto del grupo.*')
        antes.icon = update.icon
      }

      // 📝 NOMBRE DEL GRUPO CAMBIADO
      if (update.subject && update.subject !== antes.subject) {
        cambios.push(`✏️ *Nombre cambiado a:* ${update.subject}`)
        antes.subject = update.subject
      }

      // 💬 DESCRIPCIÓN DEL GRUPO CAMBIADA
      if (Object.prototype.hasOwnProperty.call(update, 'desc') && update.desc !== antes.desc) {
        const nuevaDesc = update.desc || 'vacía'
        cambios.push(`💬 *Descripción cambiada a:* ${nuevaDesc}`)
        antes.desc = update.desc
      }

      if (cambios.length === 0) continue

      // 📋 METADATOS DEL GRUPO
      const meta = await conn.groupMetadata(id)
      const participantes = meta.participants

      const admins = participantes.filter(p => p.admin)
      const dueños = participantes.filter(p => ownerNumbers.includes(p.id))
      const todosAdmins = [...new Set([...admins, ...dueños])]
      const menciones = todosAdmins.map(p => p.id)

      // 🧾 TEXTO FINAL
      let texto = `📢 *Log de cambios del grupo:*\n\n${cambios.join('\n')}\n\n`
      texto += `👥 *Administradores notificados:*\n${todosAdmins.map(p => `@${p.id.split('@')[0]}`).join(' ')}`

      if (nuevaFoto) {
        await conn.sendMessage(id, { image: { url: nuevaFoto }, caption: texto, mentions: menciones })
      } else {
        await conn.sendMessage(id, { text: texto, mentions: menciones })
      }
    }
  })
}
