<template>
    <div class="search no-choose">
        <div class="search-inp">
            <el-input
                v-model="mysearch"
                style="width: 600px;border:none;height: 42px;"
                placeholder="请输入你要搜索的帖子"
                clearable
                :icon="Search"
            />
            <el-button @click="search" class="search-btn" :icon="Search"></el-button>
        </div>
        <div class="result">
            <postItem v-for="item in showlist" :listItem="item" :key="item.tid" v-if="showlist.length > 0"></postItem>
            <el-empty description="没有找到你要的数据" v-else/>
        </div>
        <div class="result-page" v-if="maxPage >1">
            <el-pagination layout="prev, pager, next" @change="changePage" v-model:current-page="nowPage" :total="maxPage * 10"/>
        </div>
    </div>
</template>

<script setup>
    import postItem from '@/components/postItem.vue'
    import { Search } from '@element-plus/icons-vue'
    import { nextTick, ref } from 'vue'
    import api from '@/api'
    const mysearch = ref('')
    nextTick(()=>{
        document.querySelector('.search-inp').addEventListener('click',()=>{
            document.querySelector('.search').classList.remove('no-choose')
            document.querySelector('.search').classList.add('choose')
            document.querySelector('.search .el-button').style.display = 'inline-block'
        })
    })

    async function search(){
        if(!mysearch.value){
            ElMessage({
                type:'error',
                message:'请输入你要搜索的内容'
            })
            return
        }
        document.querySelector('.result').style.display = 'block'
        
        let res = await api.searchPosts({
            str:mysearch.value,
            pageIndex:nowPage.value,
            currentPage:currentPage.value
        })
        // console.log(res.data)
        showlist.value = res.data.data
        maxPage.value = res.data.total_page
        
        // item-title
        nextTick(()=>{
            // console.log(document.querySelector('.result .item-title').innerHTML)
            if(showlist.value.length > 0){
                // 将添加过的高亮删除
                const oldtitles = document.querySelectorAll('.result .item-title')
                for(const item of oldtitles){
                    item.innerHTML = item.innerHTML.replace(/\<span style="color:red"\>(.*?)\<\/span\>/,"$1")
                }
                // 添加上高亮
                const titles = document.querySelectorAll('.result .item-title')
                for(const item of titles){
                    item.innerHTML = item.innerHTML.replace(mysearch.value,`<span style="color:red">${mysearch.value}</span>`)
                }
            }
        })
    }
    // 每页展示的条数
    const currentPage = ref(4)
    // 最大页码
    const maxPage = ref(1)
    // 当前页码
    const nowPage = ref(1)
    // 页码展示的数据
    const showlist = ref([])
    // 改变页码
    async function changePage(){
        let res = await api.searchPosts({
            str:mysearch.value,
            pageIndex:nowPage.value,
            currentPage:currentPage.value
        })
        // console.log(res.data)
        showlist.value = res.data.data
        maxPage.value = res.data.total_page

        nextTick(()=>{
            const oldtitles = document.querySelectorAll('.result .item-title')
            for(const item of oldtitles){
                item.innerHTML = item.innerHTML.replace(/\<span style="color:red"\>(.*?)\<\/span\>/,"$1")
            }
            // 添加上高亮
            const titles = document.querySelectorAll('.result .item-title')
            for(const item of titles){
                item.innerHTML = item.innerHTML.replace(mysearch.value,`<span style="color:red">${mysearch.value}</span>`)
            }
        })
    }
</script>

<style lang="scss" scoped>
    .search{
        margin: 10px;
        padding-top: 10px;
        width: 1140px;
        background-color: white;
        height: 80vh;
        display: flex;
    }
    .no-choose{
        justify-content: center;
        align-items: center;
    }
    .choose{
        align-items: center;
        flex-direction: column;
    }
    .el-button{
        height: 43px;
        display: none;
    }
    .result{
        display: none;
        width: 100%;
    }
    @media(max-width:1140px){
        .search{
            width: 100%;
        }
    }
</style>