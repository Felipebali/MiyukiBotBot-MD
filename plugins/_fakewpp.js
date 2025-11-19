import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'

let handler = async (m, { conn, text, usedPrefix }) => {
const ctxErr = (global.rcanalx || {})
const ctxWarn = (global.rcanalw || {})
const ctxOk = (global.rcanalr || {})

try {
// Verificar si se proporcionó texto
if (!text) {
return await conn.reply(m.chat,
"📱 *Crear Captura iPhone WhatsApp*\n\n" +
"💡 *Uso:*.fakewpp <texto>\n" +
"📝 *Ejemplo:*.fakewpp Hola, ¿cómo estás?\n\n" +
"🕒 *Hora automática:* Se detecta tu zona horaria",
m, ctxWarn
)
}

await conn.reply(m.chat, '🎀 Creando captura de iPhone...', m, ctxOk)  

// Detectar país y zona horaria del usuario  
let userTimeZone = 'America/Mexico_City' // Por defecto  

try {  
  if (m.sender) {  
    const countryCode = m.sender.split('@')[0].slice(0, 3)  
    const timeZones = {  
      '521': 'America/Mexico_City',  
      '549': 'America/Argentina/Buenos_Aires',  
      '541': 'America/Argentina/Buenos_Aires',  
      '593': 'America/Guayaquil',  
      '591': 'America/La_Paz',  
      '573': 'America/Bogota',  
      '507': 'America/Panama',  
      '506': 'America/Costa_Rica',  
      '503': 'America/El_Salvador',  
      '502': 'America/Guatemala',  
      '501': 'America/Belize',  
      '505': 'America/Managua',  
      '504': 'America/Tegucigalpa',  
      '598': 'America/Montevideo',  
      '595': 'America/Asuncion',  
      '562': 'America/Santiago',  
      '511': 'America/Lima',  
      '51': 'America/Lima',  
      '52': 'America/Mexico_City',  
      '53': 'America/Havana',  
      '54': 'America/Argentina/Buenos_Aires',  
      '55': 'America/Sao_Paulo',  
      '56': 'America/Santiago',  
      '57': 'America/Bogota',  
      '58': 'America/Caracas',  
      '34': 'Europe/Madrid',  
      '1': 'America/New_York',  
      '44': 'Europe/London',  
    }  
    userTimeZone = timeZones[countryCode] || 'America/Mexico_City'  
  }  
} catch (e) {  
  userTimeZone = 'America/Mexico_City'  
}  

// Obtener hora actual según la zona horaria detectada  
let horaUsuario = new Date().toLocaleTimeString('es-ES', {  
  timeZone: userTimeZone,  
  hour: '2-digit',  
  minute: '2-digit',  
  hour12: false  
})  

// Formatear hora en 12h  
let horaFormateada = new Date().toLocaleTimeString('es-ES', {  
  timeZone: userTimeZone,  
  hour: '2-digit',  
  minute: '2-digit',  
  hour12: true  
})  

// URL de la API  
let apiUrl = `https://api.zenzxz.my.id/api/maker/fakechatiphone?text=${encodeURIComponent(text)}&chatime=${encodeURIComponent(horaUsuario)}&statusbartime=${encodeURIComponent(horaUsuario)}`  

// Enviar la imagen  
await conn.sendFile(m.chat, apiUrl, 'fakewpp.jpg',  
  `📱 *Captura iPhone WhatsApp*\n\n` +  
  `💬 *Mensaje:* ${text}\n` +  
  `🕒 *Hora:* ${horaFormateada}\n` +  
  `🌍 *Zona horaria detectada*\n\n` +  
  `✨ *Captura generada exitosamente*`,  
  m, ctxOk  
)  

} catch (error) {
console.error('Error en fakewpp:', error)
await conn.reply(m.chat,
"❌ *Error al crear captura*\n\n" +
"🔧 *Detalle:* ${error.message}\n\n" +
"💡 *Solución:* Intenta con un texto más corto o vuelve a intentarlo",
m, ctxErr
)
}
}

handler.help = ['fakewpp']
handler.tags = ['maker']
handler.command = ['fakewpp', 'fakeiphone', 'fakewhatsapp', 'iphonefake']

export default handler
