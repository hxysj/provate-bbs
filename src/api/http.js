import axios from "axios";
import { ElMessage } from "element-plus";
import router from '@/router'

// console.log(import.meta.env.VITE_API_BASE_URL)
const provate = axios.create({
    baseURL:import.meta.env.VITE_API_BASE_URL,
    timeout:1000
})

provate.interceptors.request.use(function(config){
    let token = localStorage.getItem('token')
    // console.log(token)
    if(!token){
        let reqList =[
            [
                '/add_post',
                '/update_post',
                '/add_leavel',
                '/update_leavel',
                '/del_leavel',
                '/change_msg_read',
                '/add_new_msg',
                '/set_login_time',
                '/set_user_info',
                '/getlikeNum'
            ]
        ]
        if(reqList.includes(config.url)){
            throw `无权进行${config.url}请求`
        }
    }
    config.headers.Authorization = token
    // console.log(config)
    return config
})

provate.interceptors.response.use((response)=>{
    return response
}, function (error){
    // console.log('响应拦截器')
    // console.log(error)
    if(!error.response){
        ElMessage.error('网络出现问题，连接失败！')
        return Promise.reject(error)
    }
    if(error.response.status === 401){
        ElMessage.error('登陆失效，请重新登陆！')
        localStorage.removeItem('token')
        setTimeout(()=>{
            router.push('/login')
        },3000)
        // router.push('/login')
        return Promise.reject(error)
    }
    return Promise.reject(error)
})

export default provate