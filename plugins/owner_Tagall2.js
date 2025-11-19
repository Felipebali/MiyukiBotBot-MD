// 📢 tagall2.js — Mención oculta x4 con frases aleatorias 🌍 (solo owners)

const owners = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net', '59892363485@s.whatsapp.net'];

// 🌐 Frases aleatorias (multiidioma y divertidas)
const frases = [
  // 🐱 Español
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
  
  // 🇺🇸 English
  '🚀 Wake up everyone, the fun is starting!',
  '🔥 Let’s shake the group up!',
  '💫 Coffee time, group warriors!',
  '🎮 Game mode ON!',
  '😎 Let’s make this chat alive again!',
  '💥 Rise and shine, legends!',
  '🪩 Party’s here, no excuses!',
  
  // 🇧🇷 Portugués
  '💥 Levantem-se, guerreiros do grupo!',
  '🔥 Bora animar o chat!',
  '🌈 Bom dia, tropa!',
  '🎶 Vamos agitar isso aqui!',
  
  // 🇫🇷 Francés
  '💫 Il est temps de briller, mes amis!',
  '🎉 Réveillez-vous, le groupe a besoin de vous!',
  '🔥 On bouge, la team!',
  
  // 🇮🇹 Italiano
  '🐾 Tutti pronti per l’azione?',
  '🌟 È ora di svegliarsi, amici!',
  '🎯 Forza ragazzi, si riparte!',
  
  // 🇩🇪 Alemán
  '💥 Aufwachen Leute, los geht’s!',
  '🔥 Energie! Heute wird legendär!',
  
  // 🇯🇵 Japonés
  '🌸 みんな、起きて！',
  '💥 グループを盛り上げよう！',
  
  // 🇷🇺 Ruso
  '⚡ Все готовы к бою?',
  '🔥 Время просыпаться, друзья!',
  
  // 🇰🇷 Coreano
  '🌺 깨어나세요, 친구들!',
  '💫 이 그룹이 다시 빛날 시간이에요!',
  
  // 🇨🇳 Chino
  '🌼 大家好，准备开始吧！',
  '💥 该醒来了，朋友们！',
  
  // 🇸🇦 Árabe
  '🌙 استيقظوا أيها الأبطال!',
  '🔥 حان وقت النشاط يا أصدقاء!',
  
  // 😸 Personalizadas
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
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let handler = async (m, { conn, isBotAdmin }) => {
  try {
    // 📋 Solo en grupos
    if (!m.isGroup) return;

    // 🔒 Solo owners
    const sender = m.sender;
    if (!owners.includes(sender)) return;

    // ⚙️ Verificar permisos
    if (!isBotAdmin) return conn.sendMessage(m.chat, { text: '🤖 Necesito ser administrador para mencionar a todos.' });

    // 📜 Obtener participantes
    const groupMetadata = await conn.groupMetadata(m.chat);
    const members = groupMetadata.participants.map(u => u.id).filter(v => v !== conn.user.jid);

    if (!members.length) return;

    // 🔕 Texto invisible (mención oculta)
    const hidden = '\u200B'.repeat(500);

    // 🔁 Enviar 4 veces con frases distintas
    for (let i = 0; i < 4; i++) {
      const frase = frases[Math.floor(Math.random() * frases.length)];
      const text = `${frase}\n${hidden}`;

      await conn.sendMessage(
        m.chat,
        { text, mentions: members },
        { quoted: null } // ❌ No responde al comando
      );

      await sleep(1500);
    }

  } catch (e) {
    console.error('Error en tagall2:', e);
  }
};

handler.help = ['tagall2'];
handler.tags = ['owner', 'group'];
handler.command = /^tagall2$/i;
handler.group = true;

export default handler;
