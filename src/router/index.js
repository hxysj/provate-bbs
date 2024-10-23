import { createRouter,createWebHashHistory,createWebHistory } from "vue-router";
import login from '@/views/login/index.vue'
import component from "element-plus/es/components/tree-select/src/tree-select-option.mjs";
// 配置路由规则
const routes = [
    {
        path:'/login',
        component:login
    },
    {
        path:'/',
        component:()=>import('@/views/index.vue'),
        redirect:'/indexShow',
        children:[
            {
                path:'indexShow',
                component:()=>import('@/views/indexShow/indexShow.vue')
            },
            {
                path:'form/:pid?/:cid?',
                component:()=>import('@/views/form/form.vue')
            },
            {
                path:'postdetail/:tid',
                component:()=>import('@/views/postdetail/postdetail.vue')
            },
            {
                path:'newPost',
                component:()=>import('@/views/postdetail/newPost.vue')
            },
            {
                path:'userInfo/:uid?',
                component:()=>import('@/views/user/userInfo.vue')
            },
            {
                path:'message',
                component:()=>import('@/views/message/message.vue')
            },
            {
                path:'search',
                component:()=>import('@/views/search/search.vue')
            },
            {
                path:'classify',
                component:()=>import('@/views/classify/classify.vue')
            },
        ]
    }
]
// 创建路由
const router = createRouter({
    routes:routes,
    history:createWebHistory()
    // history:createWebHashHistory()
})


// 路由守卫
router.beforeEach((to,from,next)=>{
    if(!localStorage.getItem('token')){
        if(to.path === '/userInfo' || to.path ==='/message' || to.path === '/newPost'){
            ElMessage({
                type:'warning',
                message:'请先登录再进行此操作！'
            })
            next('/login')
        }
    }
    next()
    
})

export default router
