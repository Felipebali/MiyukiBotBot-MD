// 📂 plugins/tagall2.js — Mención oculta x4 con frases aleatorias 🌍
// SOLO ROOT OWNERS reales del bot

const frases = [
  '🌞 ¡Despierten, gatos dormilones!',
  '🔥 ¡Hora de mover el grupo!',
  '🎯 ¡Vamos equipo, que hoy rompemos todo!',
  '😼 FelixCat observa... ¡y quiere acción!',
  '🎉 ¡Buen día, mis cracks del grupo!',
  '🌙 ¿Quién sigue despierto a estas horas?',
  '🧠 ¡Hora de activar las neuronas!',
  '💬 ¡No se duerman, que el grupo se enfría!',
  '🎵 ¡Vamos a ponerle ritmo al chat!',
  '💪 ¡Fuerza, energía y memes nuevos!',
  '🚀 Wake up everyone, the fun is starting!',
  '🔥 Let’s shake the group up!',
  '💫 Coffee time, group warriors!',
  '🎮 Game mode ON!',
  '😎 Let’s make this chat alive again!',
  '💥 Levantem-se, guerreiros do grupo!',
  '🔥 Bora animar o chat!',
  '💫 Il est temps de briller, mes amis!',
  '🐾 Tutti pronti per l’action?',
  '💥 Aufwachen Leute, los geht’s!',
  '🌸 みんな、起きて！',
  '⚡ Все готовы к бою?',
  '🌺 깨어나세요, 친구들!',
  '🌼 大家好，准备开始吧！',
  '🌙 استيقظوا أيها الأبطال!',
  '🐱 FelixCat dice: ¡Hora de activarse!',
  '🎭 FelixCatBot: ¡Vamos a romper el silencio!',
  '💌 Mensaje secreto del gato: ¡Muevan el grupo!',
  '📡 Señal interestelar: ¡Despierten humanos!',
  '🔔 Campanita mágica: ¡Hora de socializar!',
  '🧩 FelixCatBot reinicia el grupo... ¡modo locura ON!',
  '🚨 Atención felinos: reunión urgente en el chat 🐾',
  '💫 El universo conspira... ¡para que mandes un mensaje!',
  '🦊 FoxMode activado: ¡Despierten todos!',
  '👽 Alien Alert: el grupo necesita actividad inmediata!'
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

let handler = async (m, { conn, isBotAdmin }) => {
  try {
    if (!m.isGroup) return
    if (!isBotAdmin) return

    // 🔐 ROOT OWNERS reales desde config.js (blindado)
    const owners = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string' && typeof v !== 'number') return null
      return String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }).filter(Boolean)

    const sender = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    if (!owners.includes(sender)) return

    const groupMetadata = await conn.groupMetadata(m.chat)
    const members = groupMetadata.participants
      .map(u => (conn.decodeJid ? conn.decodeJid(u.id) : u.id))
      .filter(v => v && v !== conn.user.jid)

    if (!members.length) return

    const hidden = '\u200B'.repeat(500)

    for (let i = 0; i < 4; i++) {
      const frase = frases[Math.floor(Math.random() * frases.length)]
      await conn.sendMessage(m.chat, {
        text: `${frase}\n${hidden}`,
        mentions: members
      })
      await sleep(1500)
    }

  } catch (e) {
    console.error('Error en tagall2:', e)
  }
}

handler.command = ['tagall2']
handler.group = true
handler.tags = ['owner']

export default handler
