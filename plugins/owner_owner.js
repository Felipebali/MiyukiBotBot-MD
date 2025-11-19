// 📂 plugins/owner-info.js — FelixCat-Bot 🐾
// Detecta si el usuario citado o mencionado es owner o no, y responde con menciones clickeables.

const ownerData = {
  '59898719147@s.whatsapp.net': {
    nombre: 'Feli',
    rango: '👑 Comandante Supremo',
    lema: '“Desde las sombras, gobierna el caos con estilo.”'
  },
  '59896026646@s.whatsapp.net': {
    nombre: 'G',
    rango: '⚔️ Mariscal General',
    lema: '“Disciplina, poder y control en cada mensaje.”'
  },
  '59892363485@s.whatsapp.net': {
    nombre: 'Brayan',
    rango: '🛡️ Capitán Estratégico',
    lema: '“Planear antes de actuar es la clave del dominio.”'
  }
};

// 🌟 Frases generales
const frases = [
  '🪖 El poder no se otorga, se conquista.',
  '💫 Los dueños mantienen el orden del reino digital.',
  '🔥 En su presencia, hasta los bits se alinean.',
  '⚡ Nadie escapa del juicio de los Comandantes.',
  '👁️ La autoridad suprema vigila cada mensaje.',
  '📜 Sus decisiones son ley dentro del grupo.',
  '🚀 Desde lo alto del trono, gobiernan con precisión.'
];

// 😂 Frases para no dueños
const frasesNoOwner = [
  '😹 Este no tiene rango, apenas sobrevive en el grupo.',
  '🐾 No es dueño... pero algún día, quién sabe 😼',
  '🎭 Finge poder, pero el bot ni lo registra 😹',
  '💤 Usuario común detectado. Sin autoridad gatuna.',
  '🦴 Solo los elegidos tienen rango, este no 😼'
];

let handler = async (m, { conn }) => {
  try {
    const sender = m.sender;
    const quoted = m.quoted ? m.quoted.sender : null;
    const mentioned = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
    const target = quoted || mentioned || sender; // prioridad: citado > mencionado > quien usa

    const numero = target.split('@')[0];
    const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
    const fraseNoOwner = frasesNoOwner[Math.floor(Math.random() * frasesNoOwner.length)];
    const ownerNumbers = Object.keys(ownerData);

    // ✅ Si el target es un dueño
    if (ownerData[target]) {
      const data = ownerData[target];
      const texto = `👑 *FICHA DE DUEÑO DEL BOT* 👑\n\n` +
        `📱 *Número:* +${numero}\n` +
        `🧩 *Nombre:* @${numero}\n` +
        `🥇 *Rango:* ${data.rango}\n` +
        `💬 *Lema:* ${data.lema}\n\n` +
        `⚡ "${fraseAleatoria}"`;

      await conn.sendMessage(m.chat, {
        text: texto,
        mentions: [target]
      }, { quoted: m });
      return;
    }

    // 🚫 Si no es dueño
    if (quoted || mentioned) {
      const texto = `🙃 @${numero} *no es dueño del bot.*\n\n${fraseNoOwner}`;
      await conn.sendMessage(m.chat, {
        text: texto,
        mentions: [target]
      }, { quoted: m });
      return;
    }

    // 👥 Si no cita ni menciona → muestra todos los dueños
    let texto = `👑 *INFORMACIÓN DE LOS DUEÑOS DEL BOT* 👑\n\n`;
    let mentions = [];

    for (const id of ownerNumbers) {
      const data = ownerData[id];
      const numero = id.split('@')[0];
      texto += `📱 *Número:* +${numero}\n`;
      texto += `🧩 *Nombre:* @${numero}\n`;
      texto += `🥇 *Rango:* ${data.rango}\n`;
      texto += `💬 *Lema:* ${data.lema}\n\n`;
      mentions.push(id);
    }

    texto += `💫 "${fraseAleatoria}"`;

    await conn.sendMessage(m.chat, {
      text: texto,
      mentions
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al mostrar la información del dueño.');
  }
};

handler.command = ['owner', 'dueño'];
handler.help = ['owner'];
handler.tags = ['info'];
handler.group = false;

export default handler;
