import provate from "../http";

export const setlog = (obj)=>{
    return provate.post('/set_logs',{
        obj:obj
    })
}