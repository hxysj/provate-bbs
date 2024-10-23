<template>
    <div class="allView">
        <div class="detail-where" @click="router.go(-1)">
            <el-icon><ArrowLeft /></el-icon>
            <div>放回上一页</div>
        </div>
        <div class="detail-body">
            <div class="detail-title">
                {{ postInfo.title }}
            </div>
            <div class="detail-user">
                <div class="user-img">
                    <img :src="postInfo.userInfo && postInfo.userInfo?.icon != 'default.svg' ? `${baseUrl}/${postInfo.userInfo?.icon}`:createImgSrc('default.svg')" alt="">
                </div>
                <div class="user-right">
                    <div class="user-name" @click="gotoInfo(postInfo.userInfo?.id)">
                        {{ postInfo.userInfo?.nickName }}
                    </div>
                    <div class="other">
                        {{ postInfo['create_time'] }}
                    </div>
                </div>
            </div>
            <div class="detail-text">
                <div class="html_value" v-html="sanitizedHtml"></div>
                <!-- {{ postInfo.content }} -->
            </div>
        </div>
        <!-- 发表留言和帖子留言区 -->
        <div class="detail-leave" ref="detailLeave">
            <div class="leave-title">
                <div>评论</div>
                <div>|</div>
                <div @click="showNewLeave($event)">最新</div>
            </div>
            <div class="creat-leave">
                <div class="leave-author">
                    <img :src="userInfo.icon === 'default.svg' ? createImgSrc('default.svg'):`${baseUrl}/${userInfo.icon}`" alt="" v-if="islogin">
                    <span v-else>未登录</span>
                </div>
                <el-input
                    v-model="Leave"
                    maxlength="30"
                    style="width: 800px"
                    placeholder="请文明发言！"
                    show-word-limit
                    type="textarea"
                    ref="userCreateLeave"
                />
                <div>
                    <el-button type="success" @click="addLeave(postInfo.tid,Leave,uid)" :disabled="!Leave">发表</el-button>
                </div>
            </div>
            <div class="leave-list">
                <div v-if="postInfo['leave_list'] && postInfo['leave_list'].length !== 0" class="leave-item" v-for="(item,index) in postInfo['leave_list']" :key="index">
                    <leaveItem @leavelChange="leavel_change" :item="item" :tid="postInfo.tid"></leaveItem>
                </div>
                <div v-else>
                    <el-empty description="暂无评论" />
                </div>
            </div>
            <div></div>
        </div>
        <!-- 显示帖子点赞功能  定位到评论的功能-->
        <div class="floatLeft">
            <div class="left-item">
                <img src="@/assets/images/点赞.svg" alt="" v-if="!postInfo.like?.includes(uid)" @click="addPostlike(postInfo.tid,uid)">
                <img src="@/assets/images/点赞active.svg" alt="" v-else @click="deletePostlike(postInfo.tid,uid)">
            </div>
            <div class="left-item">
                <img src="@/assets/images/回复.svg" @click="gotoLeave" alt="">
            </div>
        </div>
    </div>
</template>

