
import { getMessage,setMsgRead,addMessage  } from "./module/message.js";
import { 
    getpostData,
    getUserPostData,
    updatePost,
    addPost,
    delPost,
    getpostDetail,
    getRandomPosts,
    searchPosts
} from './module/post.js'
import { getPlate } from './module/plate.js'
import { addDbLeavel,updateLeavelLike,rmLeaveldb } from './module/leavel.js'
import { 
    setLoginTime,
    login,
    get_user_info,
    set_user_info,
    add_new_user,
    check_user_name,
    getlikeNum 
} from './module/user.js'

import { setlog } from "./module/log.js";
// export default 语句用于指定模块的默认输出，一个模块只能有一个默认输出，
// 因此export default 命令只能使用一次，所以说当我们使用 export default 导出时，用 import 导入不用加大括号
// export 语句用于从模块中导出实时绑定的函数、对象、原始值，使其可以通过 import 导入，导出时可以导出任意数量
export default{
    getMessage,
    setMsgRead,
    addMessage,
    getpostData,
    getUserPostData,
    getRandomPosts,
    getpostDetail,
    searchPosts,
    updatePost,
    addDbLeavel,
    updateLeavelLike,
    addPost,
    delPost,
    getPlate,
    rmLeaveldb,
    setLoginTime,
    login,
    get_user_info,
    set_user_info,
    add_new_user,
    check_user_name,
    getlikeNum,
    setlog
}

