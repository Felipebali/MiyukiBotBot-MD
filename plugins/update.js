import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const SNAPSHOT = '.last_update_snapshot.json'
const REPO = 'https://github.com/Felipebali/Mi-gaara-bot.git'

function scanPlugins() {
  const dir = path.join(process.cwd(), 'plugins')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.js'))
    .sort()
    .map(f => ({
      name: f,
      mtime: fs.statSync(path.join(dir, f)).mtimeMs
    }))
}

let handler = async (m, { conn }) => {
  const startTime = Date.now()
  let msg = '🔄 *Verificando actualizaciones del bot...*\n\n'
  let hasUpdates = false

  try {
    // 🛡️ Respaldos
    const backupFiles = ['config.js', '.env', 'owner-ban.js', 'grupo-warn.js']
    const backupDirs = ['GaaraSessions']
    const backups = {}

    backupFiles.forEach(f => { if (fs.existsSync(f)) backups[f] = fs.readFileSync(f) })
    backupDirs.forEach(d => {
      if (fs.existsSync(d)) {
        backups[d] = fs.readdirSync(d).reduce((acc, file) => {
          acc[file] = fs.readFileSync(path.join(d, file))
          return acc
        }, {})
      }
    })

    try { execSync('git init', { stdio: 'ignore' }) } catch {}
    try { execSync(`git remote add origin ${REPO}`, { stdio: 'ignore' }) } catch {}

    execSync('git fetch origin main', { stdio: 'ignore' })

    const lastCommit = execSync('git log -1 origin/main --pretty=format:"%h - %s"', { encoding: 'utf8' })
    msg += `📦 *Último commit remoto:*\n${lastCommit}\n\n`

    const diff = execSync('git diff --name-status origin/main', { encoding: 'utf8' }).trim()
    if (diff) hasUpdates = true

    if (hasUpdates) {
      execSync('git reset --hard origin/main', { stdio: 'ignore' })
      Object.keys(backups).forEach(f => {
        if (backupDirs.includes(f)) {
          if (!fs.existsSync(f)) fs.mkdirSync(f)
          Object.keys(backups[f]).forEach(file => {
            fs.writeFileSync(path.join(f, file), backups[f][file])
          })
        } else fs.writeFileSync(f, backups[f])
      })
      msg += '✅ *Bot actualizado correctamente.*\n🛡️ Archivos protegidos restaurados.\n\n'
    } else {
      msg += '🟡 *El bot ya estaba actualizado. No se aplicaron cambios.*\n\n'
    }

  } catch (err) {
    msg += `❌ *Error durante actualización:*\n${err.message}\n\n`
  }

  let before = []
  if (fs.existsSync(SNAPSHOT)) {
    try { before = JSON.parse(fs.readFileSync(SNAPSHOT)) } catch {}
  }

  const now = scanPlugins()
  const added = now.filter(n => !before.find(b => b.name === n.name))
  const removed = before.filter(b => !now.find(n => n.name === b.name))
  const modified = now.filter(n => {
    const b = before.find(b => b.name === n.name)
    return b && b.mtime !== n.mtime
  })

  if (added.length || removed.length || modified.length) {
    msg += '🧩 *Cambios en plugins:*\n'
    added.forEach(p => msg += `• ➕ ${p.name}\n`)
    removed.forEach(p => msg += `• ❌ ${p.name} (eliminado)\n`)
    modified.forEach(p => msg += `• ✏️ ${p.name} (modificado)\n`)
    msg += '\n'
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(now, null, 2))

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  msg += `📊 *Resumen:*\n`
  msg += `• Actualización aplicada: ${hasUpdates ? '🟢 Sí' : '🟡 No'}\n`
  msg += `• Plugins añadidos: ${added.length}\n`
  msg += `• Plugins eliminados: ${removed.length}\n`
  msg += `• Plugins modificados: ${modified.length}\n`
  msg += `• Fecha: ${new Date().toLocaleString()}\n`
  msg += `⏱ Tiempo total: ${duration}s\n\n`

  msg += hasUpdates
    ? '🟢 *Estado del bot: ACTUALIZADO Y ESTABLE*'
    : '🟡 *Estado del bot: SIN CAMBIOS*'

  await conn.reply(m.chat, msg, m)
}

handler.command = ['update', 'up']
handler.rowner = true
export default handler
