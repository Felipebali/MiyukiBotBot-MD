// 📂 plugins/doxear.js — DOX falso hiperrealista (solo ROOT OWNERS reales)

// Bloques IP Uruguay + ASN correctos (solo imitación)
const uruguayProviders = [
  { name: "Antel", ipStart: "179.27", asn: "AS6057", org: "Administración Nacional de Telecomunicaciones" },
  { name: "Claro Uruguay", ipStart: "190.64", asn: "AS27862", org: "América Móvil Uruguay" },
  { name: "Movistar Uruguay", ipStart: "186.52", asn: "AS28000", org: "Telefónica Móviles Uruguay" }
]

function randomProvider() {
  return uruguayProviders[Math.floor(Math.random() * uruguayProviders.length)]
}

function randomIP(prefix) {
  return `${prefix}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

function randomAddress() {
  const dirs = [
    "Av. Italia 4123, Parque Batlle, Montevideo",
    "Bvar. Artigas 2567, Tres Cruces, Montevideo",
    "Av. Roosevelt 3201, Punta del Este, Maldonado",
    "Calle 18 de Julio 1445, Centro, Maldonado",
    "Sarandí 1320, Salto",
    "Av. Lavalleja 2101, Rivera"
  ]
  return dirs[Math.floor(Math.random() * dirs.length)]
}

// Coordenadas falsas Montevideo/Maldonado 70%
function randomCoordinates() {
  if (Math.random() < 0.7) {
    const zones = [
      { lat: -34.905, lon: -56.191 },
      { lat: -34.897, lon: -56.164 },
      { lat: -34.916, lon: -56.159 },
      { lat: -34.962, lon: -54.948 }
    ]
    const z = zones[Math.floor(Math.random() * zones.length)]
    return { lat: z.lat + Math.random() * 0.01, lon: z.lon + Math.random() * 0.01 }
  }

  const zones2 = [
    { lat: -32.320, lon: -58.075 },
    { lat: -31.383, lon: -57.960 },
    { lat: -30.910, lon: -55.550 }
  ]
  const z = zones2[Math.floor(Math.random() * zones2.length)]
  return { lat: z.lat + Math.random() * 0.01, lon: z.lon + Math.random() * 0.01 }
}

let handler = async (m, { conn, text }) => {
  try {
    // 🔐 ROOT OWNERS reales desde config.js (blindado)
    const owners = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string' && typeof v !== 'number') return null
      return String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }).filter(Boolean)

    const sender = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    if (!owners.includes(sender)) return

    let who
    if (m.isGroup) {
      if (m.mentionedJid?.length) who = m.mentionedJid[0]
      else if (m.quoted?.sender) who = m.quoted.sender
    }

    if (!who && text) {
      const num = text.replace(/[^0-9]/g, "")
      if (num) who = `${num}@s.whatsapp.net`
    }

    if (!who) who = m.sender

    let realLoc = null
    if (m.quoted?.message?.locationMessage) {
      realLoc = {
        lat: m.quoted.message.locationMessage.degreesLatitude,
        lon: m.quoted.message.locationMessage.degreesLongitude,
        name: m.quoted.message.locationMessage.name || "Ubicación enviada"
      }
    }

    const prov = randomProvider()
    const fakeIP = randomIP(prov.ipStart)
    const fakeAddress = randomAddress()
    const fakeCoords = randomCoordinates()
    const now = new Date().toLocaleString("es-UY", { timeZone: "America/Montevideo" })

    let msg

    if (realLoc) {
      msg = `📡 *OSINT GEOLOCATION REPORT*
──────────────────────────
👤 *Objetivo:* @${who.split('@')[0]}
🕒 *Timestamp:* ${now}

📍 *Coordenadas reales detectadas:*
• Lat: ${realLoc.lat}
• Lon: ${realLoc.lon}
• Punto: ${realLoc.name}

🌐 *Red*:
• IP aproximada: ${fakeIP}
• ASN: ${prov.asn}
• Organización: ${prov.org}

🏠 *Dirección estimada:*
${fakeAddress}
──────────────────────────`
    } else {
      msg = `📡 *OSINT GEOLOCATION REPORT*
──────────────────────────
👤 *Objetivo:* @${who.split('@')[0]}
🕒 *Timestamp:* ${now}

🌐 *Red*
• IP: ${fakeIP}
• ASN: ${prov.asn}
• ISP: ${prov.name}

📍 *Coordenadas aproximadas:*
• Lat: ${fakeCoords.lat.toFixed(6)}
• Lon: ${fakeCoords.lon.toFixed(6)}

🏠 *Dirección asociada:*
${fakeAddress}
──────────────────────────`
    }

    await conn.sendMessage(m.chat, {
      text: msg,
      mentions: [who],
      quoted: m
    })

  } catch (e) {
    console.error('Error en doxear:', e)
  }
}

handler.command = ['doxear']
handler.tags = ['owner']

export default handler
