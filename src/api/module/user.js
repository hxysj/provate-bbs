import provate from '../http'

// 设置登录时间
export const setLoginTime = (obj)=>{
    provate.post('/set_login_time',{
        uid:obj.uid,
        time:obj.time
    })
}

// 登录
export const login = (name,pwd)=>{
    return provate.post('/login',{
        name:name,
        pwd:pwd
    })
}

// 获得用户的信息
export const get_user_info = (id) =>{
    return provate.post('/get_user_info',{
        uid:id
    })
}

// 设置用户的信息
export const set_user_info = (obj) =>{
    return provate.post('/set_user_info',{
        form:obj
    })
}

// 注册新用户
export const add_new_user = (obj) =>{
    return provate.post('/add_new_user',{
        form:obj
    })
}

// 检测用户名是否存在
export const check_user_name = (name) => {
    return provate.post('/check_name',{
        name:name
    })
}

// 获取喜欢的数量
export const getlikeNum = async (id) =>{
    return provate.get('/getlikeNum',{
        params:{
            id:id
        }
    })
}