<script setup>
    import leaveItem from '@/components/leaveItem.vue'
    import {ArrowLeft} from '@element-plus/icons-vue'
    import { useRoute,useRouter } from 'vue-router'
    import api from '@/api'
    import { usePostStore } from '@/stores'
    import { ref,computed,onMounted,getCurrentInstance } from 'vue'
    import DOMPurify from 'dompurify'
    import { useMessageStore,useLogsStore } from '@/stores'
    import { parseToken,createNowTime } from '@/utils/utils'
    import { v4 as uuidv4 } from 'uuid'

    const messageStore = useMessageStore()
    const postStore = usePostStore()
    const logsStore = useLogsStore()
    const route = useRoute()
    const router = useRouter()

    const baseUrl = getCurrentInstance().appContext.config.globalProperties.$request_url
    // 通过图片名，生成对应的图片链接，用于在页面中显示图片
    function createImgSrc(icon){
        // console.log(icon)
        let userImg = ''
        userImg= new URL(`/src/assets/images/${icon}`, import.meta.url).href
        return userImg
    }
    function showNewLeave(e){
        if(document.querySelector('.newActive')){
            document.querySelector('.newActive').classList.remove('newActive')
        }else{
            e.target.classList.add('newActive')
        }
        // console.log(postInfo.value['leave_list'])
        postInfo.value['leave_list'].sort((a,b)=>{
            return a['craete_time'] < b['create_time'] ? -1 : 1
        })
    }

    // 帖子的信息
    let postInfo = ref({})
    
    // 获取路由携带的帖子id
    const tid = ref(route.params.tid)

    // 对帖子内容进行清洗
    const sanitizedHtml = computed(()=>{
        return DOMPurify.sanitize(postInfo.value.content)
    })

    // ----------------------------------------------------------------------------------
    // 帖子的留言信息

    onMounted(async ()=>{
        if(postStore.get_post_tid(tid.value)){
            postInfo.value = postStore.get_post_tid(tid.value)
        }else{
            let res = await api.getpostDetail(tid.value)
            postInfo.value = res.data
            postInfo.value.like = JSON.parse(postInfo.value.like)
            // 缓存数据
            postStore.make_cache_post(res.data)
        }
    })

    // 留言发生变化时触发父组件事件
    const leavel_change = () =>{
        // console.log('最外层的父组件被触发了')
        postInfo.value = postStore.get_post_tid(tid.value)
        // console.log(postInfo.value)
    }

    // ----------------------------------------------------------
    // 判断当前用户是否登录
    const islogin = ref(localStorage.getItem('token') && localStorage.getItem('token').length > 0)
    // 获得当前登录用户的id
    let uid = ref('')
    let userInfo = ref({
    })
    if(islogin.value){
        uid.value = parseToken(localStorage.getItem('token')).id
        userInfo.value = parseToken(localStorage.getItem('token'))
    }
    // -----------------------------------------------------------
    // 用来绑定留言输入框的内容
    const Leave = ref('')
    // 点击发表留言
    const addLeave = async (tid,newLeave,uid,lid='',lindex = -1)=>{
        if(!islogin.value){
            ElNotification({
                title: '温馨提示',
                message: '请先登录再进行操作！',
                type: 'warning',
            })
            // 推迟1.5s后再进行跳转页面
            setTimeout(()=>{
                router.push('/login')
            },1500)
            return
        }
        if(!newLeave){
            return
        }
        let newLid = uuidv4()
        let result
        try{
            result = await api.addDbLeavel([
                newLid, uid, tid, newLeave, lindex, createNowTime(), lid === ''? null : lid
            ])
        }catch(e){
            ElMessage.error('评论失败，请稍后再试！')
        }
        if(!result){
            return
        }
        ElMessage.success('发表成功！')
        let updated_post
        try{
            updated_post = await api.getpostDetail(tid)
        }catch(e){
            ElMessage.error('获取帖子数据失败')
        }
        if(!updated_post){
            return
        }
        postInfo.value = updated_post.data
        postInfo.value.like = JSON.parse(postInfo.value.like)
        postStore.update_post_data(postInfo.value)

        let logcontent = `在帖子 '${postInfo.value.title}' 评论: '${newLeave}'`
        logsStore.addLog({
            uid:userInfo.value.id,
            create_time:createNowTime(),
            value:logcontent,
            identity:userInfo.value.identity
        })
        // postStore.addLeave(tid,newLeave,uid,lid,lindex,newlid)
        messageStore.addMessage('leavel',{
            tid:tid,
            wid:uid,
            lid:newLid
        }, userInfo.value.id)
        Leave.value = ''
    }
    // ----------------------------------------------------------
    // 给帖子的喜欢列表添加当前用户
    async function addPostlike(tid,u_id){
        // console.log(tid,u_id)
        if(u_id === null || u_id === '' || u_id === undefined){
            ElNotification({
                title: 'Warning',
                message: '请先登录再进行操作！',
                type: 'warning',
            })
            router.push('/login')
            return
        }
        postInfo.value.like.push(u_id)
        let result
        try{
            result = await api.updatePost({like:postInfo.value.like,tid:tid})
        }catch(e){
            console.log(e)
            ElMessage.error('点赞失败,请稍后再试！')
        }
        if(!result){
            return
        }

        postStore.update_post_data(postInfo.value)
        ElMessage.success('操作成功！')
        let logcontent = `点赞了帖子 '${postStore.get_post_tid(tid).title}'`
        logsStore.addLog({
            uid:userInfo.value.id,
            create_time:createNowTime(),
            value:logcontent,
            identity:userInfo.value.identity
        })
        // postStore.changePostlike(tid,u_id,1)
        
        messageStore.addMessage('post',{
            tid:tid,
            wid:u_id,
            lid:null
        },userInfo.value.id)
    }
    // 将帖子的喜欢列表中删除当前用户
    async function deletePostlike(tid,u_id){
        // console.log(tid,u_id)
        postInfo.value.like = postInfo.value.like.filter(item=>item!=u_id)
        let result
        try{
            result = await api.updatePost({like:postInfo.value.like,tid:tid})
        }catch(e){
            console.log(e)
            ElMessage.error('取消失败，请稍后再试！')
        }
        if(!result){
            return
        }
        ElMessage.success('操作成功！')
        postStore.update_post_data(postInfo.value)
        // console.log(postInfo.value)
    }
    // ---------------------------------------------------
    const userCreateLeave = ref(null)
    const detailLeave = ref(null)
    // 点击前往留言区域
    function gotoLeave(){
        // 获取留言区的位置
        let top = detailLeave.value.getBoundingClientRect().top
        window.scrollTo({
            top:top + window.scrollY,
            behavior:'smooth'
        })
        userCreateLeave.value.focus()
    }
    // -----------------------------------------------------------
    // 点击查看用户信息
    function gotoInfo(id){
        router.push(`/userInfo/${id}`)
    }
