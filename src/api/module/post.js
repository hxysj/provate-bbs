import provate from '../http'

// 获取帖子数据的请求
export const getpostData = (obj)=>{
    // console.log(obj)
    return provate.get('/get_posts?obj='+JSON.stringify(obj))
}

// 获取指定用户的帖子列表
export const getUserPostData = (obj)=>{
    // console.log(obj)
    return provate.get('/get_user_posts?obj='+JSON.stringify(obj))
}

// 随机获取帖子数据
export const getRandomPosts = ()=>{
    return provate.get('/get_random_post')
}

// 搜索帖子
export const searchPosts = ( obj )=>{
    return provate({
        url:'/search_post',
        params:{
            ...obj
        }
    })
}

// 获取帖子的详情数据
export const getpostDetail = (tid) =>{
    return provate.get('/get_post_detail?tid='+tid)
}

// 更新点赞数据
export const updatePost = (obj)=>{
    // console.log(obj)
    return provate.post('/update_post',{
        list:obj
    })
}


// 添加新的帖子
export const addPost = (form)=>{
    return provate.post('/add_post',{
        form:form
    })
}

// 删除指定tid的帖子
export const delPost = (tid, uid)=>{
    return provate.post('/del_post',{
        tid:tid,
        uid:uid
    })
}