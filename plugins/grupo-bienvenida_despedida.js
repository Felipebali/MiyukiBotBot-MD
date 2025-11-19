// plugins/grupo-bienvenida_despedida.js
export function setupWelcomeBye(conn) {
  // Escucha los cambios de participantes en grupos
  conn.ev.on('group-participants.update', async (update) => {
    try {
      const groupMetadata = await conn.groupMetadata(update.id);
      const groupName = groupMetadata.subject;

      for (const participant of update.participants) {
        // Bienvenida
        if (update.action === 'add') {
          const welcomeMessage = `🎉 ¡Bienvenido/a @${participant.split('@')[0]} al grupo *${groupName}*! Disfruta tu estadía.`;
          await conn.sendMessage(update.id, { text: welcomeMessage, mentions: [participant] });
        }

        // Despedida
        if (update.action === 'remove') {
          const byeMessage = `😢 @${participant.split('@')[0]} ha salido del grupo *${groupName}*.`;
          await conn.sendMessage(update.id, { text: byeMessage, mentions: [participant] });
        }
      }
    } catch (err) {
      console.error('Error en plugin de bienvenida/despedida:', err);
    }
  });
}
