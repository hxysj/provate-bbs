import { defineStore } from 'pinia'
import { ref,computed } from 'vue'
export const usePlatStore = defineStore('plat',()=>{
    const paltlist = ref([])
    const setpaltlist = (list) =>{
        paltlist.value = list
    }
    // 返回板块的列表
    const takepaltlist = computed(()=>{
        return paltlist.value
    }) 
    return {
        setpaltlist,
        takepaltlist
    }
})