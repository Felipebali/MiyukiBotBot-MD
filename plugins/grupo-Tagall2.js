// plugins/tagallT.js
// Activador: letra "T" o "t" (sin prefijo)
// Solo ADMIN o OWNER puede activarlo
// Mención visible a un usuario al azar + mención oculta a todos los demás

let handler = async (m, { conn, groupMetadata, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return; // Solo grupos
    if (!isAdmin && !isOwner) return; // Solo admin u owner

    const texto = (m.text || '').trim();
    if (!texto || texto.toLowerCase() !== 't') return; // Activador: T o t

    const participantes = (groupMetadata?.participants || [])
      .map(p => (conn.decodeJid ? conn.decodeJid(p.id) : p.id))
      .filter(Boolean);

    if (participantes.length < 2) {
      return conn.sendMessage(m.chat, { text: '❌ No hay suficientes miembros detectables.' });
    }

    // Elegir usuario visible
    const usuarioAzar = participantes[Math.floor(Math.random() * participantes.length)];
    const mencionesOcultas = participantes.filter(u => u !== usuarioAzar);

    // 💬 Frases más naturales y coherentes
    const frases = [
      `📢 Parece que @${usuarioAzar.split('@')[0]} quiso asegurarse de que nadie se quede dormido 😴`,
      `👀 @${usuarioAzar.split('@')[0]} tocó la letra mágica... y ahora todos fueron notificados 💬`,
      `💡 @${usuarioAzar.split('@')[0]} pensó que sería buena idea avisar a todos 😅`,
      `⚡ @${usuarioAzar.split('@')[0]} activó el modo “presente o expulsado” 😆`,
      `🔥 @${usuarioAzar.split('@')[0]} encendió el grupo con una sola letra 😎`,
      `😂 Todo indica que @${usuarioAzar.split('@')[0]} tenía ganas de charlar con todos 📲`,
      `📣 @${usuarioAzar.split('@')[0]} convocó reunión de emergencia sin previo aviso 😬`,
      `😏 @${usuarioAzar.split('@')[0]} soltó la T y ahora nadie se salva de las notificaciones 💥`,
      `🫢 Alguien diga algo... @${usuarioAzar.split('@')[0]} acaba de despertar el grupo 👋`,
      `😄 @${usuarioAzar.split('@')[0]} quiso probar si la T funcionaba... y vaya si funcionó 🚀`,
      `🗣️ “Solo una letra”, dijo @${usuarioAzar.split('@')[0]}... y notificó a medio planeta 🌍`,
      `👋 @${usuarioAzar.split('@')[0]} te acaba de recordar que este grupo sigue vivo 💬`,
      `💬 @${usuarioAzar.split('@')[0]} mandó un saludo global. Todos quedaron etiquetados 😄`,
      `🕹️ @${usuarioAzar.split('@')[0]} activó la función secreta del grupo. Todos atentos 👀`,
      `📌 @${usuarioAzar.split('@')[0]} rompió el silencio del grupo con una simple T 🔊`,
      `😹 @${usuarioAzar.split('@')[0]} dijo “T” y ahora nadie puede hacerse el distraído 😅`,
      `🫡 @${usuarioAzar.split('@')[0]} pidió presencia general. Reportarse, soldados 💂‍♂️`,
      `🎯 @${usuarioAzar.split('@')[0]} logró lo imposible: que todos sean mencionados al mismo tiempo 😂`,
      `📲 @${usuarioAzar.split('@')[0]} activó notificaciones masivas. Buena suerte con eso 😆`,
      `😎 @${usuarioAzar.split('@')[0]} movió una letra y encendió todo el grupo 🔥`
    ];

    const mensaje = frases[Math.floor(Math.random() * frases.length)];

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [usuarioAzar, ...mencionesOcultas]
    });

  } catch (err) {
    console.error('tagallT error:', err);
    conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al ejecutar el comando T.' });
  }
};

// Detecta "T" o "t" sin prefijo
handler.customPrefix = /^\s*t\s*$/i;
handler.command = [''];
handler.group = true;

export default handler;
