// 📂 plugins/juegos-capital.js

// Base de datos de países y capitales
const capitales = {
  "Uruguay": "Montevideo",
  "Argentina": "Buenos Aires",
  "Brasil": "Brasilia",
  "Chile": "Santiago",
  "Paraguay": "Asunción",
  "Perú": "Lima",
  "México": "Ciudad de México",
  "España": "Madrid",
  "Francia": "París",
  "Alemania": "Berlín",
  "Italia": "Roma",
  "Japón": "Tokio",
  "China": "Pekín",
  "Rusia": "Moscú",
  "Estados Unidos": "Washington D.C.",
  "Canadá": "Ottawa",
  "Colombia": "Bogotá",
  "Venezuela": "Caracas",
  "Bolivia": "Sucre",
  "Ecuador": "Quito",
  "Portugal": "Lisboa",
  "Reino Unido": "Londres",
  "Egipto": "El Cairo",
  "India": "Nueva Delhi",
  "Australia": "Canberra",
  "Sudáfrica": "Pretoria",
  "Suecia": "Estocolmo",
  "Noruega": "Oslo",
  "Dinamarca": "Copenhague",
  "Grecia": "Atenas"
};

// Normalizar texto (quita acentos y símbolos)
function normalizeText(s) {
  if (!s) return '';
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return s.replace(/[^0-9a-zA-Z\s]/g, '').trim().toLowerCase();
}

let handler = async (m, { conn }) => {
  const chatSettings = global.db.data.chats[m.chat] || {};
  if (chatSettings.games === false)
    return conn.sendMessage(m.chat, { text: '🎮 Los mini-juegos están desactivados.\nUsa *.juegos* para activarlos.' }, { quoted: m });

  if (!global.capitalGame) global.capitalGame = {};

  const paises = Object.keys(capitales);
  const pais = paises[Math.floor(Math.random() * paises.length)];
  const capital = capitales[pais];

  // Enviar pregunta principal
  const msg = await conn.sendMessage(m.chat, {
    text: `🌍 *ADIVINA LA CAPITAL*\n\n¿Cuál es la capital de *${pais}*?\n\n💬 *Responde citando este mensaje con tu respuesta.*\n⏱️ *Tienes 25 segundos!*`
  }, { quoted: m });

  // Guardar la partida
  global.capitalGame[m.chat] = {
    country: pais,
    answer: capital,
    answered: false,
    messageId: msg?.key?.id,
    timeout: setTimeout(async () => {
      const game = global.capitalGame?.[m.chat];
      if (game && !game.answered) {
        await conn.sendMessage(m.chat, { text: `⏰ Se acabó el tiempo! La capital de *${game.country}* era *${game.answer}* 🏙️` }, { quoted: msg });
        delete global.capitalGame[m.chat];
      }
    }, 25000)
  };
};

// Verificar respuestas citadas
handler.before = async (m, { conn }) => {
  const game = global.capitalGame?.[m.chat];
  if (!game || game.answered || !m.text) return;

  const quotedId = m.quoted?.key?.id || m.quoted?.id || null;
  if (!quotedId || quotedId !== game.messageId) return;

  const userAnswer = normalizeText(m.text);
  const correctAnswer = normalizeText(game.answer);

  if (userAnswer === correctAnswer) {
    clearTimeout(game.timeout);
    game.answered = true;

    const winMsgs = [
      `🏆 ¡Correcto, ${m.pushName}! La capital de *${game.country}* es *${game.answer}*! 🇺🇳`,
      `🎉 ¡Muy bien, ${m.pushName}! Era *${game.answer}*!`,
      `🔥 Genial, ${m.pushName}! Acertaste: *${game.answer}*!`
    ];

    await conn.sendMessage(m.chat, { text: winMsgs[Math.floor(Math.random() * winMsgs.length)] }, { quoted: m });
    delete global.capitalGame[m.chat];
  } else {
    const failMsgs = [
      '❌ Incorrecto.',
      '🤔 No es esa.',
      '🙃 Casi, pero no.',
      '💀 Fallaste!'
    ];
    await conn.sendMessage(m.chat, { text: failMsgs[Math.floor(Math.random() * failMsgs.length)] }, { quoted: m });
  }
};

handler.command = ['capital', 'capitales'];
handler.group = true;

export default handler;
