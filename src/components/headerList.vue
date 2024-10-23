<template>
    <div class="head-list">
        <div class="head">
            <div class="headBody">
                <div class="head-left">
                    <div class="logo">
                        <h1>provateBBS</h1>
                    </div>
                    <input class="more-input" type="checkbox" name="" id="">
                    <div class="more">
                        <el-icon><Menu /></el-icon>
                        更多模板+
                    </div>
                    <ul class="head-ul" ref="headUl">
                        <li>    
                            <router-link  to="/indexShow">
                                <el-dropdown>
                                    <span  class="el-dropdown-link">首页</span>
                                </el-dropdown>
                            </router-link>
                        </li>
                        <!-- 只显示板块的前两个 -->
                         <li v-for="item in platStore.takepaltlist.slice(0,2)" :key="item.pid">
                            <router-link :to="'/form/'+item.pid">
                            <!-- {{ item }} -->
                                <el-dropdown>
                                    <span class="el-dropdown-link">
                                        {{ item.name }}
                                    </span>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <router-link :to="'/form/'+item.pid+'/'+it.cid" v-for="(it,index) in item.children" :key="it.cid">
                                                <el-dropdown-item :command="index">
                                                    {{ it.name }}
                                                </el-dropdown-item>
                                            </router-link>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </router-link>
                         </li>
                         <li>
                            <router-link  to="/classify">
                                <el-dropdown>
                                    <span  class="el-dropdown-link">更多板块+</span>
                                </el-dropdown>
                            </router-link>
                        </li>
                    </ul>
                </div>
                <div class="head-right">
                    <div class="head-post">
                        <el-button type="success" @click="router.push('/newPost')" :icon="Edit">发帖</el-button>
                    </div>
                    <div class="head-search">
                        <el-button type="success" :icon="Search" @click="gotoSearch">搜索</el-button>
                    </div>
                    <div class="login" v-if="!isLogin">
                        <el-button type="success" plain @click="gotoLogin">登录/注册</el-button>
                    </div>
                    <div class="head-user" v-else>
                        <div class="user-message">
                            <router-link to="/message">
                                <el-icon size="25px" color="rgb(103, 194, 58)"><BellFilled/></el-icon>
                            </router-link>
                        </div>
                        <div class="user-img">
                            <el-dropdown>
                                <span class="el-dropdown-link">
                                    <img :src="loginUser.icon === 'default.svg' ? createImgSrc('default.svg'):`${baseUrl}/${loginUser.icon}`" alt="">
                                </span>
                                <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="toUserinfo">个人中心</el-dropdown-item>
                                    <el-dropdown-item @click="outLogin">退出登陆</el-dropdown-item>
                                </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </div>
                </div>
            </div>
            <el-dialog
            v-model="centerDialogVisible"
            title="温馨提示"
            width="500"
            align-center
            >
                <span>确定要退出登陆吗？</span>
                <template #footer>
                <div class="dialog-footer">
                    
                    <el-button @click="centerDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="yesoutLogin">
                        确定
                    </el-button>
                </div>
                </template>
            </el-dialog>
        </div>
    </div>

</template>

<script setup>
    import { useRouter,useRoute } from "vue-router";
    import { ref,onMounted,watch,nextTick,getCurrentInstance,computed } from 'vue'
    const router = useRouter();
    const route = useRoute()
    import {Edit, Search, BellFilled,Menu } from '@element-plus/icons-vue'
    import { useUserStore,usePlatStore } from "@/stores";
    import { parseToken } from '@/utils/utils'
    import api from '@/api'
    import Bus from '@/bus/bus.js'
    const platStore = usePlatStore()
    const headUl = ref('')
    
    const baseUrl = getCurrentInstance().appContext.config.globalProperties.$request_url

    const userStore = useUserStore()
    
    // 跳转到登陆页面
    function gotoLogin(){
        router.push('/login')
    }

    function gotoSearch(){
        router.push('/search')
    }

    let centerDialogVisible = ref(false)
    // 退出登陆
    function outLogin(){
        centerDialogVisible.value = true
    }
    // 确定退出登陆
    function yesoutLogin(){
        userStore.outLogin()
        ElMessage.success('退出成功！')
        router.push('/login')
    }

    // 点击前往用户个人信息页面
    function toUserinfo(){
        router.push('/userInfo')
    }
    
    // 检查是否登陆
    const isLogin = ref(false)

    function createImgSrc(icon){
        // console.log(icon)
        let userImg = ''
        userImg= new URL(`/src/assets/images/${icon}`, import.meta.url).href
        return userImg
    }

    let token = ref(localStorage.getItem('token'))
    Bus.$on('tokenChange',()=>{
        // console.log('token is change')
        token.value = localStorage.getItem('token')
    })
    let loginUser = computed(()=>parseToken(token.value))
