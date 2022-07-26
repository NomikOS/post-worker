import yenv from 'yenv'
process.env.NODE_ENV = process.env.NODE_ENV || 'local'

/**
 * We just export what `yenv()` returns.
 * `keyblade` will make sure we don't rely on undefined values.
 */
export const env = yenv('env.yaml', {
  cwd: process.env.NODE_APP_PATH,
  message: (key) => `[yenv] ${key} not found in the loaded environment`,
  logBeforeThrow: (message) => console.warn({ message })
})
