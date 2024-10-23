import { defineStore } from "pinia";
import api from '@/api'
export const useLogsStore = defineStore('logs',()=>{
    // 设置新日志
    // obj需要的字段`uid`,`create_time`,`value`,`identity`
    const addLog = (obj) =>{
        api.setlog(obj)
    }
    return {
        addLog
    }
})