import { defineConfig } from 'tsdown'

const config = {
  sourcemap: true,
  shims: true,
  minify: false,
  treeshake: false,
  env: {
    NODE_ENV: 'production',
    SFDX_DISABLE_LOG_FILE: 'true',
    DEBUG: false
  },
  nodeProtocol: true,
  tsconfig: './tsconfig.json',
  inputOptions: {
    keepNames: true,
  },
};

export default defineConfig([
  {
    entry: { 
      'sass-compiler': 'src/bin.ts' 
    },
    target: 'es2020',
    outDir: './dist',
    format: 'commonjs',
    noExternal: [
      '@vlocode/core',
      '@vlocode/util'
    ],
    external: [
      'vscode'
    ],
    ...config,
  },
  {
    entry: { 
      'index': 'src/index.ts' 
    },
    target: 'esnext',
    outDir: './dist',
    dts: {
      sourcemap: false,
      oxc: true
    },
    format: ['esm', 'commonjs'],
    external: [
      '@vlocode/core',
      '@vlocode/util',
      'vscode'
    ],
    ...config
  }
])