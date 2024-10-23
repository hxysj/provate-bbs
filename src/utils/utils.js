// 获取当前时间
export function getTime(){
    let stamp= new Date().getTime() + 8 * 60 * 60 * 1000;
    let beijingTime = new Date(stamp).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 19)
    return beijingTime
}

// 获取现在时间
export function createNowTime(){
    let nowDate = new Date()
    let month = nowDate.getMonth() >= 9 ? nowDate.getMonth() + 1: '0' + (nowDate.getMonth() + 1)
    let day = nowDate.getDate() >= 10 ?  nowDate.getDate() : '0' + nowDate.getDate()
    let hour = nowDate.getHours() >= 10 ? nowDate.getHours() : '0' + nowDate.getHours()
    let minutes =  nowDate.getMinutes() >= 10 ? nowDate.getMinutes() :'0' + nowDate.getMinutes()
    return nowDate.getFullYear() + '-' + month + '-' + day  + ' ' + hour + ':' + minutes
}

export function parseToken(token){
    // 分割token以获取payload部分
    const base64Payload = token.split('.')[1];
    // 使用atob()解码payload
    const payload = JSON.parse(atob(base64Payload));
    // console.log(payload)
    return {
        icon:payload.icon,
        id:payload.userId,
        nickName:payload.nickName,
        identity:payload.identity
    }
}