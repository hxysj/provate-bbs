import provate from "../http"

// 获得板块数据
export const getPlate = ()=>{
    return provate.get('/get_plate')
}