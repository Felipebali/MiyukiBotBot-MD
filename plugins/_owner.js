let handler = async (m, { conn }) => {

  if (!global.owner || !global.owner.length) {
    return m.reply("❌ No hay owners configurados.");
  }

  const owners = global.owner.slice(0, 3);

  let texto = `👑 *OWNERS DEL BOT* 👑\n\n`;
  let mentions = [];

  for (let data of owners) {

    let numero = Array.isArray(data) ? data[0] : data;
    let nombre = Array.isArray(data) ? data[1] || "Owner" : "Owner";

    let jid = numero + '@s.whatsapp.net';
    mentions.push(jid);

    texto += `➤ ${nombre}: @${numero}\n`;
  }

  texto += `\n🤖 FelixCat Bot`;

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions
  }, { quoted: m });
};

handler.command = /^owner$/i
handler.help = ['owner']
handler.tags = ['info']

export default handler
