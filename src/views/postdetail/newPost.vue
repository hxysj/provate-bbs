<template>
    <div class="postTitle">
        当前位置：发帖页面
    </div>
    <div class="post">
        <div class="left">
            <div style="border: 1px solid #ccc">
            <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
            />
            <Editor
                style="height: 500px; overflow-y: hidden;"
                v-model="valueHtml"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
            />
            </div>
        </div>
        <div class="right">
            <div class="right-title">设置</div>
            <el-form
                ref="ruleFormRef"
                style="max-width: 600px"
                :model="ruleForm"
                status-icon
                :rules="rules"
                label-width="auto"
                class="demo-ruleForm"
            >
                <el-form-item label="标题" prop="title">
                    <el-input v-model="ruleForm.title" placeholder="请输入标题"/>
                </el-form-item>
                <el-form-item label="板块" prop="plat">
                    <div class="m-4" style="width: 100%;">
                        <el-cascader placeholder="请选择板块" v-model="ruleForm.plat" :options="options" style="width: 100%;"/>
                    </div>
                </el-form-item>
                <el-form-item label="封面">
                    <el-upload
                        class="avatar-uploader"
                        :show-file-list="false"
                        :auto-upload="false"
                        :on-change="uploadChange"
                    >
                        <img v-if="imageUrl" :src="imageUrl" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                    </el-upload>
                </el-form-item>
                <el-form-item label="摘要">
                    <el-input 
                        v-model="ruleForm.abstract" 
                        maxlength="150"
                        style="width: 100%;"
                        placeholder="请输入摘要"
                        show-word-limit
                        :rows="4"
                        type="textarea"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="success" @click="submitForm(ruleFormRef)" class="submit"
                        >保存</el-button
                    >
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
    import '@wangeditor/editor/dist/css/style.css' // 引入 css
    import { Plus } from '@element-plus/icons-vue'
    import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
    import { onBeforeUnmount, ref, shallowRef, onMounted,nextTick, getCurrentInstance } from 'vue'
    import { useRouter } from 'vue-router'
    import axios from 'axios'
    import api from '@/api'
    import { usePostStore,usePlatStore,useLogsStore,useUserStore } from '@/stores'
    import { parseToken, createNowTime } from '@/utils/utils'
    import { ElMessage } from 'element-plus'
    import { v4 as uuidv4 } from 'uuid'
    const postStore = usePostStore()
    const platStore = usePlatStore()
    const logsStore = useLogsStore()
    const userStore = useUserStore()
    const router = useRouter()
    // 记录上传的所有图片（包括删除的）
    const uploadImgs = ref([])
    
    const baseUrl = getCurrentInstance().appContext.config.globalProperties.$request_url
    //
    // 右侧表单
    // 编辑器配置区
    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef()
    const mode = ref('default')
    // 内容 HTML
    const valueHtml = ref('')
    // 配置
    const toolbarConfig = {}
    const editorConfig = { 
        placeholder: '请输入内容...',
        MENU_CONF:{
            uploadImage:{
                server:baseUrl+'/upload_img_detail',
                type:'post',
                // fieldName:'myUpload', //设置from-data中的字段名
                allowedFileTypes:['image/*'],
                // 上传成功时触发
                onSuccess(file,res){
                    // console.log(file.name)
                    let url = res.data.url
                    // console.log(url)
                    let imageName = url.replace(baseUrl+'/','')
                    // 上传成功后，将图片记录到uploadImgs中
                    uploadImgs.value.push(imageName)
                }
            }
        }
    }
    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
        const editor = editorRef.value
        if (editor == null) return
        editor.destroy()
    })
    const handleCreated = (editor) => {
      editorRef.value = editor // 记录 editor 实例，重要！
    }



    // --------------------------------------------------------------------
    // 绑定表单
    const ruleFormRef = ref(null)
    // 表单数据
    const ruleForm = ref({
        uid:'',
        title:'',
        plat:[],
        tImg:'',
        abstract:'',
        content:'',
    })

    // 表单的规则
    const rules = ref({
        title:[
            { required:true,message:'请输入帖子的标题',trigger:'blur' }
        ],
        plat:[
            { required:true,message:'请选择对应的板块',trigger:'blur' }
        ]
    })
    // 板块选择绑定的内容
    // let platvalue = ref('')
    // 选择后内容变成  【pid，cid】
    // platvalue.value = platStore.takepaltlist
    let options = ref([])
    // 将板块数据进行处理，变成表单中需要的options
    function changePlatlist(list,options,children=false){
        for(let i=0;i<list.length;i++){
            options[i] = {}
            options[i]['label'] = list[i].name
            if(children){
                options[i]['value'] = list[i].cid
            }else{
                options[i]['value'] = list[i].pid
            }
                if(list[i].children){
                options[i].children = []
                changePlatlist(list[i].children,options[i].children,true)
            } 
        }
    }

    // 创建随机的文件名
    const uniqueSuffix = uuidv4()
    // console.log(uniqueSuffix)
    // 提交（包括左边编辑器的内容和右边表单的内容）
    async function submitForm(ruleFormRef){
        // ----------------------------------
        const showImgs = document.querySelectorAll('.w-e-scroll img')
        // 现在编辑器中剩下的图片名称
        let nowImgs = ref([])
        for(const item of showImgs){
            nowImgs.value.push(item.src.replace(baseUrl+'/',''))
        }
        const list = uploadImgs.value.filter(item=>!nowImgs.value.includes(item))
        // 通知express图片被删除了，将无用的数据清除
        await axios.get(baseUrl+`/clear_img?list=${list}`)
        // ---------------------------------
        // 提交时进行表单校验
        ruleFormRef.validateField()
        // 表单的数据
        // console.log(ruleForm.value)
        // 左边编辑框的数据
        // console.log(valueHtml.value)
        if(!valueHtml.value){
            ElNotification({
                title: '警告',
                message: '正文不能为空',
                type: 'warning',
            })
            return
        }
        ruleForm.value.content = valueHtml.value
        // 如果封面有选择的话，就进行数据请求，保存图片到服务器 ------------------
        if(fileRaw.value){
            const formData = new FormData()
            formData.append('file',fileRaw.value)
            // 保存封面图片的请求
            await axios.post(baseUrl+`/upload_img_postImg?name=${uniqueSuffix}`,formData,{
                headers:{
                    'Content-Type':'multipart/from-data',
                    'Authorization': localStorage.getItem('token')
                }
            })
        }else{
            ruleForm.value.tImg = null
        }
        // ---获取当前用户的uid
        ruleForm.value.uid = parseToken(localStorage.getItem('token')).id
        // console.log(ruleForm.value)
        // 对提交的表单数据进行清洗
        let newPostData = { ... ruleForm.value}
        newPostData['create_time'] = createNowTime()
        newPostData['pid'] = newPostData.plat[0]
        newPostData['cid'] = newPostData.plat[1]
        newPostData['leave_list'] = []
        newPostData['tid'] = uuidv4()
        
        let result
        try{
            result = await api.addPost(newPostData)
        }catch(e){
            // console.log(1111)
            ElMessage.error('发贴失败，请稍后再试！')
        }
        if(!result){
            return
        }
        let logcontent = `发表了新帖子:'${ruleForm.value.title}'`
        let userInfo = parseToken(localStorage.getItem('token'))
        logsStore.addLog({
            uid:ruleForm.value.uid,
            create_time:createNowTime(),
            value:logcontent,
            identity:userInfo.identity
        })
        ElMessage({
            message: '发帖成功！',
            type: 'success',
        })
        
        router.push('/')
    }
    onMounted(async ()=>{
        let {data} = await api.getPlate()
        nextTick(()=>{
            changePlatlist(data,options.value)
        })  
    })

    // 绑定图片的信息
    const fileRaw = ref('')
    // 用来绑定显示图片的链接
    const imageUrl = ref('')
    // 但上传图片时，获得图片的信息file
    function uploadChange(file){
        // 图片名称
        // 图片后缀
        const ext = file.name.split('.')[1]
        // 封面图片名称
        ruleForm.value.tImg = uniqueSuffix + '.'+ ext
        // 将图片回显
        imageUrl.value = URL.createObjectURL(file.raw)
        
        // 保存图片的信息
        fileRaw.value = file.raw
    }
