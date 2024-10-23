import provate from "../http";

// 读取消息列表
export const getMessage = (uid)=>{
    // console.log(uid)
    return provate.get('/get_message',{
        params:{
            uid:uid
        }
    })
}

// 设置已读状态
export const setMsgRead = (obj) =>{
    return provate.post('/change_msg_read',{
        mid:obj.mid,
        isread:obj.isread
    })
}

export const addMessage = (obj)=>{
    return provate.post('/add_new_msg',{
        obj:obj
    })
}