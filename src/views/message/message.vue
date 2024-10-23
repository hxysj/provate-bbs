<template>
    <div class="message">
        <el-tabs 
            v-model="activeName" 
            class="demo-tabs" 
            @tab-click="handleClick"
            active-text-color="#67c23a"
            active-bar-color="#67c23a"
        >
            <el-tab-pane label="全部" name="first">
                <div v-for="item in messageData" :key="item.mid" class="message-item">
                    <!-- {{ item }} -->
                    <div>
                        <span class="noRead" :class=" item.isread ? 'isread' : ''"></span> 
                        <span v-if="item.type === 'leavel'">
                            <span class="item-ut" @click="gotoOther({uid:item.wid})">{{ item.wname }}</span> 回复了你 -- "{{ item.value }}"</span>
                        <span v-else-if="item.type === 'post'">
                            <span class="item-ut" @click="gotoOther({uid:item.wid})">{{ item.wname }}</span> 点赞了你的帖子 -- 帖子:<span class="item-ut" @click="gotoOther({tid:item.tid})">{{ item.value }}</span></span>
                        <span v-else><span class="item-ut" @click="gotoOther({uid:item.wid})">{{ item.wname }}</span> 点赞了你的评论 -- 评论: {{ item.value }}</span>
                    </div>
                    <div v-show="!item.isread">
                       <el-button type="success" @click="changeRead(item.mid)">标记为已读</el-button>
                    </div>           
                </div>

            </el-tab-pane>
            <el-tab-pane label="回复我的" name="second">
                <div v-for="item in leaveMessage" :key="item.mid" class="message-item">
                    <div>
                        <span class="noRead" :class=" item.isread ? 'isread' : ''"></span>
                        <span class="item-ut" @click="gotoOther({uid:item.wid})">{{ item.wname }}</span> 回复了你 -- "{{ item.value }}"
                    </div>
                    <div v-show="!item.isread">
                       <el-button type="success" @click="changeRead(item.mid,uid)">标记为已读</el-button>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="赞了我的文章" name="third">
                <div v-for="item in postMessage" :key="item.mid" class="message-item">
                    <div>
                        <span class="noRead" :class=" item.isread ? 'isread' : ''"></span>
                        <span class="item-ut" @click="gotoOther({uid:item.wid})">{{ item.wname }}</span> 点赞了你的帖子 -- 帖子: <span class="item-ut" @click="gotoOther({tid:item.tid})">{{ item.value }}</span>
                    </div>
                    <div v-show="!item.isread">
                       <el-button type="success" @click="changeRead(item.mid,uid)">标记为已读</el-button>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="赞了我的评论" name="fourth">
                <div v-for="item in likeLeaveMessage" :key="item.mid" class="message-item">
                    <div>
                        <span class="noRead" :class=" item.isread ? 'isread' : ''"></span>
                        <span class="item-ut" @click="gotoOther({uid:item.wid})">{{ item.wname }}</span> 点赞了你的评论 -- 评论: {{ item.value }}
                    </div>
                    <div v-show="!item.isread">
                       <el-button type="success" @click="changeRead(item.mid,uid)">标记为已读</el-button>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup>
    import { ref,onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { useMessageStore } from '@/stores'
    import { parseToken } from '@/utils/utils'
    import api  from '@/api/index.js'
    const messageStore = useMessageStore()
    const activeName = ref('first')
    
    const uid = parseToken(localStorage.getItem('token')).id

    const router = useRouter()

    const messageData = ref()
    // 获取点赞文章的消息
    const postMessage  = ref([])

    // 获取点赞评论的消息
    const likeLeaveMessage = ref([])
    // 获取回复的消息
    const leaveMessage = ref([])

    function handleClick(tab,event){
        // console.log(tab,event)
    }
    // 更改已读的状态
    function changeRead(mid){
        messageStore.setRead(mid)
    }
    // 点击前往帖子或用户
    function gotoOther(obj){
        // console.log(obj)
        if(obj.tid){
            router.push('/postdetail/'+obj.tid)
        }else{
            router.push('/userInfo/'+obj.uid)
        }
    }
    onMounted(async ()=>{
        let res1 = await api.getMessage(uid)
        // console.log(res1.data)
        messageStore.setMessage(res1.data)
        messageData.value = messageStore.getUserMessage
        postMessage.value = messageData.value.filter(item=>item.type === 'post')
        likeLeaveMessage.value = messageData.value.filter(item=>item.type === 'like_leavel')
        leaveMessage.value = messageData.value.filter(item=>item.type === 'leavel')
    })
</script>

<style lang="scss" scoped>
    .message{
        margin-top:30px;
        width: 1140px;
        background-color: white;
    }
    .demo-tabs{
        padding: 15px;
    }
    .demo-tabs > .el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
    }
    .message-item{
        padding: 20px;
        border-bottom: 1px solid rgb(237, 237, 237);
        margin: 0 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .item-ut:hover{
            color: rgba(0,0,0,0.4);
            cursor: pointer;
        }
    }

    .noRead{
        height: 8px;
        width: 8px;
        margin-right: 10px;
        display: inline-block;
        background-color: red;
        border-radius: 50px;
    }
    .isread{
        background-color:white;
    }
</style>