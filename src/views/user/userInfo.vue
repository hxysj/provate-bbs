<template>
    <div class="user">
        <div class="user-where">当前位置：个人中心</div>
        <div class="user-body">
            <div class="user-left">
                <div class="user-top">
                    <div class="user-update" @click="centerDialogVisible = true" v-if="user && user.id === userInfo?.id">修改资料</div>
                    <div class="user-img">
                        <img v-if="userForm.icon" :src="userForm.icon === 'default.svg' ? createImgSrc(userForm.icon) : `${baseUrl}/${userForm.icon}`" alt="">
                    </div>
                    <div class="user-nickName">{{userInfo?.nickName}}</div>
                    <div class="user-introduction">{{ userInfo?.introduction }}</div>
                </div>
                <div class="user-bottom">
                    <div class="bottom-item">
                        <div class="item-title">
                            <i class="myiconfont iconfont icon-iconjifen"></i>
                            <div>积分</div>
                        </div>
                        <div class="item-num">0</div>
                    </div>
                    <div class="bottom-item">
                        <div class="item-title">
                            <i class="myiconfont iconfont icon-huozan"></i>
                            <div>获赞</div>
                        </div>
                        <div class="item-num">{{ likeNum }}</div>
                    </div>
                    <div class="bottom-item">
                        <div class="item-title">
                            <i class="myiconfont iconfont icon-fatie"></i>
                            <div>发帖</div>
                        </div>
                        <div class="item-num">{{ postNum }}</div>
                    </div>
                    <div class="bottom-item">
                        <div class="item-title">
                            <i class="myiconfont iconfont icon-jiarujiazuxianxing"></i>
                            <div>加入</div>
                        </div>
                        <div class="item-num">{{ userInfo && userInfo['create_time'] }}</div>
                    </div>
                    <div class="bottom-item">
                        <div class="item-title">
                            <i class="myiconfont iconfont icon-zuihoudenglu"></i>
                            <div>最后登录时间</div>
                        </div>
                        <div class="item-num">{{userInfo?.lastLoginTime}}</div>
                    </div>
                </div>
            </div>
            <div class="user-right">
                <div class="right-head">
                    <el-menu
                        :default-active="activeIndex"
                        class="el-menu-demo"
                        mode="horizontal"
                        style="width: 100%"
                        active-text-color="rgb(103, 194, 58)"
                    >
                        <el-menu-item index="1" @click="handleSelect(1)">发帖</el-menu-item>
                        <el-menu-item index="2" @click="handleSelect(2)">评论</el-menu-item>
                        <el-menu-item index="3" @click="handleSelect(3)">点赞</el-menu-item>
                    </el-menu>
                    <div class="del_post" v-if="activeIndex === '1' && user && user.id === userInfo?.id" @click="showDelete">
                        <el-icon><Edit /></el-icon>
                    </div>
                </div>
                <div class="right-view">
                    <div v-if="showlist.length>0">
                        <!-- <postItem></postItem> -->
                        <postItem v-for="item in showlist" :listItem="item"  :key="item.tid">
                            <template #del v-if="showDelIcon">
                                <div class="delPost" style="color: rgb(103, 194, 58);" @click="delPost(item)">
                                    <el-icon><CircleCloseFilled /></el-icon>
                                </div>
                            </template>
                        </postItem>
                    </div>
                    <div v-else>
                        <el-empty description="暂无数据" />
                    </div>
                </div>
                <div class="right-page" v-show="showlist.length >0" v-if='maxPage > 1'>
                    <el-pagination layout="prev, pager, next" @change="changePage" v-model:current-page="nowPage" :total="total"/>
                </div>
            </div>
        </div>
        <el-dialog
            v-model="centerDialogVisible"
            title="编辑个人信息"
            width="450"
            align-center
        >``
            <el-form
                :model="userForm"
                status-icon
                label-width="auto"
                class="demo-ruleForm"
            >
                <el-form-item label="账号">
                    <el-input v-model="userForm.name" disabled></el-input>
                </el-form-item>
                <el-form-item label="昵称">
                    <el-input v-model="userForm.nickName"/>
                </el-form-item>
                <el-form-item label="头像" class="userimg">
                    <el-upload
                        class="avatar-uploader"
                        :show-file-list="false"
                        :auto-upload="false"
                        :on-change="uploadChange"
                    >
                        <img :src="showImg" class="avatar" />
                    </el-upload>
                </el-form-item>
                <el-form-item label="性别">
                    <!-- <el-input v-model.number="userForm.gender" /> -->
                    <el-radio-group v-model="userForm.gender">
                        <el-radio :value="'男'">男</el-radio>
                        <el-radio :value="'女'">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="简介">
                    <!-- <el-input v-model.number="userForm.introduction" /> -->
                    <el-input
                        v-model="userForm.introduction"
                        maxlength="100"
                        style="width: 100%"
                        placeholder="介绍一下自己吧"
                        show-word-limit
                        type="textarea"
                        :rows="3"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="success" @click="submit()">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <el-dialog v-model="deleteDisalog" title="警告" width="500" center>
            <span>
                你确定要删除这条帖子吗？
            </span>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="success" plain @click="deleteDisalog = false">取消</el-button>
                    <el-button type="success" @click="todeletepost">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
    
