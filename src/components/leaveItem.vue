<template>
    <div class="leave-item-title" @click="showInput($event)">
        <div class="leave-title">
            <div class="leave-user-img">
                <img :src="props.item.usericon === 'default.svg' ? createImgSrc(props.item.usericon) : `${baseUrl}/${props.item.usericon}`" alt="">
            </div>
            <!-- 根 - 显示这一块 -->
            <div class="leave-user-info" v-if="props.item.index === -1">
                <div class="info-one" @click="gotoInfo(props.item.uid)">{{props.item.nickName}}</div>
                <div class="info-value">{{ props.item.value }}</div>
                <div class="info-other">
                    <div>{{ props.item.createTime }}</div>
                    <div class="other-img">
                        <img @click="deleteLike(props.tid,props.item.lid,user.id)" src="@/assets/images/点赞active.svg" alt="" v-if="props.item.like.includes(user.id)">
                        <img @click="addLike(props.tid,props.item.lid,user.id)" src="@/assets/images/点赞.svg" alt="" v-else> 
                        <div v-if="props.item.like.includes(user.id)">{{ props.item.like.length }}</div>
                        <div v-else>点赞</div>
                    </div>
                    <div class="other-hf">
                        <img src="@/assets/images/回复.svg" alt="" :data-lid="item.lid">
                    </div>
                    <div class="other-del" v-show="props.item.uid === user.id" @click="leadelete(props.tid,props.item.lid)">
                        删除
                    </div>
                </div>
            </div>
            <!-- 根下子元素 - 显示的内容 -->
            <div v-else class="leave-user-info leave-user-info-1">
                <div><span class="info-one" @click="gotoInfo(props.item.uid)">{{ props.item.nickName}} </span> 回复给 <span class="info-one" @click="gotoInfo(props.preuid)">{{ props.preName }} </span></div>
                <div class="info-value">{{ props.item.value }}</div>
                <div class="info-other">
                    <div>{{ props.item.createTime }}</div>
                    <div class="other-img">
                        <img @click="deleteLike(props.tid,props.item.lid,user.id)" src="@/assets/images/点赞active.svg" alt="" v-if="props.item.like.includes(user.id)">
                        <img @click="addLike(props.tid,props.item.lid,user.id)" src="@/assets/images/点赞.svg" alt="" v-else> 
                        <div v-if="props.item.like.includes(user.id)">{{ props.item.like.length }}</div>
                        <div v-else>点赞</div>
                    </div>
                    <div class="other-hf">
                        <img src="@/assets/images/回复.svg" alt="" :data-lid="item.lid">
                    </div>
                    <div class="other-del" v-show="props.item.uid === user.id" @click="leadelete(props.tid,props.item.lid)">
                        删除
                    </div>
                </div>
            </div>
        </div>
        <div class="creat-leave" :data-lid="item.lid">
            <div class="leave-author">
                <img :src="userInfo.icon === 'default.svg' ? createImgSrc(userInfo.icon) : `${baseUrl}/${userInfo.icon}`" alt="">
            </div>
            <div>
                <el-input
                    v-model="Leave"
                    maxlength="30"
                    placeholder="回复"
                    show-word-limit
                    type="textarea"
                    style="width: 400px;"
                    input-style="height:40px"
                />
            </div>
            <div>
                <el-button type="success" @click="addLeave(props.tid,Leave,user.id,props.item.lid,props.item.index,props.item.nickName)">发表</el-button>
            </div>
        </div>
        <!-- 如果children存在则添加上children对应的标签 -->
        <div class="leave-item-children" v-if="props.item.children">
            <!-- 调用自身组件，形成递归 -->
            <leaveItem @leavelChange="leavel_change" v-for="(item,index) in props.item.children" :key="index" :preuid="props.item.uid" :preName="props.item.nickName" :item="item" :tid="props.tid"></leaveItem>
        </div>
    </div>
    <el-divider  v-show="props.item.lindex === -1" style="width: 80%; margin-left: 30px;"/>
</template>

