import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// 导入element-plus的组件
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import connectHistoryApiFallback from 'connect-history-api-fallback';
// https://vitejs.dev/config/
export default defineConfig({
  resolve:{
    alias:{
      '@':path.resolve(__dirname,'src')
    }
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers:[ElementPlusResolver()]
    })
  ],
  base:'/'
})
