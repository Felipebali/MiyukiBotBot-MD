// plugins/media-admin.js
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args }) => {
  try {
    // seguridad extra: solo owner puede usar
    const owners = (global.owner || []).map(o => (Array.isArray(o) ? o[0] : o)).map(v => v.replace(/[^0-9]/g,'') + '@s.whatsapp.net');
    if (!owners.includes(m.sender)) return;

    if (!global.db || !global.db.data) return m.reply('No hay base de datos cargada.');
    const list = global.db.data.mediaList || [];

    const cmd = (args && args[0]) ? args[0].toLowerCase() : '';

    if (!cmd || cmd === 'list' || cmd === 'medias') {
      if (!list.length) return conn.reply(m.chat, 'No hay medios guardados aún.', m);

      // mostrar hasta 50 primeros
      const lines = list.slice(0,50).map(it => `ID:${it.id} • ${it.filename} • ${it.type} • from:${it.from} • group:${it.groupName || it.groupId} • ${it.date}`);
      const text = `📁 Medios guardados (mostrando ${Math.min(list.length,50)}/${list.length})\n\n` + lines.join('\n');
      return conn.reply(m.chat, text, m);
    }

    // enviar media por id: media <id>
    if (!isNaN(cmd)) {
      const id = parseInt(cmd);
      const item = list.find(x => x.id === id);
      if (!item) return conn.reply(m.chat, `No existe medio con id ${id}`, m);

      const filepath = item.path || path.join('./media', item.filename);
      if (!fs.existsSync(filepath)) return conn.reply(m.chat, 'Archivo no encontrado en servidor.', m);

      // enviar privado al owner que pide (m.sender)
      const caption = `Archivo: ${item.filename}\nID: ${item.id}\nFrom: ${item.from}\nGroup: ${item.groupName || item.groupId}\nDate: ${item.date}`;
      const buffer = fs.readFileSync(filepath);

      if (item.type === 'image') {
        await conn.sendMessage(m.sender, { image: buffer, caption }, { quoted: m });
      } else if (item.type === 'video') {
        await conn.sendMessage(m.sender, { video: buffer, caption, fileName: item.filename }, { quoted: m });
      } else if (item.type === 'audio') {
        await conn.sendMessage(m.sender, { audio: buffer, ptt: false, fileName: item.filename }, { quoted: m });
      } else {
        // documento para cualquier otro tipo
        await conn.sendMessage(m.sender, { document: buffer, fileName: item.filename, mimetype: 'application/octet-stream', caption }, { quoted: m });
      }
      return;
    }

    // ayuda
    conn.reply(m.chat, 'Uso:\n- medias o medias list -> lista archivos\n- media <id> -> envía el archivo por privado\nEj: media 3', m);
  } catch (e) {
    console.error(e);
    m.reply('Error ejecutando comando.');
  }
};

handler.help = ['medias','media'];
handler.tags = ['owner'];
handler.command = [/^medias?$/i, /^media$/i];
handler.owner = true; // marca owner-only
export default handler;
