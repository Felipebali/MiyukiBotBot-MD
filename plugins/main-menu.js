// plugins/menu.js
const botname = global.botname || '😸 FelixCat-Bot 😸';
const creador = 'Anónimo🐼';
const versionBot = '10.6.1';

let handler = async (m, { conn }) => {
  try {
    const saludo = getSaludoGatuno();
    const fecha = new Date().toLocaleString('es-UY', {
      timeZone: 'America/Montevideo',
      hour12: false
    });

    let menu = `
╭━━━ ✨ *CENTRO FELINO* ✨ ━━━╮
│ 😺 *${botname}* 😺
│ 👑 *Creador:* ${creador}
│ ⚙️ *Versión:* ${versionBot}
│ 💬 *${saludo}*
│ ⏰ *Hora actual:* ${fecha}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

🌦️ *Consultas rápidas:*
┃ 🔮 *.horoscopo <signo>* – Tu destino felino del día
┃ 🚨 *.reportar <motivo>* – Reporta algo indebido
┃ 🌍 *.clima <ciudad>* – Ver clima actual
┃ 🕐 *.hora* – Ver hora actual en el mundo
┃ 🌐 *.traducir <idioma> <texto>* – Traduce textos
┃ ✉️ *.sug* – Envía una sugerencia (1 cada 24h)
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 📚 *TIPOS DE MENÚ* ━━━┓
┃ 🎮 *.menuj* – Juegos y entretenimiento
┃ 👥 *.menugp* – Herramientas para grupos
┃ 🔥 *.menuhot* – Humor y +18 😳
┃ 👑 *.menuowner* – Panel del dueño
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🛡️ *SEGURIDAD DEL GRUPO* ━━━┓
┃ 🔗 *.antilink* – Bloquea enlaces
┃ 🧩 *.antilink2* – Modo fuerte
┃ 🚫 *.antispam* – Evita spam
┃ 🤖 *.antibot* – Expulsa bots
┃ ☣️ *.antitoxico* – Frena toxicidad
┃ 👻 *.antifake* – Bloquea números falsos
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 📥 *DESCARGAS* ━━━┓
┃ 📲 *.apk* – Descarga apps
┃ 🎧 *.spotify* – Música Spotify
┃ 📘 *.fb* – Facebook
┃ 📸 *.ig* – Instagram
┃ 📂 *.mediafire* – Archivos
┃ 🎵 *.tiktok* – TikTok
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🎬 *ENTRETENIMIENTO* ━━━┓
┃ 🎥 *.quever <género>* – Películas aleatorias por género
┃ 📺 *.verserie <género>* – Series aleatorias por género
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🎶 *MÚSICA / VIDEOS* ━━━┓
┃ 🎵 *.play* – Música de YouTube
┃ 🔊 *.mp3* – Convierte a MP3
┃ 🎬 *.mp2* – Segunda alternativa
┃ 🎥 *.play2* – Alternativa de audio
┃ 🎬 *.ytmp4* – enlace del vídeo
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🖼️ *STICKERS & MULTIMEDIA* ━━━┓
┃ 💬 *.qc <texto>* – Frase a sticker
┃ ✂️ *.s* – Imagen/video a sticker
┃ 🖼️ *.imagen* – Buscar imágenes
┃ 🌐 *.google* – Buscar en Google
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🎮 *GAMES FELINOS* ━━━┓
┃ 🕹️ *.juegos* – Activar juegos
┃ ❓ *.adivinanza*
┃ 🏴 *.bandera*
┃ 🏛️ *.capital*
┃ 🧠 *.pensar*
┃ 🔢 *.número*
┃ 🐈‍⬛ *.miau*
┃ 🏆 *.top10*
┃ 🍝 *.plato*
┃ 💃 *.dance*
┃ 🎯 *.trivia*
┃ 🧞 *.consejo*
┃ 📱 *.fakewpp*
┃ 💔 *.infiel*
┃ 🦊 *.zorro/a*
┃ 🤡 *.cornudo/a*
┃ 💋 *.kiss*
┃ 💞 *.puta*
┃ 🏳️‍🌈 *.trolo*
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🧰 *ADMINS / STAFF* ━━━┓
┃ 🗑️ *.del* – Borra mensaje citado
┃ 👢 *.k* – Expulsa usuario
┃ 🅿️ *.p* – Promueve a admin
┃ 🅳 *.d* – Quita admin
┃ 🔇 *.mute* / *.unmute*
┃ 🏷️ *.tagall* – Menciona a todos
┃ 📣 *.tag* – Mencionar uno
┃ 🧠 *.ht* – Mención oculta
┃ ⚙️ *.g* – Abrir / cerrar grupo
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 👑 *OWNERS* ━━━┓
┃ 🛡️ *.autoadmin*
┃ 🎯 *.chetar* / *.deschetar*
┃ 🕵️ *.detectar*
┃ 🔗 *.join*
┃ 📜 *.grouplist*
┃ 🔄 *.resetuser*
┃ ✏️ *.setprefix*
┃ 🧹 *.resetprefix*
┃ 🔁 *.restart*
┃ 💣 *.wipe*
┃ 🪄 *.resetlink*
┃ ⚙️ *.update*
┃ 👑 *.owner*
┗━━━━━━━━━━━━━━━━━━━━━┛

🐾 *${botname}* siempre vigilante 😼  
✨ _“Un maullido, una acción.”_
`;

    await conn.reply(m.chat, menu.trim(), m);
    await conn.sendMessage(m.chat, { react: { text: '🐾', key: m.key } });

  } catch (err) {
    console.error(err);
    await conn.reply(m.chat, `❌ Error al mostrar el menú\n${err}`, m);
  }
};

handler.help = ['menu', 'menú', 'allmenu'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'allmenu'];

export default handler;

function getSaludoGatuno() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "🌅 Maullidos buenos días!";
  if (hour >= 12 && hour < 18) return "☀️ Maullidos buenas tardes!";
  return "🌙 Maullidos buenas noches!";
}
