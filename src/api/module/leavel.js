import provate from "../http";


// 添加留言
export const addDbLeavel = (obj) =>{
    return provate.post('/add_leavel',{
        list:obj
    })
}

// 留言点赞和取消赞
export const updateLeavelLike = (obj) =>{
    return provate.post('/update_leavel',{
        list:obj
    })
}
// rm_db_leavel
export const rmLeaveldb = (lid)=>{
    return provate.post('/del_leavel',{
        lid:lid
    })
}