</template>

<script setup>
    import { usePostStore,useUserStore,useLogsStore } from '@/stores'
    import postItem from '@/components/postItem.vue'
    import {ref,computed,watch,getCurrentInstance } from 'vue'
    import { useRoute } from 'vue-router'
    import { Edit,CircleCloseFilled } from '@element-plus/icons-vue'
    import { ElMessage } from 'element-plus'
    import { createNowTime } from '@/utils/utils'
    import axios from 'axios'
    import api from '@/api'
    import { v4 as uuidv4 } from 'uuid'
    import Bus from '@/bus/bus.js'

    const baseUrl = getCurrentInstance().appContext.config.globalProperties.$request_url
    const userStore = useUserStore()
    const logsStore = useLogsStore()
    const route = useRoute()
    
    let token = localStorage.getItem('token')
    // console.log(token)
    // 分割token以获取payload部分
    const base64Payload = token.split('.')[1];
    // 使用atob()解码payload
    const payload = JSON.parse(atob(base64Payload));
    // console.log(payload)
    const user = ref({
        id:payload.userId,
        icon:payload.icon
    })

    // 获取用户的信息
    const userInfo = ref()
    // 用户的发帖数量
    const postNum = ref(0)
    // 用户点赞的数量
    const likeNum = ref(0)
    // 显示头像
    const showImg = ref('') 
    // 用户信息表单
    let userForm = ref({})

    const showlist = ref([])
    // 请求数据
    async function getData(){
        // 获取用户id，请求用户帖子数据
        let res = await api.getUserPostData({
            pageIndex:nowPage.value,
            currentPage:currentSize.value,
            uid:userInfo.value.id,
            type:showType
        })
        let data = res.data.data.map(item=>{
            item.like = JSON.parse(item.like)
            return item
        })

        showlist.value = data
        // console.log(data)
        // postStore.setPosts(data)
        maxPage.value = res.data.total_page
        likeNum.value = res.data.likeNum
        postNum.value = res.data.postNum
        if(showlist.value.length ==0 && nowPage.value != 0){
            nowPage.value -= 1
            getData()
        }
    }
    // ---------------------------------------------------------------
    // 监听路由变化，切换用户信息，进行页面立即执行
    watch(()=>route.path,async (newValue)=>{
        // console.log(userStore.getUserInfo)
        // console.log(oldValue,newValue)
        if(!route.params.uid){
            if(userStore.getUserInfo){
                userInfo.value = userStore.getUserInfo
            }else{
                userInfo.value = (await api.get_user_info(user.value.id)).data
            }
            // await userStore.getUserInfo(user.value.id)
        }else{
            userInfo.value = (await api.get_user_info(route.params.uid)).data
        }
        // console.log(userInfo.value)
        getData()
        if(userInfo.value.icon === 'default.svg'){
            showImg.value = new URL(`/src/assets/images/default.svg`, import.meta.url).href
        }else{
            showImg.value = `${baseUrl}/${userInfo.value.icon}`
        }
        userForm.value = {
            name:userInfo.value.name,
            nickName:userInfo.value.nickName,
            icon:userInfo.value.icon,
            gender:userInfo.value?.gender,
            introduction:userInfo.value?.introduction
        }
    },{
        immediate:true
    })
    // ---------------------------------------------------------------------------------------------------
    // let showlist = computed(()=>postStore.getPosts())
    let activeIndex = ref('1')
    // 显示的数据类型，如帖子（create），点赞（like），留言（leavel）
    let showType = 'create'
    const handleSelect = async (n)=>{
        activeIndex.value = n+''
        if(n==1){
            showType = 'create'
        }else if(n==2){
            showType = 'leavel'
        }else{
            showType = 'like'
        }
        showDelIcon.value = false
        nowPage.value = 1
        getData()
    }
    // 页面展示的数据个数
    const currentSize = ref(3)
    // 当前页码
    const nowPage = ref(1)
    // 页码的最大值
    const maxPage = ref(1)
    // 页码数的显示
    const total = computed(()=>maxPage.value * 10)
    //改变页码时
    function changePage(){
        getData()
    }
    // 是否显示弹窗
    let centerDialogVisible = ref(false)
    
    function createImgSrc(icon){
        // console.log(icon)
        let userImg = ''
        userImg= new URL(`/src/assets/images/${icon}`, import.meta.url).href
        return userImg
    }
    // ----------------------------------------------------------------------------------
    // 保存图片的信息
    const fileRaw = ref()
    // 头像的名称
    const iconName = ref()
    
    // 上传图片
    function uploadChange(file){
        // 创建随机的文件名
        const uniqueSuffix = uuidv4()
        // 图片后缀
        const ext = file.name.split('.')[1]
        // 封面图片名称
        iconName.value = uniqueSuffix + '.'+ ext
        showImg.value = URL.createObjectURL(file.raw)
        fileRaw.value = file.raw
    }
    
    // 提交修改信息
    async function submit(){
        // 如果修改了头像，就上传头像信息
        if(fileRaw.value){
             // 设置请求时上传的数据
            const formData = new FormData()
            formData.append('file',fileRaw.value)
            const oldIconName = ref(userInfo.value.icon)
            // 进行头像上传请求
            // console.log(token)
            await axios.post(`${baseUrl}/userImg?imgName=${iconName.value}`,formData,{
                headers:{
                    'Content-Type':'multipart/from-data',
                    'Authorization': token
                }
            })
            // 提交时将图片的名称放进对象中传递给pinia
            userForm.value.icon = iconName.value
            // 对旧头像进行删除
            if(oldIconName.value !== 'default.svg'){
                await axios({
                    url:baseUrl+'/deluserIcon',
                    method:'GET',
                    params:{
                        oldIcon:oldIconName.value
                    }
                })
            }
        }
        // console.log(userForm.value.icon)
        let result
        userForm.value.id = userInfo.value.id
        try{
            result = await api.set_user_info(userForm.value)
        }catch(error){
            // console.log(error)
        }
        if(!result){
            return
        }
        // console.log(result)
        token = result.data
        // console.log(result)
        localStorage.setItem('token', token)
        Bus.$emit('tokenChange')
        ElMessage({
            type:'success',
            message:'修改成功！'
        })
        let logcontent = '修改了自己的信息' 
        // console.log(userInfo.value)
        logsStore.addLog({
            uid:userInfo.value.id,
            create_time:createNowTime(),
            value:logcontent,
            identity:userInfo.value.identity
        })

        // 关闭弹窗
        centerDialogVisible.value = false
    }
    // ----------------------------------------------------------------------------------
    // 帖子删除功能
    const showDelIcon = ref(false)
    const deleteDisalog = ref(false)
    function showDelete(){
        showDelIcon.value = !showDelIcon.value
    }
    const del_post_data = ref('')
    function delPost(post_item){
        deleteDisalog.value = true
        del_post_data.value = post_item
    }

    async function todeletepost(){
        // console.log(delTid.value)
        let result
        try{
            result = await api.delPost(del_post_data.value.tid, userInfo.value.id)
        }catch(e){
            ElMessage.error('删除失败，请稍后再试！')
        }
        if(!result){
            return
        }
        getData()

        ElMessage.success('删除成功！')

        let logcontent = `删除了帖子'${del_post_data.value.title}'`
        
        logsStore.addLog({
            uid:userInfo.value.id,
            create_time:createNowTime(),
            value:logcontent,
            identity:userInfo.value.identity
        })
        deleteDisalog.value = false
        // if(!postStore.getPosts.length){
        //     if(nowPage.value !== 1){
        //         nowPage.value -= 1
        //     }
        //     getData()
        // }
    }
