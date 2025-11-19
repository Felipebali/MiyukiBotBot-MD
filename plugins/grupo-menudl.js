let handler = async (m, { conn }) => {
    const mensaje = `
╭━━〔 ⚡ FelixCat-Bot ⚡ 〕━━⬣
┃ 📥 *Menú de Descargas*
┃
┃ • .facebook
┃ • .ig
┃ • .tiktok
┃ • .tiktoksearch
┃ • .spotify
┃ • .play
┃ • .play2
┃ • .ytmp3
┃ • .ytmp4
┃ • .mediafire
┃ • .apk2
╰━━━━━━━━━━━━━━━━⬣
`.trim();

    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m });
};

handler.command = ['menudl'];
handler.help = ['menudl'];
handler.tags = ['descargas'];
handler.group = false;

export default handler;
