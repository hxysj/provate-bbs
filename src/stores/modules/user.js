import { defineStore } from "pinia";
import { ref,computed } from 'vue';

export const useUserStore = defineStore('user',()=>{
    // 存放当前登陆的用户的信息
    const userInfo = ref()

    // 设置当前用户的信息
    const setUserInfo = (form) =>{
        userInfo.value = form
    }
    
    // 获取用户信息
    const getUserInfo = computed(()=>{
        userInfo.value
    })

    // 退出登陆
    const outLogin = () =>{
        localStorage.removeItem('token')
    }

    return {
        setUserInfo,
        getUserInfo,
        outLogin
    }
})