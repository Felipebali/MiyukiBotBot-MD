// 🚪 _sacame.js — "sacame" sin prefijo (solo para dueños)

const localOwners = [
  '59898719147@s.whatsapp.net', // Feli 💛
  '59896026646@s.whatsapp.net',  // G 🐾
  '59892363485@s.whatsapp.net' // Benja
];

const despedidas = [
  '👋 Hasta luego, jefe.',
  '💨 Ejecutando orden: expulsión inmediata.',
  '😼 El dueño pidió salir... acatando órdenes.',
  '🚪 Salida elegante activada.',
  '🌀 Desapareciendo del grupo... como todo un líder.',
  '🧞‍♂️ Tu deseo es mi orden, maestro.',
  '🐾 FelixCat obedece a su creador.',
  '💫 Adiós, patrón. Que el grupo te recuerde.',
  '🔥 Sacado con estilo y autoridad.',
  '📦 Dueño removido bajo su propia voluntad.'
];

let handler = async (m, { conn, isBotAdmin }) => {
  try {
    if (!m.isGroup) return; // Solo en grupos

    const texto = (m.text || '').trim().toLowerCase();
    if (texto !== 'sacame') return; // Solo si el mensaje es "sacame"

    // Combinar dueños globales + locales
    const allOwners = [
      ...(global.owner?.map?.(o => (Array.isArray(o) ? o[0] : o)) || []),
      ...localOwners
    ].map(o => (o.endsWith('@s.whatsapp.net') ? o : `${o}@s.whatsapp.net`));

    // Verificar si el autor es owner
    if (!allOwners.includes(m.sender)) return;

    // Comprobar si el bot es admin
    if (!isBotAdmin)
      return m.reply('❌ No puedo sacarte porque no soy administrador.');

    // Seleccionar frase aleatoria
    const frase = despedidas[Math.floor(Math.random() * despedidas.length)];

    // Enviar mensaje sin responder ni reaccionar
    await conn.sendMessage(m.chat, { text: frase }, { quoted: null });

    // Esperar antes de expulsar
    await new Promise(res => setTimeout(res, 1000));

    // Expulsar al dueño
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

  } catch (err) {
    console.error('⚠️ Error en comando sacame:', err);
  }
};

// Detecta el mensaje sin prefijo
handler.customPrefix = /^sacame$/i;
handler.command = new RegExp();
handler.group = true;

export default handler;
