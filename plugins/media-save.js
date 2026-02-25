import fs from 'fs';
import path from 'path';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const MEDIA_DB_FILE = './database/media.json';

const handler = {};
handler.all = async function (m) {
  try {
    if (!m.message) return;

    // ── Crear carpeta si no existe
    const mediaFolder = './media';
    if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder);

    // ── Asegurar DB persistente
    if (!global.db.data) global.db.data = {};
    if (!global.db.data.mediaList) {
      // Cargar media.json si existe
      if (fs.existsSync(MEDIA_DB_FILE)) {
        try {
          global.db.data.mediaList = JSON.parse(fs.readFileSync(MEDIA_DB_FILE));
        } catch {
          global.db.data.mediaList = [];
        }
      } else {
        global.db.data.mediaList = [];
      }
    }

    // ── Detectar tipo de media
    const mtype = m.mtype;
    let type = null;
    if (mtype === 'imageMessage') type = 'image';
    else if (mtype === 'videoMessage') type = 'video';
    else if (mtype === 'audioMessage') type = 'audio';
    else if (mtype === 'documentMessage') type = 'document';
    else return;

    // ── Descargar media
    const buffer = await downloadMediaMessage(m, 'buffer');
    if (!buffer) return;

    // ── Nombre del archivo
    const filename = `${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    const extension =
      type === 'image' ? '.jpg' :
      type === 'video' ? '.mp4' :
      type === 'audio' ? '.mp3' :
      type === 'document' ? `_${m.message.documentMessage?.fileName || 'file'}` : '';

    const finalName = filename + extension;
    const filepath = path.join(mediaFolder, finalName);

    // ── Guardar archivo
    fs.writeFileSync(filepath, buffer);

    // ── Obtener info del grupo
    let chatInfo = null;
    if (m.isGroup) {
      try { chatInfo = await this.groupMetadata(m.chat); } catch { chatInfo = null; }
    }

    // ── Crear registro
    const entry = {
      id: global.db.data.mediaList.length + 1,
      filename: finalName,
      path: filepath,
      type,
      from: m.sender,
      groupId: m.isGroup ? m.chat : null,
      groupName: m.isGroup ? (chatInfo?.subject || '') : null,
      date: new Date().toLocaleString()
    };

    global.db.data.mediaList.push(entry);

    // ── Guardar persistente en media.json
    fs.writeFileSync(MEDIA_DB_FILE, JSON.stringify(global.db.data.mediaList, null, 2));

    console.log("[MEDIA GUARDADO]:", entry);

  } catch (e) {
    console.error("ERROR guardando media:", e);
  }
};

export default handler;
