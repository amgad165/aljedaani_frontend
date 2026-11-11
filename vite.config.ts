import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// Obfuscate only the chunk(s) that carry the license-protection logic, so the
// signature check is hard to find and edit without slowing down or breaking
// the rest of the bundle (React, vendor code stay untouched). Enabled with
// VITE_OBFUSCATE=1 for client deliveries; off for normal/dev builds so the app
// stays easy to verify. The obfuscator is imported lazily so a normal build
// never needs the package.
function obfuscateLicense(): Plugin {
  return {
    name: 'obfuscate-license',
    apply: 'build',
    enforce: 'post',
    async renderChunk(code, chunk) {
      if (process.env.VITE_OBFUSCATE !== '1') return null
      const touchesLicense = Object.keys(chunk.modules).some((id) => id.includes('/license/'))
      if (!touchesLicense) return null

      // Runtime specifier so tsc does not require the package for normal builds.
      const moduleName = 'javascript-obfuscator'
      type Obfuscator = { obfuscate: (c: string, o: Record<string, unknown>) => { getObfuscatedCode: () => string } }
      let obfuscator: Obfuscator
      try {
        const mod = (await import(/* @vite-ignore */ moduleName)) as unknown as Obfuscator & { default?: Obfuscator }
        // The package is CommonJS: the functions sit on `.default` after import.
        obfuscator = typeof mod.obfuscate === 'function' ? mod : (mod.default as Obfuscator)
      } catch {
        this.warn('VITE_OBFUSCATE=1 but javascript-obfuscator is not installed; skipping.')
        return null
      }

      const result = obfuscator.obfuscate(code, {
        compact: true,
        identifierNamesGenerator: 'hexadecimal',
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        selfDefending: process.env.VITE_SELF_DEFEND === '1',
        renameGlobals: false,
        sourceMap: false,
      })
      return { code: result.getObfuscatedCode(), map: null }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), obfuscateLicense()],
  build: {
    chunkSizeWarningLimit: 1000,
    // No source maps in production: don't ship a map back to the original
    // source of the protection code.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep the license-protection code in its own chunk so the obfuscator
        // (VITE_OBFUSCATE=1) only has to transform that small file, not the
        // whole app bundle.
        manualChunks(id) {
          if (id.includes('/src/license/')) return 'license'
        },
      },
    },
  },
})
