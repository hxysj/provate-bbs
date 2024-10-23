<template>
    <div class="index">
        <div class="index-body">
            <div class="index-left">
                <el-carousel height="180px" class="left-banner">
                    <el-carousel-item v-for="item in bannerList" :key="item.id">
                        <el-image :src="baseUrl+'/'+item.icon"></el-image>
                    </el-carousel-item>
                </el-carousel>
                <div class="navigation">
                    <div class="title">
                        <el-icon><Menu /></el-icon>
                        论坛导航
                    </div>
                    <div class="nav-content">
                        <div class="nav-item" v-for="item in platList" :key="item.pid">
                            <div class="item-title" @click="gotoForm('/' +item.pid)">[{{ item.name }}]</div>
                            <div class="item-children" v-for="it in item.children" :key="it.cid" @click="gotoForm('/' +item.pid + '/' + it.cid)">{{ it.name }}</div>
                        </div>
                    </div>
                </div>
                <div class="newPosts">
                    <div class="title">
                        <el-icon><Management /></el-icon>
                        最新帖子
                    </div>
                    <div v-if="postList.length">
                        <postItem v-for="item in postList" :listItem="item" :key="item.tid"></postItem>
                    </div>
                    <div class="status">
                        <div v-if="nowPage < maxPage" class="status-haveMore" @click="getMoreData()">
                            +加载更多
                        </div>
                        <div v-else class="status-noMore">
                            --到底了--
                        </div>
                    </div>
                </div>
            </div>
            <MoreShow></MoreShow>
        </div>
    </div>
</template>
<script setup>
    import MoreShow from '@/components/moreShow/moreShow.vue';
    import postItem from '@/components/postItem.vue'
    import { Menu,Management } from '@element-plus/icons-vue'
    import { ref,onMounted,getCurrentInstance } from 'vue'
    import { useRouter } from 'vue-router'
    import api from '@/api'
    
    const baseUrl = getCurrentInstance().appContext.config.globalProperties.$request_url
    const router = useRouter()
    const bannerList = ref([
        {
            id:0,
            icon:'banners01.png',
            src:''
        }
    ])
    
    // 存放显示的帖子数据
    let postList = ref([])
    let nowPage = ref(1)
    let currentPage = ref(5)
    let maxPage = ref(1)
    // 存放导航的数据
    let platList = ref([])
    // 点击前往板块列表
    const gotoForm = (url)=>{
        router.push('/form'+url)
    }

    // 请求获取帖子数据
    const getData = async ()=>{
        let res = await api.getpostData({
            pageIndex:nowPage.value,
            currentPage:currentPage.value,
            type:'new'
        })
        // console.log(res.data)
        maxPage.value = res.data.total_page
        let list = res.data.data
        list.map(item=>{
            item.like = JSON.parse(item.like)
            return item
        })
        postList.value = [...postList.value,...list]
    }
    // 点击加载更多
    const getMoreData = ()=>{
        nowPage.value += 1
        getData()
    } 
    onMounted(()=>{
        getData()
        // 获得板块列表的数据
        api.getPlate().then(res=>{
            platList.value = res.data
            // console.log(platList.value)
        })
    })

</script>

<style lang="scss" scoped>
    .index{
        width: 100%;
        display: flex;
        justify-content: center;
    }
    .index-body{
        display:flex;
        width: 1140px;
        .index-left{
            background-color: white;
            margin: 10px;
            flex:1;
            .left-banner{
                padding:20px;
                .el-image{
                    height: 100%;
                    width: 100%;
                }
                img{
                    width: 100%;
                    height: 100%;
                }
            }
            .navigation{
                padding:10px;
                background-color: rgba(0, 0, 0, 0.02);
                .nav-content{
                    display:flex;
                    flex-direction: column;
                    gap:4px;
                    .nav-item{
                        padding:5px 0;
                        display:flex;
                        flex-wrap: wrap;
                        gap:8px;
                        .item-title{
                            font-weight: 800;
                            color:rgb(7, 49, 112)
                        }
                        .item-title:hover{
                            cursor: pointer;
                        }
                        .item-children:hover{
                            color: rgb(171, 52, 16);
                            cursor: pointer;
                        }
                    }
                }
            }
            .title{
                    font-weight:1000;
                    display: flex;
                    align-items: center;
                    gap:5px;
                    padding-bottom:5px;
                    font-size: 18px;
                    color:rgb(103, 194, 58);
                }
            .newPosts{
                margin:10px;
                .status{
                    display:flex;
                    justify-content:center;
                    .status-haveMore:hover{
                        cursor: pointer;
                    }
                    .status-haveMore{
                        padding:30px;
                    }
                    .status-noMore{
                        width: 100%;
                        padding:30px;
                        text-align: center;
                        height: 100%;
                        background-color: rgba(0,0,0,0.04);
                    }
                }
            }
        }
    }
    @media(max-width:1140px){
        .index-body{
            width:100%;
        }
    }
</style>