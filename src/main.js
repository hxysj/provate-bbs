import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/router'
import pinia from '@/stores'
import '@/assets/font/iconfont.css'
import 'element-plus/dist/index.css'
// import createImgSrc from '@/assets/js/createImgSrc.js'
const app = createApp(App)

app.config.globalProperties.$request_url = 'http://127.0.0.1:3030'

app.use(router).use(pinia).mount('#app')
