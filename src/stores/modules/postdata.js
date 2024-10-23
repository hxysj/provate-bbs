import { defineStore } from "pinia";
import { ref } from 'vue'

export const usePostStore = defineStore('post',()=>{
    //存放用户加载过的的帖子详情数据
    const postList = ref([])
    
    // 获得指定tid的帖子数据
    const get_post_tid = (tid) =>{
        return postList.value.find(item=>item.tid == tid)
    }
    // 缓存加载过的帖子数据
    const make_cache_post = (obj) =>{
        postList.value.push(obj)
    }

    // 修改加载过的帖子（更新帖子的数据）
    const update_post_data = (obj) =>{
        // console.log(obj)
        postList.value = postList.value.map(item=>{
            if(item.tid == obj.tid){
                item = obj
            }
            return item
        })
        // console.log(postList.value)
    }
    
    return {
        get_post_tid,
        make_cache_post,
        update_post_data
    }
})