</script>

<style lang="scss" scoped>
    .postTitle{
        width: 1140px;
        color: rgb(149, 212, 117);
        font-size: 18px;
        padding: 10px 0 0 25px;
        font-weight: bolder;
        // margin: 10px;
    }
    .post{
        display: grid;
        grid-template-columns: 1fr 0.7fr;
        width:1140px;
        .left{
            margin: 10px;
        }
        .right{
            // border:1px solid black;
            margin-left: 20px;
            background-color: white;
            margin: 10px;
            padding: 10px;
            .right-title{
                padding: 5px;
                border-bottom:1px solid rgb(232, 230, 230);
                margin-bottom: 10px;
            }
        }
    }
    .demo-ruleForm{
        padding: 10px;
    }
    // 设置失败，不知道为什么
    .el-scrollbar .el-scrollbar__wrap{
        height: 100% !important;
    }


    .avatar-uploader .el-upload {
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);
    }

    .avatar-uploader .el-upload:hover {
        border-color: var(--el-color-primary);
    }

    .el-icon.avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        text-align: center;
    }


    .avatar-uploader .avatar {
        width: 178px;
        height: 178px;
        display: block;
    }

    .el-icon{
        background-color: #e8e8e8;
        opacity: 0.5;
    }
    .submit{
        width: 100%;
        margin:10px 20px;
    }
    @media(max-width:1140px){
        .post{
            width:100%;
        }
        .postTitle{
            width: 100%;
        }
    }
    @media(max-width:950px){
        .post{
            display: flex;
            flex-direction: column;
        }
    }
</style>