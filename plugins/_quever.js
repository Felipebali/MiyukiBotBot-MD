import fetch from "node-fetch";

const generosDisponibles = [
  "acción","accion","comedia","comedy","aventura","adventure","animación","animacion",
  "kids","ciencia ficción","ciencia ficcion","sci-fi","misterio","terror","drama",
  "romance","bélica","belica","crimen","familia","family","suspenso","suspense",
  "documental","historia","history","horror"
];

let handler = async (m, { conn, command, usedPrefix, text }) => {

  if (!text) {
    return await conn.sendMessage(m.chat, { 
      text: `🍿 *¿Qué género querés ver?*\n\n` +
            `Ejemplo:\n` +
            `• ${usedPrefix}${command} acción\n` +
            `• ${usedPrefix}${command} comedia\n` +
            `• ${usedPrefix}${command} terror\n\n` +
            `Usa *random* para elegir uno aleatorio.\n\n` +
            `🎬 *Géneros disponibles:* \n${generosDisponibles.join(", ")}`
    }, { quoted: m });
  }

  let genero = text.toLowerCase().trim();

  if (genero === "random")
    genero = generosDisponibles[Math.floor(Math.random() * generosDisponibles.length)];

  if (!generosDisponibles.includes(genero)) {
    return conn.sendMessage(m.chat, { text: "❗ *Categoría no válida.*" }, { quoted: m });
  }

  const esSerie = /verserie/i.test(command);

  const endpoint = esSerie
    ? `https://streaming-recommendation-api.vercel.app/api/serie?genre=${genero}`
    : `https://streaming-recommendation-api.vercel.app/api/movie?genre=${genero}`;

  await m.react("🍿");

  let data;
  try {
    const res = await fetch(endpoint);
    data = await res.json();
  } catch (e) {
    console.error(e);
    return conn.sendMessage(m.chat, { text: "❗ *Error al conectar con la API.*" }, { quoted: m });
  }

  if (!data?.success || !data?.recommendation) {
    return conn.sendMessage(m.chat, { text: "❗ *No se encontró recomendación.*" }, { quoted: m });
  }

  const reco = data.recommendation;
  const poster = `https://image.tmdb.org/t/p/w500${reco.urlImage}`;

  // FIX: sinopsis garantizada
  const sinopsis = reco.overview && reco.overview.trim().length > 0
    ? reco.overview
    : "⚠️ Sinopsis no disponible para este título.";

  let caption = 
`🍿 *${reco.name}* 🍿

📌 *Género:* ${reco.genres}
⭐ *Puntuación:* ${reco.vote}
📆 *Estreno:* ${reco.date}

📝 *Sinopsis:* ${sinopsis}`;

  if (esSerie) {
    caption =
`🍿 *${reco.name}* 🍿

📌 *Género:* ${reco.genres}
⭐ *Puntuación:* ${reco.vote}
📆 *Estreno:* ${reco.date}

📺 *Episodios:* ${reco.number_of_episodes}
📺 *Temporadas:* ${reco.number_of_seasons}

📝 *Sinopsis:* ${sinopsis}`;
  }

  await conn.sendFile(m.chat, poster, "poster.jpg", caption, m);
};

handler.help = ["quever", "verserie"];
handler.tags = ["fun", "movie"];
handler.command = ["quever", "verserie"];

export default handler;
