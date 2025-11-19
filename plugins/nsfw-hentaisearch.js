// plugins/hentaisearch.js
const handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply('Por favor, ingresa el nombre de algún hentai para buscar.');

    // Asegurarse que la DB existe
    const dbUsers = global.db?.data?.users || {};

    // Aquí podrías usar la DB si necesitás filtrar por usuarios, ejemplo:
    const usersList = Object.values(dbUsers); // nunca será undefined

    // Simulación de búsqueda
    // Reemplazá esto con tu API real o scraping
    const results = [
      { title: 'Hentai 1', link: 'https://example.com/1' },
      { title: 'Hentai 2', link: 'https://example.com/2' },
    ].filter(item => item.title.toLowerCase().includes(text.toLowerCase()));

    if (!results.length) return m.reply('No se encontraron resultados.');

    // Armar mensaje de resultados
    let message = '🔍 Resultados de búsqueda:\n\n';
    results.forEach((item, index) => {
      message += `${index + 1}. ${item.title}\nLink: ${item.link}\n\n`;
    });

    await conn.sendMessage(m.chat, { text: message.trim() }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al buscar hentai.');
  }
};

handler.command = ['hentaisearch', 'hs'];
handler.tags = ['internet'];
handler.group = false;
export default handler;
