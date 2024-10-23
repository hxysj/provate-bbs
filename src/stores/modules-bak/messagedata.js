import api from '@/api/index.js'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { ref,computed } from 'vue'
export const useMessageStore = defineStore('message',()=>{
    // 获取用户的消息列表
    const messagelist = ref([])
    const setMessage = (list)=>{
        messagelist.value = list.reverse()
    }
    // 获取当前用户的消息
    const getUserMessage = computed(()=>{ return messagelist.value})

    // 修改消息是否已读
    const setRead = (mid) => {
        // console.log(messagelist.value)
        ElMessage({
            type:'success',
            message:'操作成功！'
        })
       messagelist.value.map(item=>{
        if(item.mid === mid){
            item.isread = 1
        }
       })
        api.setMsgRead({mid:mid,isread:1})
    }

    const addMessage = (type,list,uid) =>{
        const mid = +new Date()
        const newObj = {
            uid:uid,
            type:type,
            mid:mid,
            isread:0
        }
        for(const key in list){
            newObj[key] = list[key]
        }
        api.addMessage(newObj)
        messagelist.value.unshift(newObj)
    }


    return {
        setMessage,
        getUserMessage,
        setRead,
        addMessage
    }

})