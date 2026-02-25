// plugins/menuhot.js
let handler = async (m, { conn }) => {
    if (!m.isGroup) return;

    // Verifica si NSFW está activado en el grupo
    if (!global.db.data.chats[m.chat].nsfw) {
        return m.reply('🔞 El contenido *NSFW* está desactivado en este grupo.\n> Un owner puede activarlo con el comando » *.nsfw*');
    }

    const menuText = `╭━━━〔 🔞 NSFW 🐾 〕━━━⬣
┃ 🐾 .sixnine/69 @tag 🍆
┃ 🐾 .anal/culiar @tag 🍑
┃ 🐾 .blowjob/mamada @tag 💦
┃ 🐾 .follar @tag 🔥
┃ 🐾 .grabboobs/agarrartetas @tag 👙
┃ 🐾 .searchhentai 🔞
┃ 🐾 .hentaisearch 🔎
┃ 🐾 .penetrar @user 🍑
┃ 🐾 .sexo/sex @tag 🔥
┃ 🐾 .tetas 👙
┃ 🐾 .culo 🍑
┃ 🐾 .cum 💦
┃ 🐾 .pies 👣
┃ 🐾 .nalgada 🍑
┃ 🐾 .coño 🔞
┃ 🐾 .violar 🥵
┃ 🐾 .chupartetas 🍒
┃ 🐾 .kiss18 🫦
╰━━━━━━━━━━━━━━━━━━━━⬣
> 👑 Powered by FelixCat 🥷🏽`;

    // Enviar solo texto
    await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
};

handler.help = ['menuhot'];
handler.tags = ['nsfw'];
handler.command = ['menuhot'];
handler.group = true;

export default handler;
