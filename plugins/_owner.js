// 📂 plugins/owner.js — FelixCat 🐾
// .owner → muestra solo los 3 primeros owners de global.owner

let handler = async (m, { conn }) => {

  if (!global.owner || !global.owner.length) {
    return m.reply("❌ No hay owners configurados.");
  }

  // Tomar solo los primeros 3
  const owners = global.owner.slice(0, 3);

  let texto = `👑 *OWNERS DEL BOT* 👑\n\n`;
  let mentions = [];

  owners.forEach((data, i) => {

    let numero = Array.isArray(data) ? data[0] : data;
    let nombre = Array.isArray(data) ? data[1] || "Owner" : "Owner";

    let jid = numero + '@s.whatsapp.net';
    mentions.push(jid);

    texto += `➤ ${nombre}: @${numero}\n`;
  });

  texto += `\n🤖 FelixCat Bot`;

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions
  }, { quoted: m });

};

handler.help = ['owner'];
handler.tags = ['info'];
handler.command = ['owner'];

export default handler;
