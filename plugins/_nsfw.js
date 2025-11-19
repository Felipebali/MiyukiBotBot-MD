const handler = async (m, { conn, isOwner }) => {
    let chat = global.db.data.chats[m.chat];

    // Inicializamos NSFW si no existe
    if (chat.nsfw === undefined) chat.nsfw = false;

    // Solo owners pueden cambiarlo
    if (!isOwner) {
        await conn.sendMessage(m.chat, { text: '❌ Solo los dueños del bot pueden activar o desactivar NSFW.' });
        return;
    }

    // Alternar estado NSFW
    chat.nsfw = !chat.nsfw;

    // Mensaje de confirmación sin citar + reacción 🔞
    await conn.sendMessage(m.chat, { text: `⚡️ La función *NSFW* se *${chat.nsfw ? 'activó' : 'desactivó'}* para este chat.` });
    await conn.sendMessage(m.chat, { react: { text: '🔞', key: m.key } });
};

// Función global para bloquear plugins NSFW si NSFW está desactivado
export async function before(m, { conn }) {
    let chat = global.db.data.chats[m.chat];

    // Inicializamos NSFW si no existe
    if (chat.nsfw === undefined) chat.nsfw = false;

    // Lista de comandos NSFW
    const nsfwCommands = [
        'kiss18', 
        'pene',
        'suckboobs', 'chupatetas', 
        'violar', 'perra', 
        'pussy', 'coño', 
        'speak', 'nalgada', 
        'footjob', 'pies', 
        'sixnine', '69',
        'anal', 'culiar',
        'blowjob', 'mamada',
        'follar',
        'grabboobs', 'agarrartetas',
        'searchhentai',
        'hentaisearch',
        'penetrar',
        'sexo', 'sex',
        'tetas', 'cum' 
    ];

    if (!chat.nsfw && nsfwCommands.includes(m.command?.toLowerCase())) {
        await conn.sendMessage(m.chat, { text: '❌ Los comandos NSFW están desactivados en este chat.' });
        return false;
    }

    return true; // Permite los demás comandos
}

handler.help = ['nsfw'];
handler.tags = ['owner'];
handler.command = ['nsfw'];

export default handler;