</script>

<style lang="scss" scoped>
    .user{
        width: 1140px;
        .user-where{
            padding: 10px 0 0 15px;
        }
        .user-body{
            display: flex;
            .user-left{
                // border: 1px solid black;
                width: 350px;
                // height: 200px;
                margin: 10px 5px 10px 10px;
                padding: 5px;
                .user-top{
                    height: 230px;
                    // border:1px solid black;
                    margin-bottom: 10px;
                    padding: 10px;
                    background-color: white;
                    display: flex;
                    flex-direction: column;
                    .user-introduction{
                        align-self: center;
                        margin-top: 5px;
                        font-size: 12px;
                        letter-spacing: 1px;
                        color: rgb(103, 194, 58)
                    }
                    .user-img{
                        align-self: center;
                        img{
                            width: 130px;
                            margin: 10px;
                            border-radius: 100px;
                        }
                    }
                    .user-update{
                        align-self: flex-end;
                        color: rgb(103, 194, 58);  
                    }
                    .user-update:first-child:hover{
                        cursor:pointer;
                    }
                    .user-nickName{
                        align-self: center;
                        font-size: 17px;
                    }
                }
                .user-bottom{
                    height: 217px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background-color: white;
                    .bottom-item{
                        padding: 8px;
                        align-items: center;
                        display: flex;
                        justify-content: space-between;
                        .item-title{
                            display: flex;
                            align-items: center;
                            gap:5px;
                            .myiconfont{
                                font-size: 22px;
                            }
                        }
                    }
                }
            }
            .user-right{
                position: relative;
                margin: 15px 0px;
                padding: 5px;
                // border:1px solid black;
                width: 740px;
                height: 467px;
                background-color: white;
                .right-head{
                    display: flex;
                    align-items: center;
                    .del_post{
                        margin: 10px;
                    }
                    .el-menu-demo{
                        height: 40px;
                        // width: 70%;
                        li{
                            // margin: 10px;
                            padding: 10px;
                            margin: 0 10px;
                        }
                    }
                }
                .right-view{
                    .delPost{
                        margin: 5px;
                    }
                }
                .right-page{
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    // padding-top:40px;
                    padding-bottom: 25px;
                    position: absolute;
                    bottom: 0;
                }
            }
        }
    }
    .userimg{
        img{
            width: 150px;
            height: 150px;
            border-radius: 100px;
            margin: 10px;
        }
    }
</style>