</script>

<style lang="scss" scoped>
    .allView{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        background-color: rgb(241, 241, 241);
        height: 100%;
        .floatLeft{
            position: fixed;
            top: 400px;
            left: calc((100% - 1140px)/2 - 70px);
            display: flex;
            z-index: 999;
            flex-direction: column;
            height: 150px;
            justify-content: space-around;
            .left-item{
                display: flex;
                align-items: center;
                background-color: white;
                padding: 5px;
                border-radius: 50px;
                justify-content: center;
                width: 45px;
                height: 45px;
                img{
                    width: 35px;
                    height: 35px;
                }
            }
        }
    }
    .newActive{
        color: rgb(103, 194, 58);
    }
    .detail-where{
        height: 10px;
        width: 1140px;
        margin: 10px;
        display: flex;
        align-items: center;
    }
    .detail-where:hover{
        cursor:pointer;
        color: rgb(149, 212, 117);
    }
    .detail-body{
        width: 1140px;
        background-color: white;
        margin-top: 5px;
        padding: 10px;
    }
    .detail-title{
        height: 20px;
        padding:10px;
        font-size: 25px;
        letter-spacing: 3px;
        font-weight: bolder;
        margin-bottom: 10px;
        position: relative;
    }
    .leave-title:hover{
        cursor:pointer;
    }
    .detail-user{
        .user-img img{
            width: 60px;
            height: 60px;
            margin: 10px 5px;
            border-radius: 25px;
        }
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgb(231, 231, 231);
        .user-right{
            margin-left:15px;
            font-size:18px;
            color: rgb(159, 159, 159);
            .user-name{
                margin-bottom: 7px;
                font-weight: bold
            }
            .user-name:hover{
                color: rgb(149, 212, 117);
                cursor: pointer;
            }
            display: flex;
            flex-direction:column;
            justify-content:space-between;
        }
    }
    .detail-text{
        font-size: 18px;
        letter-spacing: 1px;
        margin: 15px 10px;
        table{
            width: 500px;
            height: 500px;
            border: 1px solid black;
        }
    }
    :deep(.html_value){
        table{
            width: 400px;
            height: 400px;
            // border: 1px solid black;
            margin: 5px;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #848181; /* 单元格边框样式 */
            padding: 10px; /* 单元格内间距 */
            text-align: left; /* 单元格内文本对齐方式 */
        }
        img{
            width: 55%;
            margin: 5px;
            border-radius: 5px;
            // height: 100px;
        }
    }
    .detail-leave{
        margin-top: 10px;
        width: 1140px;
        padding: 10px;
        padding-bottom: 50px;
        margin-bottom: 100px;
        background-color: white;
        .leave-title{
            display: flex;
            margin-left: 10px;
            gap: 10px;
            align-items: center;
        }
        .creat-leave{
            margin-top: 15px;
            margin-left: 10px;
            margin-right: 15px;
            display: flex;
            align-content: center;
            // gap:20px;
            .leave-author{
                width: 50px;
                height: 50px;
                margin-right:20px;
                border-radius:50px;
                background-color: rgb(218, 218, 218);
                text-align: center;
                line-height: 50px;
                font-size: 14px;
                img{
                    width: 100%;
                    height: 100%;
                }
            }
            button{
                margin-left:5px;
                height: 50px;
            }
        }
        .leave-list{
            margin-top:15px;
            // position: relative;
            .leave-item{
                margin-top:5px;
                border-bottom: 1px solid rgb(231, 230, 230);
            }
        }
    }
    @media(max-width:1140px){
        .detail-where{
            width: 100%;
        }
        .detail-body{
            width: 100%;
        }
        .floatLeft{
            left: calc(100% - 70px) !important;
            .left-item{
                border: 1px solid rgba(0,0,0,0.2);
            }
        }
        .detail-leave{
            width: 100%;
        }
        .el-textarea{
            width: 100% !important;
            flex: 1;
        }
    }
</style>