// plugins/_asustar.js
/**
 * Comando: .asusta | .aviso | .desmarco
 * Solo owners — menciona a todos (oculto mediante 'mentions')
 * Compatible con "type": "module"
 */

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net', '59892363485@s.whatsapp.net']; // dueños

const handler = async (m, { conn }) => {
  try {
    if (!m.isGroup)
      return conn.sendMessage(m.chat, { text: '❗ Este comando solo funciona en grupos.' });

    if (!ownerNumbers.includes(m.sender))
      return conn.sendMessage(m.chat, { text: '👑 Solo los dueños del bot pueden usar este comando.' });

    // Obtener metadata del grupo y construir lista de mentions
    let mentions = [];
    try {
      const metadata = await conn.groupMetadata(m.chat);
      // metadata.participants es array de objetos con 'id' o 'jid' según la implementación
      mentions = (metadata?.participants || []).map(p => (p.id || p.jid || p));
      // Asegurarse de que el owner que ejecuta también esté incluido (por si acaso)
      if (!mentions.includes(m.sender)) mentions.push(m.sender);
    } catch (err) {
      // Si falla obtener metadata, intentamos usar m.quoted/other fallback
      console.error('No se pudo obtener metadata del grupo:', err);
      // intento básico: usar sólo al que ejecuta (evita fallos)
      mentions = [m.sender];
    }

    const texto = `*Ante cualquier investigación judicial o intervención realizada sobre este grupo y otros grupos, dejo por escrito que repudio cualquier contenido homofóbico, racista, xenófobo, nazi, comunista o fascista que se haya compartido en este grupo.*\n\n*No me asocio de ninguna manera con esas ideologías y me desmarco completamente de ellas. Tampoco tengo relación alguna con los demás participantes.*`;

    // Enviamos el texto y añadimos el array 'mentions' para etiquetar a todos sin mostrarlos explícitamente en el texto.
    await conn.sendMessage(m.chat, { text: texto, mentions });

    // reacción opcional si la librería la soporta
    try {
      await conn.sendMessage(m.chat, { react: { text: '⚖️', key: m.key } });
    } catch {}

  } catch (e) {
    console.error(e);
    try { await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al enviar el mensaje.' }); } catch {}
  }
};

handler.help = ['asusta', 'aviso', 'desmarco'];
handler.tags = ['owner'];
handler.command = /^(asusta|aviso|desmarco)$/i;
handler.group = true;
// indica que solo los owners pueden ejecutarlo (usa la convención de tu bot)
handler.rowner = true;

export default handler;
