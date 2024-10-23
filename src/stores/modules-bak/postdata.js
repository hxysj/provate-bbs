import { defineStore } from 'pinia'
import { ref,computed } from 'vue'
import api from '@/api'
export const usePostStore = defineStore('postdata',()=>{
    // 存放帖子列表
    const postlist = ref([])
    // 存放获得详情得帖子
    const postdetailList = ref([])
    // 存放获得的帖子
    const setPosts =(list)=>{
        // console.log(list)
        postlist.value = list
    }
    // 切换板块时清除获取的帖子，重新获取
    const clearPosts = () =>{
        postlist.value = []
    }

    // 获取帖子数据
    const getPosts = () =>{
        // console.log(postlist.value.slice((page-1)*currentPage,(page*currentPage)))
        return postlist.value
    }

    // 将获得得帖子详情缓存起来
    const savePostdetail = (postdetail)=>{
        if(postdetailList.value.find(item=>item.tid === postdetail)){
            return
        }
        postdetailList.value.push(postdetail)
    }

    // 将修改后的数据存回数据库中，实现数据永久保存
    const savePost = async (tid)=>{
        let obj = postdetailList.value.find(item=> item.tid === tid)
        // console.log(obj)
        await api.updataPost({
            tid:tid,
            like:obj.like
        })
    }

    // 添加留言功能
    const add_to_Leavel = async (list)=>{
        await api.addDbLeavel(list)
        ElMessage({
            message: '发表评论成功！',
            type: 'success',
        })
    }
    // 删除留言
    const rm_to_leavel = async (lid)=>{
        await api.rmLeaveldb(lid)
    }
    // 留言点赞，取消赞功能
    const save_leavel_like = async (list)=>{
        await api.updateLeavelLike(list)
        ElMessage({
            message: '操作成功！',
            type: 'success',
        })
    }

    // 根据tid获取帖子的内容
    const searchForid = (tid,del=false)=>{
        // console.log(tid)
        let post = ''
        if(del){
            postlist.value.forEach(item=>{
                if(item.tid === tid){
                    post = item
                }
            })
        }else{
            postdetailList.value.forEach(item=>{
                // console.log(item)
                if(item.tid === tid){
                    post = item
                }
            })
        }
        return post
    }

    // 根据tid和uid  给对应帖子添加上点赞的用户
    const changePostlike = (tid,uid,n)=>{
        // console.log(tid,uid)
        postdetailList.value.map(item=>{
            if(item.tid === tid){
                // console.log(item)
                if(n === 1){
                    item.like.push(uid)
                }else if(n === -1){
                    for(let i = 0;i<item.like.length;i++){
                        if(item.like[i] === uid){
                            item.like.splice(i,1)
                        }
                    }
                }
            }
        })
        
        savePost(tid)
        ElMessage({
            message: '操作成功！',
            type: 'success',
        })
    }

    // 将帖子留言列表传入，要给谁留言的留言id，要新添加的内容
    function searchLid(list,lid,newLeave,uid,lindex,newlid){
        let result = []
        // console.log(list)
        for(let i=0;i<list.length;i++){
            // console.log(list[i].lindex, lindex-1 ,list[i].lid, lid)
            if(list[i].index === lindex-1 && list[i].lid === lid){
                list[i].children ? list[i].children.push({
                    lid:newlid,
                    uid:uid,
                    index:lindex,
                    value:newLeave,
                    createTime: getTime(),
                    like:[]
                }) : list[i].children = [{
                    lid:newlid,
                    uid:uid,
                    index:lindex,
                    value:newLeave,
                    createTime: getTime(),
                    like:[]
                }]
                return list
            }
            if(list[i].children){
                result = searchLid(list[i].children,lid,newLeave,uid,lindex,newlid)
            }
        }
        return result
    }

    // 获取当前时间
    function getTime(){
        let stamp= new Date().getTime() + 8 * 60 * 60 * 1000;
        let beijingTime = new Date(stamp).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 19)
        return beijingTime
    }

    // 根据tid和lid添加留言
    const addLeave = (tid,newleave,uid,lid,lindex,newlid)=>{
        // 通过tid获取要在哪篇帖子中写留言
        add_to_Leavel([newlid,uid,tid,newleave,lindex,getTime(),'[]',lid === ''? null : lid])
        postdetailList.value.map(item=>{
            // 找到对应的帖子
            if(item.tid === tid){
                // const newLeaveList = sea
                // 判断是否为新的留言还是子留言,添加新的留言时，lindex默认为-1，其他子留言传入的时父index+1
                if(lindex === -1){
                    item['leave_list'].push({
                        lid:newlid,
                        uid:uid,
                        index:lindex,
                        value:newleave,
                        createTime: getTime(),
                        like:[]
                    })
                }else{
                    searchLid(item['leave_list'],lid,newleave,uid,lindex,newlid)
                }
            }
        })
        // console.log(postlist.value)
    }

    // 寻找要删除的leave
    function removeLeave(list,lid){
        for(let i =0; i< list.length;i++){
            if(list[i].lid === lid){
                list.splice(i,1)
            }else{
                if(list[i].children){
                    removeLeave(list[i].children,lid)
                }
            }
        }
    }
    // 根据tid和lid删除留言，如果留言下有chidlren则全部删除
    const deleteLea = (tid,lid)=>{
        postdetailList.value.forEach(item=>{
            if(item.tid === tid){
                removeLeave(item['leave_list'],lid)
            }
        })
        
        rm_to_leavel(lid)
    }
    
    // 找对对应的lid的留言，添加uid进like中
    const addlikeLeave = (list,lid,uid)=>{
        // console.log(list)
        for(let i=0;i<list.length;i++){
            // console.log(list[i])
            if(list[i].lid === lid){
                // console.log(uid)
                list[i].like.push(uid)
                save_leavel_like({like:list[i].like,lid:lid})
                // console.log(list[i])
            }else{
                if(list[i].children){
                    addlikeLeave(list[i].children,lid,uid)
                }
            }
        }
    }

    // 根据获取的tid,uid和lid，给对应的留言添加点赞
    const addLike = (tid,lid,uid)=>{
        // console.log(tid,lid,uid)
        postdetailList.value.forEach(item=>{
            // console.log(item)
            if(item.tid === tid){
                addlikeLeave(item['leave_list'],lid,uid)
            }
        })
    }

    const rmlikeLeave = (list,lid,uid)=>{
        for(let i=0;i<list.length;i++){
            // console.log(list[i])
            if(list[i].lid === lid){
                // console.log(uid)
                list[i].like = list[i].like.filter(item=>item !== uid)
                // console.log(list[i])
                save_leavel_like({like:list[i].like,lid:lid})
            }else{
                if(list[i].children){
                    rmlikeLeave(list[i].children,lid,uid)
                }
            }
        }
    }

    // 根据获得的tid，uid和lid，取消对应留言的赞
    function removeLike(tid,lid,uid){
        postdetailList.value.forEach(item=>{
            if(item.tid === tid){
                rmlikeLeave(item['leave_list'],lid,uid)
            }
        })
    }


    // 添加新的帖子
    function addNewPost(list){
        // console.log(list)
        const time = getTime()
        const [pid,cid] = list.plat
        const newForm = ref({
            uid:list.uid,
            pid:pid,
            cid:cid,
            tid:+new Date() + Math.floor(Math.random() * 1000),
            title:list.title,
            abstract:list.abstract,
            content:list.content,
            "create_time":time,
            tImg:list.tImg,
            like:[],
            "leave_list":[]
        })
        // 获取到帖子内容后，添加到数据中
        // console.log(newForm)
        postlist.value.push(newForm.value)
        api.addPost(newForm.value)
        // console.log(postlist.value)
    }

    function searchleave(list,lid){
        let result = {}
        for(const item of list){
            if(item.lid === lid){
                result = item
                break
            }
            if(item.children){
                result = searchleave(item.children,lid)
            }
            if(result.lid){
                break
            }
        }
        return result
    }

    // 根据帖子id和留言id找对应的留言
    function searchForLid(tid,lid){
        // console.log(tid,lid)
        const result = ref({})
        postdetailList.value.forEach(item=>{
            if(item.tid === tid){
                result.value =  searchleave(item['leave_list'],lid)
            }
        })
        // console.log(result.value)
        return result.value
    }
    // 删除帖子
    function delpost(tid){
        postlist.value = postlist.value.filter(item=>item.tid !== tid)
        api.delPost(tid)
    }
    return{
        setPosts,
        searchForid,
        addLeave,
        deleteLea,
        addLike,
        removeLike,
        changePostlike,
        addNewPost,
        searchForLid,
        delpost,
        savePostdetail,
        getPosts,
        clearPosts
    }
})