<script setup>
    import { ref, getCurrentInstance } from 'vue'
    import { useUserStore } from "@/stores";
    import { usePostStore } from "@/stores";
    import { useRouter } from 'vue-router'
    import { useMessageStore } from '@/stores'
    import { useLogsStore } from '@/stores'
    import { ElMessageBox } from 'element-plus';
    import { parseToken,createNowTime } from '@/utils/utils';
    import api from '@/api';
    import { v4 as uuidv4 } from 'uuid';
    const messageStore = useMessageStore()
    const userStore = useUserStore()
    const postStore = usePostStore()
    const router = useRouter()
    const logsStore = useLogsStore()

    const baseUrl = getCurrentInstance().appContext.config.globalProperties.$request_url

    const emit = defineEmits(['leavelChange'])
    // 当前登录的用户
    let user = {
        id:null
    }
    let userInfo = {
        icon:'default.svg'
    }
    if(localStorage.getItem('token')){
        user = ref(parseToken(localStorage.getItem('token')))
        userInfo.value = ref(parseToken(localStorage.getItem('token')))
    }

    const leavel_change = () =>{
        emit('leavelChange')
    }
    // 接受父组件传递过来的参数
    const props = defineProps({
        item:Object,
        preuid:{
            type:String,
            default:'-999'
        },
        preName:{
            type:String,
            default:''
        },
        tid:String
    })
    // console.log(props.item)
    function createImgSrc(icon){
        // console.log(icon)
        let userImg = ''
        userImg= new URL(`/src/assets/images/${icon}`, import.meta.url).href
        return userImg
    }
    // -----------------------------------------------------------------------
    // 点击回复的图标，显示输入框
    function showInput(e){
        e.stopPropagation();
        if(e.target.nodeName === 'IMG' && e.target.parentNode && [...e.target.parentNode.classList].includes('other-hf')){
            // console.log(user)
            if(!user.value?.id){
                ElNotification({
                    title: 'Warning',
                    message: '请先登录再进行操作！',
                    type: 'warning',
                })
                // 推迟1s后再进行跳转页面
                setTimeout(()=>{
                    router.push('/login')
                },1000)
                return
            }
            // console.log(e.target.dataset.lid)
            
            let click_lid = e.target.dataset.lid
            if(document.querySelector(`div[data-lid="${click_lid}"]`).style.display === 'none'){
                for(const item of document.querySelectorAll('.leave-list .creat-leave')){
                    item.style.display = 'none'
                }
                document.querySelector(`div[data-lid="${click_lid}"]`).style.display = 'flex'
            }else{
                document.querySelector(`div[data-lid="${click_lid}"]`).style.display = 'none'
            }
        }
    }
    // --------------------------------------------------------
    // 评论输入框的内容
    let Leave = ref('')
    // 点击发表评论
    async function addLeave(tid,newLeave,uid,lid,lindex, pNickname){
        // console.log(tid,newLeave,uid,lid,lindex)
        let logcontent = `回复了 '${ pNickname }': '${newLeave}'`
        logsStore.addLog({
            uid:userInfo.value.id,
            create_time:createNowTime(),
            value:logcontent,
            identity:userInfo.value.identity
        })

        // 如果内容为空则退出
        if(!newLeave){
            return
        }
        const newlid = uuidv4()
        // console.log(uid)
        let result
        try{
            result = await api.addDbLeavel([
                newlid, uid, tid, newLeave, lindex+1, createNowTime(), lid
            ])
        }catch(e){
            ElMessage.error('发表失败，请稍后再试！')
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
        let postInfo = updated_post.data
        postInfo.like = JSON.parse(postInfo.like)
        postStore.update_post_data(postInfo)
        // 通知父组件数据更新了
        leavel_change()
        // postStore.addLeave(tid,newLeave,uid,lid,lindex+1,newlid)
        messageStore.addMessage('leavel',{
            tid:tid,
            wid:uid,
            lid:newlid
        },props.item.uid)
        // 发表完成后隐藏输入框
        for(const item of document.querySelectorAll('.leave-list .creat-leave')){
                item.style.display = 'none'
        }
        Leave.value = ''
    }
    // -----------------------------------------------------------
    // 点击删除评论
    function leadelete(tid,lid){
        console.log(tid,lid)
        ElMessageBox.confirm(
        '确定要删除该留言吗？',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
    .then(async () => {

        let result
        try{
            result = await api.rmLeaveldb(props.item.lid)
        }catch(e){
            ElMessage.error('删除失败，请稍后再试！')
        }
        if(!result){
            return
        }

        let updated_post
        try{
            updated_post = await api.getpostDetail(tid)
        }catch(e){
            ElMessage.error('获取帖子数据失败')
        }
        if(!updated_post){
            return
        }
        let postInfo = updated_post.data
        postInfo.like = JSON.parse(postInfo.like)
        postStore.update_post_data(postInfo)
        // 通知父组件数据更新了
        leavel_change()

        let logcontent = `删除了留言: '${props.item.value}'`
        logsStore.addLog({
            uid:userInfo.value.id,
            create_time:createNowTime(),
            value:logcontent,
            identity:userInfo.value.identity
        })
            // postStore.deleteLea(tid,lid)
        ElMessage({
            type: 'success',
            message: '删除成功！',
        })
    })
    .catch(() => {
      
    })
    }


    // -----------------------------------------------------------------------
    // 点击进行评论留言点赞
    async function addLike(tid,lid,uid){
        // console.log(props.item.like)
        // console.log(uid)
        if(uid === null){
            ElNotification({
                title: 'Warning',
                message: '请先登录再进行操作！',
                type: 'warning',
            })
            // 推迟1.5s后再进行跳转页面
            setTimeout(()=>{
                router.push('/login')
            },1500)
            return
        }
        if(props.item.like.includes(uid)){
            return
        }
        // console.log(uid)
        // console.log(props.item.like)
        props.item.like.push(uid)
        let newLike = props.item.like
        // console.log(newLike)
        let result
        try{
            result = await api.updateLeavelLike({
                lid:lid,
                like:newLike
            })
        }catch(e){
            ElMessage.error('操作失败！')
        }
        if(!result){
            return
        }
        ElMessage.success('点赞成功！')
        let updated_post
        try{
            updated_post = await api.getpostDetail(tid)
        }catch(e){
            ElMessage.error('获取帖子数据失败')
        }
        if(!updated_post){
            return
        }
        let postInfo = updated_post.data
        postInfo.like = JSON.parse(postInfo.like)
        postStore.update_post_data(postInfo)
        // 通知父组件数据更新了
        leavel_change()

        let logcontent = `点赞了留言:'${props.item.value}'`
        logsStore.addLog({
            uid:userInfo.value.id,
            create_time:createNowTime(),
            value:logcontent,
            identity:userInfo.value.identity
        })
        // postStore.addLike(tid,lid,uid)
        messageStore.addMessage('like_leavel',{
            tid:tid,
            wid:uid,
            lid:lid
        },props.item.uid)
    }

     //取消点赞 
    async function deleteLike(tid,lid,uid){
        // console.log(props.item.like)
        // postStore.removeLike(tid,lid,uid)
        let newLike = props.item.like.filter(it=> it != uid)
        let result
        try{
            result = await api.updateLeavelLike({
                lid:lid,
                like:newLike
            })
        }catch(e){
            ElMessage.error('操作失败！')
        }
        if(!result){
            return
        }
        ElMessage.error('取消成功！')
        let updated_post
        try{
            updated_post = await api.getpostDetail(tid)
        }catch(e){
            ElMessage.error('获取帖子数据失败')
        }
        if(!updated_post){
            return
        }
        let postInfo = updated_post.data
        postInfo.like = JSON.parse(postInfo.like)
        postStore.update_post_data(postInfo)
        // 通知父组件数据更新了
        leavel_change()

    }
    // --------------------------------------------------------------------------
    // 点击查看用户信息
    function gotoInfo(id){
        // console.log(id)
        router.push(`/userInfo/${id}`)
    }
</script>

<style lang="scss" scoped>
    .leave-item-title{
            padding-bottom: 2.5px;
            margin: 5px;
            .leave-title{
                display: flex;
                align-content: center;
                min-height: 80px;
                .leave-user-img{
                    width: 50px;
                    height: 50px;
                    border-radius: 30px;
                    // border: 1px solid black;
                    margin: 5px;
                    margin-right: 15px;
                    img{
                        width: 100%;
                        height: 100%;
                        border-radius: 30px;
                        // margin-right:15px;
                    }
                }
                .leave-user-info{
                    display: flex;
                    flex-direction: column;
                    gap: 2.5px;
                    .info-other{
                        display: flex;
                        gap:15px;
                        color: rgb(165, 165, 165);
                        align-items: center;
                    }
                    .info-one{
                        font-size: 16px;
                        font-weight: bold;
                        color: rgb(103, 194, 58);
                    }
                    .info-one:hover{
                        color:rgb(167, 194, 58);
                        cursor: pointer;
                    }
                    .info-value{
                        font-size: 17px;
                    }
                }
                
            }
            .leave-item-children{
                font-size: 14px;
                position: relative;
                left: 30px;
            }
        }
    .other-img{
        display: flex;
        align-items: center;
        gap:5px;
        img{
            width: 20px;
            height: 20px;
        }
        img:hover{
            cursor: pointer;
        }
    }
    .other-hf{
        display: flex;
        justify-content: center;
        img{
            width: 20px;
            height: 20px;
        }
        img:hover{
            cursor: pointer;
        }
    }
    .other-del{
        color: rgb(103, 194, 58);
        cursor: pointer;
    }
    .creat-leave{
        display: none;
        margin-top: 5px;
        margin-left: 30px;
        // display: flex;
        align-items: center;
        // height: 30px;
        // gap:20px;
        .leave-author{
            width: 40px;
            height: 40px;
            border-radius: 30px;
            margin-right:20px;
            border-radius:50px;
            background-color: rgb(218, 218, 218);
            text-align: center;
            line-height: 50px;
            font-size: 14px;
            img{
                width: 100%;
                height: 100%;
                border-radius: 30px;
            }
        }
        
        button{
            margin-left:5px;
            height: 40px;
        }
    }
</style>