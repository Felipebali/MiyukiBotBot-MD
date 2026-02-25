// plugins/especiales.js
let handler = async (m, { conn }) => {
  try {
    const menus = ['.menuj','\.menuhot','.menugp','.menuow', 'menudl'];
    let menuText = `📂 *MENÚS ESPECIALES* 🐾\n\n`;
    menuText += menus.map(cmd => `┃ 🐾 ${cmd}`).join('\n');
    menuText += `\n\n> 😸 FelixCat-Bot`;

    await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: `✖️ Error mostrando los menús especiales\n\n${e}` }, { quoted: m });
  }
};

handler.help = ['especiales'];
handler.tags = ['main'];
handler.command = ['especiales'];

export default handler;