//    console.log(loginUser)
    // 判断用户是否登陆
    if(localStorage.getItem('token')){
        isLogin.value = true
    }
    // console.log('header is create')
    onMounted(async ()=>{
        // 异步操作，等待数据出来后再进行操作
        let result
        await api.getPlate().then(res=>{
            result = res.data
        })
        platStore.setpaltlist(result)
    })

    watch(()=>route.path,(newPath)=>{
        if(newPath == '/login'){
            return
        }
        nextTick(()=>{
            // console.log(headUl.value)
            for(const item of headUl.value.children){
                item.classList.remove('router-link-active')
                item.classList.remove('router-link-exact-active')
            }
            if(!newPath.split('/')[2]){
                if(newPath.split('/')[1] === 'classify'){
                    headUl.value.children[3].classList.add('router-link-active')
                    headUl.value.children[3].classList.add('router-link-exact-active')    
                    return
                }
                headUl.value.children[0].classList.add('router-link-active')
                headUl.value.children[0].classList.add('router-link-exact-active')
            }else{
                for(const item of headUl.value.children){
                    if(item.children[0].href.replace('http://localhost:5173/form/','') === newPath.split('/')[2]){
                        item.classList.add('router-link-active')
                        item.classList.add('router-link-exact-active')
                    }
                }
            }
        })
    },{
        immediate:true
    })
</script>

<style lang="scss" scoped>
    .head-list{
        width:100%;
        // position: fixed;
        // z-index: 999;
        display: flex;
        justify-content: center;
        background-color: white;
        box-shadow: 0px 8px 6px -6px #bbb9b9;
    }
    .more-input{
        opacity: 0;
        width: 100px;
        position: absolute;
        top: 28px;
        height: 25px;
        left: 192px;
        display: none;
    }
    .more{
        display: none;
        align-self: center;
        margin-left: 20px;
        align-items: center;
        gap: 5px;
    }
    .head{
        display: flex;
        justify-content: center;
        width: 1140px;
        height: 80px;
        // position: relative;
        background-color: white;
    }
    .headBody{
        width: 1140px;
        // border:1px solid black;
        height: 80px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: white;
    }
    .head-left{
        display: flex;
        .logo{
            font-size: 16px;
            margin: 10px;
            font-style: italic;
            color: rgb(103, 194, 58);
        }
        :deep(.head-ul){
            list-style: none;
            display: flex;
            align-items: center;
            margin:10px;
            // .ul-index{
            //     // line-height: 10px
            // }
            a{
                color: rgb(119, 118, 118);
                font-weight: bolder;
                text-decoration: none;
                margin: 0 15px;
            }
            a:hover{
                color: rgb(103, 194, 58)
            }
            .router-link-active{
                span{
                    color: rgb(103, 194, 58);
                }
            }
        }
    }
    .head-right{
        display: flex;
        align-items: center;
        .head-post,.head-search{
            // border: 1px solid black;
            height: 40px;
            button{
                height: 100%;
                width: 110px;
                // border-radius: none;
            }
            margin: 5px;
        }
        .head-search{
            margin-right: 10px;
        }
        .login{
            height: 40px;
            button{
                height: 100%;
                width:120px;
            }
            margin: 5px;
        }
    }
    .head-user{
        display: flex;
        align-items: center;
        margin-left: 10px;
    }
    .el-dropdown-link{
        img{
            width: 60px;
            height: 60px;
            border-radius: 50px;
            margin:20px;
        }
    }
    .example-showcase .el-dropdown-link {
        cursor: pointer;
        color: var(--el-color-primary);
        display: flex;
        align-items: center;
    }
    .head-left .head-ul a :hover{
        color:rgb(103, 194, 58);
        border:none
    }
    .el-dropdown-menu a{
        text-decoration: none;
    }
    .el-dropdown-menu a :hover{
        color:rgb(103, 194, 58)
    }
    .el-dropdown-link{
        // border: none;
        outline: none;
        cursor: pointer;
    }
    @media(max-width:1140px){
        .head{
            width:100%
        }
        .headBody{
            width: 100%;
        }
    }
    @media(max-width:940px){
        .headBody{
            position: relative;
        }
        .head-left .head-ul{
            display: none;
            // display: block;
            position: absolute;
            z-index: 100;
            top: 80px;
            left: 0;
            margin: 0;
            background-color: rgba(255,255,255);
            width: 100%;
            li{
                padding: 19px 0;
                background-color: rgba(0,0,0,0.01);
                margin: 1px 0;
            }
            box-shadow: 0px 8px 6px -6px #bbb9b9;
        }
        input[type="checkbox"]:checked ~ .head-ul{
            display: block;
        }
        .more{
            display: flex;
        }
        .more-input{
            display: block;
        }
    }
</style>