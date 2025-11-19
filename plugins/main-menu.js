// plugins/menu.js
const botname = global.botname || '😸 FelixCat-Bot 😸';
const creador = 'Balkoszky🇵🇱';
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
┃ 🌍 *.clima <ciudad>* – Ver clima actual
┃ 🕐 *.hora* – Ver hora actual en el mundo
┃ 🌐 *.traducir <idioma> <texto>* – Traduce mensajes o textos
┃ ✉️ *.sug* – Envía una sugerencia (1 cada 24h)
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 📚 *TIPOS DE MENÚ* ━━━┓
┃ 👤 *.menuser* – Comandos para todos los usuarios
┃ 🎮 *.menuj* – Juegos y entretenimiento
┃ 💾 *.menudl* – Descargas y convertidores
┃ 👥 *.menugp* – Herramientas para grupos
┃ 🔥 *.menuhot* – Humor y diversión +18 😳
┃ 👑 *.menuowner* – Panel del dueño
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🛡️ *SEGURIDAD DEL GRUPO* ━━━┓
┃ 🔗 *.antilink* – Bloquea enlaces externos
┃ 🧩 *.antilink2* – Modo fuerte anti-links
┃ 🚫 *.antispam* – Evita mensajes repetitivos
┃ 🤖 *.antibot* – Expulsa otros bots
┃ ☣️ *.antitoxico* – Frena lenguaje ofensivo
┃ 👻 *.antifake* – Bloquea números falsos
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 📥 *DESCARGAS* ━━━┓
┃ 📲 *.apk* – Descarga apps APK
┃ 🎧 *.spotify* – Música desde Spotify
┃ 📘 *.fb* – Videos de Facebook
┃ 📸 *.ig* – Reels o fotos de Instagram
┃ 📂 *.mediafire* – Descarga archivos
┃ 🎵 *.tiktok* – Videos o sonidos de TikTok
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🎶 *MÚSICA / VIDEOS* ━━━┓
┃ 🎵 *.play* – Música desde YouTube
┃ 🎶 *.play2* – Alternativa de descarga
┃ 🔊 *.ytmp3* – Convierte a audio
┃ 🎬 *.ytmp4* – Descarga video completo
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🔍 *BUSCADOR* ━━━┓
┃ 🖼️ *.imagen* – Busca imágenes
┃ 🌐 *.google* – Busca en Google
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🎮 *GAMES FELINOS* ━━━┓
┃ 🕹️ *.juegos* – Activa/desactiva juegos
┃ ❓ *.adivinanza* – Adivina la respuesta
┃ 🏴 *.bandera* – Adivina la bandera
┃ 🏛️ *.capital* – Capital del país
┃ 🧠 *.pensar* – Desafío mental
┃ 🔢 *.número* – Adivina el número
┃ 🐈‍⬛ *.miau* – Respuesta gatuna
┃ 🏆 *.top10* – Ranking aleatorio
┃ 🍝 *.plato* – Adivina el plato
┃ 💃 *.dance* – Haz bailar a alguien
┃ 🎯 *.trivia* – Preguntas de cultura
┃ 🧞 *.consejo* – Consejo aleatorio
┃ 📱 *.fakewpp* – Crea perfil falso
┃ 💔 *.infiel* – Test de infidelidad
┃ 🦊 *.zorro/a* – Test del zorro
┃ 🤡 *.cornudo/a* – Test de pareja
┃ 💋 *.puta* – Versión traviesa 😳
┃ 🏳️‍🌈 *.trolo* – Humor 💅
┃ 💞 *.kiss* – Envía un beso 😽
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 🧰 *ADMINS / STAFF* ━━━┓
┃ 🗑️ *.del* – Borra mensaje citado
┃ 👢 *.k* – Expulsa al usuario
┃ 🅿️ *.p* – Promueve a admin
┃ 🅳 *.d* – Quita admin
┃ 🔇 *.mute* / *.unmute* – Silencia o reactiva a un usuario
┃ 🚨 *.reportar* – Reporta usuario al staff
┃ 🏷️ *.tagall* – Menciona a todos
┃ 📣 *.tag* – Menciona a uno
┃ 🧠 *.ht* – Mención oculta (sin alerta)
┃ ⚙️ *.g* – Cierra o abre el grupo
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 👑 *OWNERS* ━━━┓
┃ 🛡️ *.autoadmin* – Te da admin automático
┃ 🎯 *.chetar* / *.deschetar* – Modo VIP
┃ 🕵️ *.detectar* – Analiza actividad sospechosa
┃ 🔗 *.join* – Une el bot a otro grupo
┃ 📜 *.grouplist* – Lista de grupos activos
┃ 🔁 *.resetuser* – Reinicia usuario
┃ ✏️ *.setprefix* – Cambia prefijo
┃ 🧹 *.resetprefix* – Restaura prefijo
┃ 🔄 *.restart* – Reinicia el bot
┃ 💣 *.wipe* – Limpieza completa
┃ 🪄 *.resetlink* – Restaura link del grupo
┃ ⚙️ *.update* – Actualiza el bot
┃ 👑 *.owner* – Info del creador
┗━━━━━━━━━━━━━━━━━━━━━┛

🐾 *FelixCat-Bot* siempre vigilante 😼  
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
