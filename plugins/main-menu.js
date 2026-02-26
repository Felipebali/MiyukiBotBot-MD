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
┃ 🔮 *.horoscopo <signo>*
┃ 🚨 *.reportar <motivo>*
┃ 🌍 *.clima <ciudad>*
┃ 🕐 *.hora*
┃ 🌐 *.traducir <idioma> <texto>*
┃ ✉️ *.sug*
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 👤 *PERFIL DE USUARIO* ━━━┓
┃ 🪪 *.perfil* – Ver tu perfil
┃ 🎂 *.setbr 01/01/2001* – Fecha nacimiento
┃ 📝 *.bio texto* – Biografía personal
┃ 🚻 *.genero a elección* – Configurar género
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🧬 *HERMANOS* ━━━┓
┃ 🤝 *.hermano* – Proponer hermandad
┃ ✅ *.aceptarhermano* – Aceptar propuesta
┃ ❌ *.rechazarhermano* – Rechazar propuesta
┃ 💔 *.romperhermandad* – Romper hermandad
┃ 🫂 *.abrazohermano* – Abrazar a tu hermano
┃ 🛡️ *.proteger* – Proteger a tu hermano
┃ 📊 *.relacionhermano* – Ver estado de hermandad
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 💕 *RELACIONES* ━━━┓
┃ 💘 *.pareja citando mensaje* – Proponer relación
┃ ✅ *.aceptar* – Aceptar propuesta
┃ ❌ *.rechazar* – Rechazar propuesta
┃ 💔 *.terminar* – Terminar relación
┃ 💍 *.casarse* – Casarse (tras 7 días)
┃ ⚖️ *.divorcio* – Divorciarse
┃ ❤️ *.relacion* – Ver estado actual
┃ 💋 *.besar* – Besar a tu pareja
┃ 🤗 *.abrazar* – Abrazar a tu pareja
┃ 💖 *.amor* – Aumentar amor
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 📚 *TIPOS DE MENÚ* ━━━┓
┃ 🎮 *.menuj*
┃ 👥 *.menugp*
┃ 🔥 *.menuhot*
┃ 👑 *.menuowner*
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🛡️ *SEGURIDAD DEL GRUPO* ━━━┓
┃ 🔗 *.antilink*
┃ 🧩 *.antilink2*
┃ 🚫 *.antispam*
┃ 🤖 *.antibot*
┃ ☣️ *.antitoxico*
┃ 👻 *.antifake*
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 📥 *DESCARGAS* ━━━┓
┃ 📲 *.apk*
┃ 🎧 *.spotify*
┃ 📘 *.fb*
┃ 📸 *.ig*
┃ 📂 *.mediafire*
┃ 🎵 *.tiktok*
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🎬 *ENTRETENIMIENTO* ━━━┓
┃ 🎥 *.quever <género>*
┃ 📺 *.verserie <género>*
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🎶 *MÚSICA / VIDEOS* ━━━┓
┃ 🎵 *.play*
┃ 🔊 *.mp3*
┃ 🎬 *.mp2*
┃ 🎥 *.play2*
┃ 🎬 *.ytmp4*
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🖼️ *STICKERS & MULTIMEDIA* ━━━┓
┃ 💬 *.qc <texto>*
┃ ✂️ *.s*
┃ 🖼️ *.imagen*
┃ 🌐 *.google*
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🎮 *GAMES FELINOS* ━━━┓
┃ 🕹️ *.juegos*
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
┃ 🗑️ *.del*
┃ 👢 *.k*
┃ 🅿️ *.p*
┃ 🅳 *.d*
┃ 🔇 *.mute* / *.unmute*
┃ 🏷️ *.tagall*
┃ 📣 *.tag*
┃ 🧠 *.ht*
┃ ⚙️ *.g*
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

handler.help = ['menu', 'menú', 'help'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'allmenu'];

export default handler;

function getSaludoGatuno() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "🌅 Maullidos buenos días!";
  if (hour >= 12 && hour < 18) return "☀️ Maullidos buenas tardes!";
  return "🌙 Maullidos buenas noches!";
}
