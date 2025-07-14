import { sveltekit } from "@sveltejs/kit/vite"

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  define: {
    __vercel_runtime__: '"nodejs18.x"'
  },
}

export default config


