import { createPinia } from 'pinia'
// import { useMessageStore } from './modules/messagedata'

const store = createPinia()

export default store

export * from './modules/messagedata'
export * from './modules/platdata'
export * from './modules/postdata'
export * from './modules/user'
export * from './modules/logs'