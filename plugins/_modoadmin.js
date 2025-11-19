// 📂 plugins/_modoadmin-filter.js
let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat || !chat.modoadmin) return; // Si no está activado, no bloquea nada

  // Ignorar mensajes sin texto
  if (!m.text) return;
  const body = m.text.trim();

  // Si el mensaje empieza con el prefijo del bot (.)
  if (body.startsWith('.')) {
    const command = body.slice(1).split(' ')[0].toLowerCase();

    // Excepciones: estos comandos sí pueden usarse aunque el modo admin esté activado
    const permitidos = ['modoadmin', 'menu']; // podés agregar más si querés

    if (permitidos.includes(command)) return;

    // Si no es admin ni owner → bloquea el comando y avisa
    if (!(isAdmin || isOwner)) {
      await conn.reply(
        m.chat,
        `🚫 *Modo Admin Activado*\nSolo los administradores pueden usar comandos mientras este modo esté activo.\n\nComando bloqueado: *.${command}*`,
        m
      );
      return !0; // Detiene la ejecución de otros comandos
    }
  }
};

export default handler;
