// ============================
// MiyukiBot-MD - index.js
// Versión lista para Termux, Node.js 24+
// ============================

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

import './settings.js'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, existsSync, mkdirSync, unlinkSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import pino from 'pino'
import path, { join } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import store from './lib/store.js'
import NodeCache from 'node-cache'
import readline from 'readline'
import { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, DisconnectReason } from '@whiskeysockets/baileys'

const { chain } = lodash
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

// ============================
// Inicialización de variables globales
// ============================
global.rcanal = {}
global.jadi = 'Jadibot'
global.sessions = 'Sessions'
global.shadow_xyzJadibts = false
global.tmp = 'tmp'
global.ch = {}
global.support = {}
global.db = new Low(new JSONFile('database.json'))
global.DATABASE = global.db
global.plugins = {}

// ============================
// Cargar base de datos
// ============================
global.loadDatabase = async function loadDatabase() {
    if (!global.db.data) {
        await global.db.read().catch(console.error)
        global.db.data = {
            users: {},
            chats: {},
            settings: {},
            ...(global.db.data || {}),
        }
        global.db.chain = chain(global.db.data)
    }
}
await global.loadDatabase()

// ============================
// Configuración de prefijo y opciones
// ============================
global.opts = yargs(process.argv.slice(2)).exitProcess(false).parse()
global.prefix = new RegExp('^[#!./-]')

// ============================
// Inicializar CFonts
// ============================
let { say } = cfonts
console.log(chalk.magentaBright('\n❀ Iniciando...'))
say('MiyukiBot-MD', {
    font: 'simple',
    align: 'left',
    gradient: ['green', 'white']
})
say('Powered By OmarGranda', {
    font: 'console',
    align: 'center',
    colors: ['cyan', 'magenta', 'yellow']
})

// ============================
// Prototipos
// ============================
protoType()
serialize()

// ============================
// Función para importar require en ESModules
// ============================
global.__require = function require(dir = import.meta.url) {
    return createRequire(dir)
}

// ============================
// Configurar auth de WhatsApp
// ============================
const { state, saveState, saveCreds } = await useMultiFileAuthState(global.sessions)
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const { version } = await fetchLatestBaileysVersion()

const connectionOptions = {
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })) },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    msgRetryCounterCache,
    userDevicesCache,
    defaultQueryTimeoutMs: undefined,
    cachedGroupMetadata: (jid) => global.conn?.chats[jid] ?? {},
    version,
    keepAliveIntervalMs: 55000,
    maxIdleTimeMs: 60000
}

global.conn = makeWASocket(connectionOptions)
conn.ev.on('creds.update', saveCreds)

// ============================
// Inicializar carpeta tmp
// ============================
if (!existsSync(global.tmp)) mkdirSync(global.tmp, { recursive: true })

setInterval(() => {
    try {
        const files = readdirSync(global.tmp)
        files.forEach(f => unlinkSync(join(global.tmp, f)))
        console.log(chalk.gray(`→ Archivos de TMP eliminados`))
    } catch {}
}, 30 * 1000)

// ============================
// Cargar plugins
// ============================
const pluginFolder = join(__dirname, 'plugins')
const pluginFilter = (file) => file.endsWith('.js')

async function filesInit() {
    for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
        try {
            const file = join(pluginFolder, filename)
            const module = await import(`${file}?update=${Date.now()}`)
            global.plugins[filename] = module.default || module
        } catch (e) {
            conn.logger.error(e)
        }
    }
}
await filesInit()

// Vigilar cambios en plugins
watch(pluginFolder, async (filename) => {
    if (pluginFilter(filename)) {
        const file = join(pluginFolder, filename)
        if (existsSync(file)) {
            try {
                const module = await import(`${file}?update=${Date.now()}`)
                global.plugins[filename] = module.default || module
                console.log(chalk.green(`→ Plugin actualizado: ${filename}`))
            } catch (e) {
                console.error(e)
            }
        } else {
            delete global.plugins[filename]
            console.log(chalk.yellow(`→ Plugin eliminado: ${filename}`))
        }
    }
})

// ============================
// Manejo de errores
// ============================
process.on('uncaughtException', console.error)
process.on('unhandledRejection', (reason, promise) => console.error('Rechazo no manejado detectado:', reason))

console.log(chalk.green.bold(`✅ MiyukiBot-MD listo para usarse`))
