// plugins/menuUser.js
const botname = global.botname || '😸 FelixCat-Bot 😸';
const creador = 'Felipe';
const versionBot = '10.5.0';

let tags = {
  'info': '🌀 INFO DEL BOT 🐱',
  'main': '📜 MENÚ FELINO 🐾',
  'game': '🎮 JUEGOS GATUNOS 🐱',
  'group': '📚 GRUPOS 🐾',
  'downloader': '📥 DESCARGAS 😺',
  'sticker': '🖼️ STICKERS 🐾',
  'tools': '🧰 HERRAMIENTAS 😼',
  'especiales': '📂 MENÚS ESPECIALES 🐾'
};

let comandosPorCategoria = {
  'info': {
    '.creador':'👑',
    '.dash':'📊',
    '.status':'📈',
    '.estado':'📉',
    '.ping':'📶',
    '.infobot':'🤖',
    '.lid':'🆔'
  },
  'main': {
    '.menu':'📜',
    '.reportar':'📝'
  },
  'game': {
    '.acertijo':'❓',
    '.math':'➗',
    '.ahorcado':'🔤',
    '.dance *<@user>*':'💃',
    '.delttt':'❌',
    '.ppt':'✂️',
    '.adivinanza':'❓',
    '.bandera':'🏴',
    '.ttt':'❌',
    '.capital':'🏛️',
    '.trivia':'🎯',
    '.miau':'🐈‍⬛'
  },
  'downloader': {
    '.play <nombre de la canción>':'🎵',
    '.ytmp3 <url>':'🎶',
    '.ytmp4 <url>':'🎬',
    '.tiktok <url>':'🎵',
    '.ig <usuario>':'📸',
    '.facebook <url>':'📺',
    '.twitter <url>':'🐦',
    '.mediafire <url>':'💾'
  },
  'sticker': {
    '.stiker <img>':'🖼️',
    '.sticker <url>':'🖼️'
  },
  'tools': {
    '.invite':'📩',
    '.superinspect':'🔎',
    '.inspect':'🔍'
  },
  'especiales': {
    '.menuhot':'🔥'
  }
};

let handler = async (m, { conn }) => {
  try {
    let saludo = getSaludoGatuno();
    let menuText = `
╭━━━〔 😸 *MENÚ USUARIO FELIXCAT-BOT* 😸 〕━━━⬣
┃ ❒ *Creador*: ${creador} 🐾
┃ ❒ *Versión*: ${versionBot} 😺
┃ ❒ *Saludo*: ${saludo} 🐱
╰━━━━━━━━━━━━━━━━━━━━⬣
`;

    for (let tag of ['info','main','game','group','downloader','sticker','tools','especiales']) {
      let comandos = comandosPorCategoria[tag];
      if (!comandos) continue;

      menuText += `
╭━━━〔 ${tags[tag]} 〕━━━⬣
${Object.entries(comandos).map(([cmd, emoji]) => `┃ 🐾 ${cmd} ${emoji}`).join('\n')}
╰━━━━━━━━━━━━━━━━━━━━⬣
`;
    }

    menuText += `\n> 😸 Powered by FelixCat 🥷🏽`;
    await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: `✖️ Error mostrando el menú\n\n${e}` }, { quoted: m });
  }
};

handler.help = ['menuu'];
handler.tags = ['main'];
handler.command = ['menuu','usermenu','menuser'];

export default handler;

function getSaludoGatuno() {
  let hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "🌅 Maullidos buenos días!";
  if (hour >= 12 && hour < 18) return "☀️ Maullidos buenas tardes!";
  return "🌙 Maullidos buenas noches!";
}
