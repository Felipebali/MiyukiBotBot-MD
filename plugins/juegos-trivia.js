// 📂 plugins/trivia.js — FULL COMPATIBLE CON CUALQUIER LOADER
console.log('[Plugin] trivia cargado');

let activeTrivia = {};

const preguntasTrivia = [
  { pregunta: "¿Cuál es el planeta más grande del sistema solar?", opciones: ["Marte", "Júpiter", "Saturno", "Neptuno"], respuesta: "Júpiter" },
  { pregunta: "¿Quién pintó 'La última cena'?", opciones: ["Leonardo da Vinci", "Miguel Ángel", "Picasso", "Van Gogh"], respuesta: "Leonardo da Vinci" },
  { pregunta: "¿Cuál es el río más largo del mundo?", opciones: ["Amazonas", "Nilo", "Yangtsé", "Misisipi"], respuesta: "Amazonas" },
  { pregunta: "¿En qué año llegó el hombre a la Luna?", opciones: ["1965", "1969", "1971", "1959"], respuesta: "1969" },
  { pregunta: "¿Cuál es el animal terrestre más veloz?", opciones: ["León", "Tigre", "Guepardo", "Lobo"], respuesta: "Guepardo" },
  { pregunta: "¿Cuál es el océano más grande?", opciones: ["Atlántico", "Índico", "Pacífico", "Ártico"], respuesta: "Pacífico" },
  { pregunta: "¿Qué gas respiramos para vivir?", opciones: ["Nitrógeno", "Oxígeno", "Dióxido de carbono", "Helio"], respuesta: "Oxígeno" },
  { pregunta: "¿Cuál es la capital de Japón?", opciones: ["Seúl", "Tokio", "Kioto", "Osaka"], respuesta: "Tokio" },
  { pregunta: "¿Quién escribió 'Cien años de soledad'?", opciones: ["Mario Vargas Llosa", "Gabriel García Márquez", "Pablo Neruda", "Julio Cortázar"], respuesta: "Gabriel García Márquez" },
  { pregunta: "¿Cuál es el metal más ligero?", opciones: ["Aluminio", "Hierro", "Litio", "Mercurio"], respuesta: "Litio" },
  { pregunta: "¿Qué país ganó el Mundial de fútbol 2022?", opciones: ["Francia", "Brasil", "Argentina", "España"], respuesta: "Argentina" },
  { pregunta: "¿Cuál es el idioma más hablado del mundo?", opciones: ["Inglés", "Mandarín", "Español", "Hindi"], respuesta: "Mandarín" },
  { pregunta: "¿Qué elemento químico tiene el símbolo ‘O’?", opciones: ["Oro", "Oxígeno", "Osmio", "Oxalato"], respuesta: "Oxígeno" },
  { pregunta: "¿Qué país tiene forma de bota?", opciones: ["Portugal", "Italia", "Grecia", "España"], respuesta: "Italia" },
  { pregunta: "¿Cuál es el inventor del teléfono?", opciones: ["Nikola Tesla", "Alexander Graham Bell", "Thomas Edison", "Einstein"], respuesta: "Alexander Graham Bell" },
  { pregunta: "¿Cuál es la capital de Canadá?", opciones: ["Toronto", "Ottawa", "Vancouver", "Montreal"], respuesta: "Ottawa" },
  { pregunta: "¿Qué vitamina se obtiene del sol?", opciones: ["Vitamina A", "Vitamina C", "Vitamina D", "Vitamina B12"], respuesta: "Vitamina D" },
  { pregunta: "¿Cuál es el país más poblado del mundo?", opciones: ["China", "India", "Estados Unidos", "Indonesia"], respuesta: "India" },
  { pregunta: "¿Qué órgano bombea la sangre en el cuerpo?", opciones: ["Pulmón", "Corazón", "Riñón", "Hígado"], respuesta: "Corazón" },
  { pregunta: "¿Qué instrumento mide la temperatura?", opciones: ["Barómetro", "Termómetro", "Higrómetro", "Anemómetro"], respuesta: "Termómetro" }
];

let handler = async (m, { conn }) => {
  try {
    const chat = global.db.data.chats[m.chat] || {};

    // 🔒 Juegos activados?
    if (!chat.games) return;

    if (activeTrivia[m.chat]) return;

    const pregunta = preguntasTrivia[Math.floor(Math.random() * preguntasTrivia.length)];

    const texto = `🎯 *Trivia de Conocimiento* 🎯\n\n${pregunta.pregunta}\n\n${pregunta.opciones.map((o, i) => `${i + 1}) ${o}`).join('\n')}\n\n📝 *Responde citando este mensaje.*`;

    // Enviar mensaje y guardar ID
    const msg = await conn.reply(m.chat, texto, m);

    activeTrivia[m.chat] = {
      ...pregunta,
      msgId: msg.key.id // Guardamos el mensaje ORIGINAL de la trivia
    };

    // ⏳ 30 segundos de tiempo límite
    activeTrivia[m.chat].timeout = setTimeout(() => {
      if (activeTrivia[m.chat]) {
        conn.reply(m.chat, `⏰ Tiempo agotado. La respuesta correcta era: *${pregunta.respuesta}*.`);
        delete activeTrivia[m.chat];
      }
    }, 30000);

  } catch (err) {
    console.error(err);
  }
};

// 📌 Captura SOLO mensajes que sean reply al mensaje exacto
handler.all = async function (m) {
  const conn = global.conn;

  if (!m.text || !activeTrivia[m.chat]) return;

  const juego = activeTrivia[m.chat];

  // ❗ El usuario DEBE responder citando el mensaje de la trivia
  const quoted = m.quoted?.id || m.quoted?.key?.id;
  if (!quoted || quoted !== juego.msgId) return; // ❌ Ignora cualquier mensaje que NO sea reply exacto

  const respuestaUsuario = m.text.trim().toLowerCase();
  const respuestaCorrecta = juego.respuesta.toLowerCase();

  if (respuestaUsuario === respuestaCorrecta) {
    clearTimeout(juego.timeout);
    await conn.reply(m.chat, `✅ ¡Correcto, ${m.pushName || "usuario"}! La respuesta era *${juego.respuesta}*.`);
    delete activeTrivia[m.chat];
  } else {
    await conn.reply(m.chat, `❌ Incorrecto, ${m.pushName || "usuario"}.`);
  }
};

// Config Loader
handler.help = ['trivia'];
handler.tags = ['fun', 'juego'];
handler.group = true;
handler.command = ['trivia'];
handler.register = true;

export default handler;
