import { defineStore } from "pinia";
import { ref,computed } from 'vue'
import api from '@/api'

export const useUserStore = defineStore('user',()=>{
    
    // 获取当前时间
    function getTime(){
        let stamp= new Date().getTime() + 8 * 60 * 60 * 1000;
        let beijingTime = new Date(stamp).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 19)
        return beijingTime
    }
    
    // 存放缓存过的用户数据
    let  userlist = ref([])

    // 要获取的用户信息
    let user_info = ref()

    // 获取用户信息
    async function getUserInfo(uid){
        let user = userlist.value.find(item=>item.id === uid)
        if(!user){
            try{
                // console.log(uid)
                user =(await api.get_user_info(uid)).data
                // console.log(user)
                userlist.value.push(user)
            }catch(e){
                console.log('is error')
                // console.log(e)
                return
                // console.log(e)
            }
        }
        // console.log(user)
        user_info.value = user
    }

    // 获取选中的用户的信息
    const get_user_info = computed(()=>{
        return user_info.value
    })
    
    // 检查用户和密码是否正确,登录功能
    const checkUser =async (user,pwd)=>{
        let result 
        try{
            result = await api.login(user,pwd)
        }catch(e){
            console.log(e)
            return
        }
        if(!result){
            return
        }
        // console.log(result)
        let token = result.data
        return {
            status:true,
            data:token
        }
    }
    
    // 检查用户是否存在
    const haveUser =async (user) =>{
        let result = await api.check_user_name(user)
        // isHave.value = flag.value
        if(result.data.length !== 0){
            return true
        }
        return false
    }
    // 添加用户-注册功能
    const pushUser = (user,pwd) => {
        let id = +new Date()
        const form = {
            id:id,
            name:user,
            password:pwd,
            nickName:user,
            icon:'default.svg',
            "create_time":getTime()
        }
        userlist.value.push({
            id:form.id,
            nickName:form.nickName,
            icon:form.icon
        })
        api.add_new_user(form)
        // console.log(userlist)
        return true
    }


    const getlikeNum = async (id)=>{
        // console.log(id)
        let result = await api.getlikeNum(id)
        // console.log(result.data)
        return result.data.length
    }
    // 退出登录
    function outLogin(){
        localStorage.removeItem('token')
    }

    // 根据uid获取用户的信息
    function searchForid(uid){
        // console.log(userlist.value)
        let user = ref({})
        userlist.value.forEach(item=>{
            if(item.id === uid){
                user.value = item
            }
        })
        return user.value
    }

    // 设置用户信息
    async function setuser(form,uid){
        form.id = uid
        userlist.value = userlist.value.map(item=>{
            if(item.id === uid){
                item.icon = form.icon,
                item.nickName = form.nickName
            }
            return item
        })
    }

    return {
        checkUser,
        haveUser,
        getUserInfo,
        get_user_info,
        pushUser,
        outLogin,
        searchForid,
        setuser,
        getlikeNum
    }
})