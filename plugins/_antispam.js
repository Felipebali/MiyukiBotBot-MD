// plugins/antispam.js
const userSpamData = {};

let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isOwner }) {
    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.antiSpam) return; // Solo si el antiSpam está activado

    const who = m.sender;
    const currentTime = Date.now();
    const timeWindow = 4000; // 4 segundos
    const messageLimit = 3;  // máximo 3 mensajes en ese tiempo
    const warningLimit = 2;  // 2 advertencias antes del kick

    if (!(who in userSpamData)) {
        userSpamData[who] = { lastMessageTime: currentTime, messageCount: 1, warnings: 0 };
        return;
    }

    const userData = userSpamData[who];
    const timeDifference = currentTime - userData.lastMessageTime;

    if (timeDifference <= timeWindow) {
        userData.messageCount++;

        if (userData.messageCount >= messageLimit) {
            const mention = `@${who.split('@')[0]}`;
            let warningMessage = '';

            if (isOwner) {
                warningMessage = `👑 *Owner alerta*\n${mention}, estás enviando demasiados mensajes, pero no puedo kickearte.`;
                await conn.sendMessage(m.chat, { text: warningMessage, mentions: [who] });
            } else if (isAdmin) {
                warningMessage = `⚡️ *Admin alerta*\n${mention}, estás enviando mensajes demasiado rápido.`;
                await conn.sendMessage(m.chat, { text: warningMessage, mentions: [who] });
            } else {
                userData.warnings++;

                if (userData.warnings >= warningLimit) {
                    try {
                        const groupMetadata = await conn.groupMetadata(m.chat);
                        const botNumber = conn.user?.id || conn.user?.jid;

                        // ✅ Detecta si el bot es admin de verdad
                        const isBotAdmin = groupMetadata.participants.some(
                            p => (p.id === botNumber || p.jid === botNumber) &&
                                 (p.admin === 'admin' || p.admin === 'superadmin')
                        );

                        if (isBotAdmin) {
                            await conn.sendMessage(m.chat, {
                                text: `❌ *Límite de spam alcanzado*\n${mention} será *expulsado automáticamente* por spam.`,
                                mentions: [who]
                            });

                            // 🦶 Expulsión inmediata
                            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
                        } else {
                            await conn.sendMessage(m.chat, {
                                text: `⚠️ No puedo expulsar a ${mention} porque *no soy admin*.`,
                                mentions: [who]
                            });
                        }
                    } catch (err) {
                        await conn.sendMessage(m.chat, {
                            text: `⚠️ Error al intentar expulsar a ${mention}: ${err.message}`,
                            mentions: [who]
                        });
                    }

                    userData.warnings = 0; // reinicia después del kick
                } else {
                    warningMessage = `🚨 *Advertencia por spam*\n${mention}, evita enviar tantos mensajes.\n⚠️ Advertencia ${userData.warnings}/${warningLimit}`;
                    await conn.sendMessage(m.chat, { text: warningMessage, mentions: [who] });
                }
            }

            userData.messageCount = 0;
            userData.lastMessageTime = currentTime;
        }
    } else {
        userData.messageCount = 1;
        userData.lastMessageTime = currentTime;
    }
};

export default handler;
