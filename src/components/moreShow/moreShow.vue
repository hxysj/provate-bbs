<template>
    <div class="right">
        <div class="postlist-right">
            <div class="right-title">
                <h3>欢迎您！😀</h3>
                <div>在这里寻找你想要的答案吧！</div>
            </div>
            <div class="right-time">
                当前时间：{{time}}
                <el-button type="success" class="plat-button" @click="gotoClassify">板块广场</el-button>
            </div>
            <div class="right-random">
                <!-- 随机获取帖子 -->
                <div class="random-title">
                    <div>相关推荐</div>
                    <div @click="getRandomPost()">
                        <el-icon><Refresh /></el-icon>
                        换一批
                    </div>
                </div>
                <div class="random-text">
                    <div v-for="item in randomList" @click="gotoDetail(item.tid)" :key="item.tid"> · {{ item.title }}</div>
                </div>
            </div>
            <div class="right-other">
                本论坛用于学习，在这里可以发表自己的言论，寻求网友帮助，请勿传播色情言论，非法煽动他人！！
            </div>
        </div>
    </div>
</template>
<script setup>
    import { Refresh } from '@element-plus/icons-vue'
    import { ref,computed,onMounted } from 'vue'
    import api from '@/api'
    import { useRouter } from 'vue-router'
    
    const router = useRouter()
    
    const nowTime = ref('')
    const time = computed(()=>nowTime.value)
    // 获取当前的时间
    const getNowTime = ()=>{
        // 创建一个 Date 对象，它将包含当前日期和时间
        let currentDate = new Date();

        // 获取当前的年、月、日、时、分、秒
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth() + 1; // 月份是从 0 开始的，所以要加 1
        let day = currentDate.getDate();
        let hours = currentDate.getHours();
        let minutes = currentDate.getMinutes();
        let seconds = currentDate.getSeconds();

        // 可以根据需要进行格式化输出，比如输出成字符串
        nowTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    // 存放随机获得的帖子数据
    let randomList = ref([])
    // 随机获取帖子数据
    const getRandomPost = async () =>{
        let {data} = await api.getRandomPosts()
        randomList.value = data
    }
    // 点击随机获取的帖子前往帖子详情
    const gotoDetail = (tid) =>{
        router.push('/postdetail/'+tid)
    }
    onMounted(()=>{
        setInterval(()=>{
            getNowTime()
        },1000)
        getRandomPost()

        window.addEventListener('scroll',function(){
            if(!this.document.querySelector('.right>.postlist-right')) return
            let scrollDistance = window.scrollY
            if(scrollDistance > 80){
                this.document.querySelector('.postlist-right').style.top = '10px'
            }else{
                this.document.querySelector('.postlist-right').style.removeProperty('top')
            }
        })
    })
    // 点赞前往板块广场
    const gotoClassify = ()=>{
        router.push('/classify')
    }


</script>
<style lang="scss" scoped>
    .right{
        width:300px;
        margin: 10px 0;
    }
    .postlist-right{
        position: fixed;
        right: calc((100% - 1140px)/2);
        // bottom:0;
        // height: 100%;
        width: 300px;
        &>div{
            border-radius: 10px;
        }
        .right-title{
            background-color: white;
            padding: 10px;
            line-height: 30px;
            margin-bottom:10px;
        }
        .right-time{
            background-color: white;
            padding: 15px;
            font-weight: 800;
            color:rgb(103, 194, 58);
            margin:15px 0;
            .plat-button{
                margin: 10px 0;
                width: 100%;
                height: 50px;
                font-size: 20px;
            }
        }
        .right-random{
            padding: 15px;
            background-color: white;
            .random-title{
                display: flex;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(0,0,0,0.2);
                width: 100%;
                justify-content: space-between;
                font-size: 20px;
                align-items: center;
                font-weight: 800;
                &>:last-child{
                    font-size: 12px;
                    color: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    gap:3px;
                }
                &>:last-child:hover{
                    cursor: pointer;
                }
            }
            .random-text{
                 div{
                    padding: 7px;
                    white-space:nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 25px;
                    border-bottom:1px solid rgba(0,0,0,0.08);
                }
                div:hover{
                    background-color: rgba(0,0,0,0.05);
                    cursor: pointer;
                }
            }
        }
        .right-other{
            background-color: white;
            margin: 15px 0;
            padding: 10px;
            color: rgba(0,0,0,0.4);
        }
    }
    @media(max-width:1140px){
        .postlist-right{
            right: 5px;
        }
    }
    @media(max-width:940px){
        .right{
            display: none;
        }
    }
</style>