// plugins/grupo-configuracion.js - Panel de configuración del grupo

let handler = async (m, { conn, isOwner, isAdmin }) => {
    // Solo grupos
    if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos');
    // Solo admins o owners
    if (!isAdmin && !isOwner) return m.reply('⚠️ Solo los administradores pueden ver el panel');

    // Obtenemos la configuración del grupo desde la base de datos
    let chat = global.db.data.chats[m.chat] || {};

    // Panel con todas las funciones
    let panel = `╭━━━[ PANEL DE CONFIGURACIÓN ]━━━╮
┃ 👋 Welcome: ${chat.welcome ? '✅' : '❌'}
┃ 👋 Despedida: ${chat.despedida ? '✅' : '❌'}
┃ 🔗 AntiLink: ${chat.antilink ? '✅' : '❌'}
┃ 🚫 AntiFake: ${chat.antifake ? '✅' : '❌'}
┃ 🚫 AntiSpam: ${chat.antispam ? '✅' : '❌'}
┃ 🤬 AntiTóxico: ${chat.antitoxic ? '✅' : '❌'}
┃ 🛰️ Detect: ${chat.detect ? '✅' : '❌'}
┃ 🖼️ AutoSticker: ${chat.autosticker ? '✅' : '❌'}
┃ 🔞 NSFW: ${chat.nsfw ? '✅' : '❌'}
┃ 🎮 Juegos: ${chat.juegos ? '✅' : '❌'}
┃ 🌐 Modo Público: ${chat.public ? '✅' : '❌'}
┃ 🛡️ SoloAdmins: ${chat.onlyadmin ? '✅' : '❌'}
┃ 📵 AntiLlamada: ${chat.antillamada ? '✅' : '❌'}
┃ 🤖 AntiBots: ${chat.antibot ? '✅' : '❌'}
╰━━━━━━━━━━━━━━━━━━━━━━╯

Escribe *.panel info* para ver cómo activar o configurar cada función.`;

    m.reply(panel);
};

handler.help = ['panel'];
handler.tags = ['group'];
handler.command = /^panel$/i;
handler.group = true;

export default handler;
