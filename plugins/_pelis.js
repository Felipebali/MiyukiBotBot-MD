import axios from "axios";

const handler = async (m, { text, conn }) => {
  try {
    if (!text)
      return m.reply("🎬 ¿Qué película querés buscar?\nEjemplo:\n.pelis terminator");

    m.reply("🔎 Buscando películas...");

    // NUEVA API — FUNCIONAL 2025
    const url = `https://vidsrc.pro/api/search?query=${encodeURIComponent(text)}`;
    const res = await axios.get(url);

    const data = res.data.results;
    if (!data || data.length === 0)
      return m.reply("❌ No se encontraron películas con ese nombre.");

    const p = data[0]; // primera coincidencia

    let caption = `🎬 *${p.title}*\n`;
    caption += `📅 Año: ${p.year || "?"}\n`;
    caption += `🆔 ID: ${p.id}\n`;
    caption += `🔗 Ver online:\nhttps://vidsrc.pro/embed/movie/${p.id}\n\n`;

    caption += "🍿 *Resultados similares:*\n\n";
    data.slice(0, 10).forEach((x, i) => {
      caption += `*${i + 1}.* ${x.title} (${x.year})\n`;
    });

    const img = p.poster || "https://i.imgur.com/2M7R5wF.jpeg";
    conn.sendFile(m.chat, img, "pelicula.jpg", caption, m);

  } catch (e) {
    console.log(e);
    m.reply("❌ Error al obtener películas.");
  }
};

handler.command = ["pelis", "cuevana", "pelisplus"];
export default handler;
