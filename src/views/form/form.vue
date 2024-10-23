<template>
    <div class="paltlist">
        <div class="paltlist-body">
            <div class="" v-show="!isIndex" ref="platRef">
                <el-button type="success" :class="{'active':!cid}" @click="changeurl('all')" plain>全部</el-button>
                <el-button type="success" :class="{'active':cid ===item.cid }" @click="changeurl(item.cid)" plain v-for="item in showplat" :key="item.cid" :data-id="item.cid">{{ item.name }}</el-button>
            </div>
        </div>
        <div class="postlist-all">
            <div class="postlist-left">
                <div class="postlist">
                    <div class="post-sort">
                        <div class="sort-active" @click="sortlist($event,'hot')">热榜</div>
                        <div>|</div>
                        <div @click="sortlist($event,'create')">发布时间</div>
                        <div>|</div>
                        <div @click="sortlist($event,'new')">最新</div>
                    </div>
                    <div  v-if="showlist.length !== 0">
                        <postItem v-for="item in showlist" :listItem="item" :key="item.tid"></postItem>
                    </div>
                    <div v-else>
                        <el-empty description="暂无数据" />
                    </div>
                </div>
                <div class="postlist-page" v-if="maxPage>1">
                    <el-pagination layout="prev, pager, next" @change="changePage" v-model:current-page="nowPage" :total="maxPage * 10"/>
                </div>
            </div>
            <MoreShow></MoreShow>
        </div>
    </div>
</template>

<script setup>
    import postItem from '@/components/postItem.vue'
    import { useRoute,useRouter } from "vue-router";
    import { onMounted,ref,watch,nextTick,computed} from 'vue'
    import { usePlatStore } from '@/stores'
    import { usePostStore } from '@/stores'
    import MoreShow from '@/components/moreShow/moreShow.vue'
    import api from '@/api'
    const platStore = usePlatStore()
    const postStore = usePostStore()
 
    const route = useRoute();
    // 获得首次跳转时的参数
    let pid  = ref(route.params.pid)
    let cid = ref(route.params.cid)
    // console.log(route.params)

    // 判断是否为首页
    let isIndex = ref(true)
    // 检测是否将小板块分类显示出来
    function checkBtnShow(pid,cid){
        // console.log(pid,cid)
        if(pid || cid){
            isIndex.value = false
        }else{
            isIndex.value = true
        }
    }

    // 目前大板块拥有的小板块
    let showplat = computed(()=>{
        let children = []
        platStore.takepaltlist.forEach(item=>{
            if(item.pid === pid.value){
                children = item.children
            }
        })
        return children
    })
    

    // 用于绑定板块模块的父元素
    const platRef = ref('')
    // 排序的方式
    const sortType = ref('hot')
    // 对帖子内容进行排序
    function sortlist(e,method){
        if(e.target.nodeName !== 'DIV'){
            return
        }
        document.querySelector('.sort-active').classList.remove('sort-active')
        e.target.classList.add('sort-active')
        if(method === 'hot'){
            sortType.value = 'hot'
        }else if(method === 'create'){
            sortType.value = 'create'
        }else{
            sortType.value = 'new'
        }
        // postStore.clearPosts()
        nowPage.value = 1
        changePage(1)
    }

    // 设置每页的数量
    const currentPage = ref(5)
    let maxPage = ref(0)
    let nowPage = ref(1)
    
    // 进行分页展示的数据列表
    const showlist = ref([])
    async function changePage(){
        window.scrollTo({
            top:0,
            behavior:'smooth'
        })

        // 帖子数据请求
         let res1 = await api.getpostData({
            pageIndex:nowPage.value,
            pid:pid.value,
            cid:cid.value,
            currentPage:currentPage.value,
            type:sortType.value
        })
        
        maxPage.value = res1.data.total_page
       
        res1 = res1.data.data.map(item=>{
            item.like = JSON.parse(item.like)
            return item
        })        
        // postStore.setPosts(res1)
        showlist.value = res1
    }


    // 根据位置（路由）不同，获取不同分类的帖子内容
    async function showpostlist(obj){
        // console.log(obj)
        // if(obj.pid === pid.value && obj.cid === cid.value){
        //     return
        // }
        // 路由携带的参数传递给psotStore进行搜索
        pid.value = obj.pid
        cid.value = obj.cid
        nowPage.value = 1
        changePage()

        if(!obj.pid && !obj.cid){
            //显示所有帖子数据 
            return
        }
        if( obj.pid && !obj.cid){
            // 显示大板块下所有帖子的数据
            // 通过nextTick等待dom元素更新完成后再进行操作
            nextTick(()=>{
                if(document.querySelector('.active')){
                    document.querySelector('.active').classList.remove('active')
                }
                platRef.value?.children[0].classList.add('active')
            })
            return
        }
        nextTick(()=>{
            if(document.querySelector('.active')){
                document.querySelector('.active').classList.remove('active')
            }
            for(const item of platRef.value?.children){
                const dataid = item.dataset.id ? item.dataset.id : 'all'
                if(dataid === obj.cid){
                    item.classList.add('active')
                }
            }
        })
    }

    const router = useRouter()
    // 点击改变板块
    function changeurl(cid){
        let routePath = router.currentRoute.value.fullPath.split('/')
        if(cid === 'all'){
            router.push(`/${routePath[1]}/${routePath[2]}`)
        }else{
            router.push(`/${routePath[1]}/${routePath[2]}/${cid}`)
        }
    }

    // 监听路由的变化
    watch(() => route.path,newRoute=> {
        // console.log(newRoute);
        let newobj = { 
            pid:newRoute.replace('/form/','').split('/')?.[0],
            cid:newRoute.replace('/form/','').split('/')[1] ? newRoute.replace('/form/','').split('/')[1] : ''}
        // console.log(newobj)
        checkBtnShow(newobj.pid,newobj.cid)
        // 要显示的帖子内容
        showpostlist(newobj)
    },{
        immediate:true
    })
    onMounted(async ()=>{
    })
</script>

<style lang="scss" scoped>
    .paltlist{
        width: 100%;
        margin-top: 10px;
        display: flex;
        // justify-content: center;
        flex-direction: column;
        align-items: center;
        .paltlist-body{
            width: 1140px;
            button{
                height: 25px;
                border-radius: 10px;
            }
        }
    }
    .active{
        background-color:rgb(103, 194, 58);
        color: white;
    }
    .postlist-all{
        width:1140px;
        display: flex;
        justify-content: space-between;
        .postlist-left{
            flex:1;
            margin:0 10px 0 0;
        }
    }
    .postlist{
        margin-top: 10px;
        width: 100%;
        background-color: white;
        .post-sort{
            display: flex;
            gap: 10px;
            padding: 10px;
            border-bottom: 1px solid rgb(231, 231, 231);
            // color: azure;
        }
        .post-sort :nth-of-type(5n+2){
            color: rgb(234, 234, 234);
        }
        .post-sort :nth-of-type(5n+4){
            color: rgb(228, 228, 228);
        }
        .sort-active{
            color:rgb(103, 194, 58);   
        }
        .post-sort :hover{
            cursor: pointer;
        }
    }
    .postlist-page{
        width: 100%;
        display: flex;
        padding: 20px 0;
        justify-content: center;
        // padding: 20px;
        background-color: white;
        margin-bottom: 40px;
    }
    @media(max-width:1140px){
        .paltlist .paltlist-body{
            width: 100%;
        }
        .postlist-all{
            width: 100%;
        }
    }
</style>