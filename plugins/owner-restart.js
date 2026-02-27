import os from 'os';

let handler = async (m, { conn }) => {
  try {
    // Mensaje de reinicio
    const info = `
🔄 *Reinicio iniciado...*
El bot se reiniciará en unos segundos.
    `.trim();

    await conn.reply(m.chat, info, m);

    // Guardamos chat para avisar cuando el bot vuelva a estar activo
    global.lastRestartNotify = m.chat;
    global.lastRestartTime = Date.now();

    // Reiniciamos después de 3 segundos
    setTimeout(() => process.exit(0), 3000);

  } catch (error) {
    console.error('[ERROR][REINICIO]', error);
    await conn.reply(m.chat, `❌ Error\n${error.message || error}`, m);
  }
};

// 🟢 Al iniciar el plugin / bot, avisamos si venimos de un reinicio
if (global.lastRestartNotify) {
  const chat = global.lastRestartNotify;

  const uptime = Date.now() - (global.lastRestartTime || Date.now());
  const seconds = Math.floor(uptime / 1000) % 60;
  const minutes = Math.floor(uptime / (1000 * 60)) % 60;
  const hours = Math.floor(uptime / (1000 * 60 * 60));

  const tiempo = `${hours}h ${minutes}m ${seconds}s`;

  const message = `
✅ *FelixCat Bot activo nuevamente!*
⚡ Sistema operativo: ${os.type()} ${os.release()}
⏱️ Tiempo desde reinicio: ${tiempo}
🐾 Todo funcionando correctamente 😸
  `.trim();

  try {
    conn.sendMessage(chat, { text: message });
    delete global.lastRestartNotify;
    delete global.lastRestartTime;
  } catch (e) {
    console.error('[REINICIO][AVISO]', e);
  }
}

handler.help = ['restart'];
handler.tags = ['owner'];
handler.command = ['restart', 'reiniciar'];
handler.rowner = true;

export default handler;
