<template>
    <div class="login">
        <div class="login-inp">
            <div class="login-left">
                <div><h3>provateBBS</h3></div>
                <div class="left-other">this is my vue3 Object ~ lzb</div>
            </div>
            <div class="login-right">
                <div class="login-title">
                    <div @click="changeCl(true)" :class="[checkLogin?'active':'']">登录</div>
                    <div @click="changeCl(false)" :class="[!checkLogin?'active':'']">注册</div>
                </div>
                <el-form
                    ref="ruleFormRef"
                    style="max-width:600px"
                    :model="form"
                    :rules="loginRules"
                    label-width="auto"
                    status-icon
                    v-if="checkLogin"
                >
                    <el-form-item label="账号：" prop="name">
                        <el-input v-model="form.name" class="form-inp" placeholder="由数字，字母，_组成"/>
                    </el-form-item>
                    <el-form-item label="密码：" prop="password">
                        <el-input v-model="form.password" class="form-inp"  type="password" placeholder="输入密码"/>
                    </el-form-item>
                    <el-form-item label="验证码：" prop="code">
                        <div class="randomCode">
                            <el-input v-model="form.code"></el-input>
                            <Sidentify :identifyCode="identifyCode" ref="sidentify" @click="refesh_code"></Sidentify>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="success" @click="submitForm(ruleFormRef)" class="form-button">
                            登陆
                        </el-button>
                    </el-form-item>
                </el-form>
                <el-form
                    ref="ruleFormRef"
                    style="max-width:600px"
                    :model="form"
                    :rules="loginRules"
                    label-width="auto"
                    status-icon
                    v-else
                >
                    <el-form-item label="账号：" prop="name">
                        <el-input v-model="form.name" class="form-inp" placeholder="由数字，字母，_组成"/>
                    </el-form-item>
                    <el-form-item label="密码：" prop="password">
                        <el-input v-model="form.password" type="password" class="form-inp"  placeholder="输入密码"/>
                    </el-form-item>
                    <el-form-item  label="再次输入密码：" prop="rePassword" >
                        <el-input v-model="form.rePassword" type="password" class="form-inp" placeholder="再次输入密码"></el-input>
                    </el-form-item>
                    <el-form-item label="验证码：" prop="code">
                        <div class="randomCode">
                            <el-input v-model="form.code"></el-input>
                            <Sidentify :identifyCode="identifyCode" ref="sidentify" @click="refesh_code"></Sidentify>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="success" @click="submitForm(ruleFormRef)" class="form-button">
                            注册
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref,reactive,onMounted } from 'vue'
    import { useUserStore} from '@/stores' 
    import Sidentify from '@/components/Sidentify.vue'
    import api from '@/api'
    import { parseToken } from '@/utils/utils'
    //切换登录、注册页面
    let checkLogin = ref(true)
    const changeCl = (n)=>{
        checkLogin.value = n
        form.name = '' 
        form.password = ''
        form.rePassword = ''
        form.code = ''
        refesh_code()
    }
    // 表单数据
    let form = reactive({
        name:'',
        password:'',
        rePassword:'',
        code:''
    })
    // 绑定表单
    const ruleFormRef = ref(null)
    // 注册页面 校验两次输入的密码
    const checkpassword = ()=>{
        if(form.password !== form.rePassword){
            return false
        }else{
            return true
        }
    }
    // 校验验证码
    const checkranNum = ()=>{
        // console.log(form.code,identifyCode.value)
        if(form.code !== identifyCode.value){
            return false
        }else{
            return true
        }
    }
    // 表单校验规则
    const loginRules = reactive({
        name:[
            {required:true,message:'账号不能为空',trigger:'blur'},
            {min:6,max:15,message:'请输入字母，数字或下划线(6-15位)',trigger:'blur'}
        ],
        password:[
            {required:true,message:'请输入密码',trigger:'blur'},
        ],
        rePassword:[
            {required:true,message:'请再次输入密码',trigger:'blur'},
            {validator:checkpassword,message:'两次输入的密码不一致' , trigger:'blur'}
        ],
        code:[
            {required:true,message:'请输入验证码',trigger:'blur'},
            {validator:checkranNum,message:'验证码错误',trigger:'blur'}
        ]
    })
    // 
    const userStore = useUserStore()
    import { useRouter } from "vue-router";
    import { createNowTime } from '@/utils/utils'
    import { v4 as uuidv4 } from 'uuid'
    const router = useRouter();
    // -------------------------------------------------------------------------------------------
    // 点击登录或注册按钮
    const submitForm = async (formEl)=>{
        if(!formEl){
            return
        }
        // 进行表单验证
        await formEl.validate()
        if(checkLogin.value){
            // 登录页面
            // console.log(await userStore.checkUser(form.name,form.password))
            let result
            try{
                result = await api.login(form.name, form.password)
            }catch(e){
                if(e.code === 'ECONNABORTED'){
                    return
                }
                ElMessage.error('登陆失败，账户或密码错误！')
            }
            if(!result){
                return
            }
            let token = result.data
            localStorage.setItem('token', token)
            let parse_token_user = parseToken(token)
            // console.log(parse_token_user)
            let setTime
            try{
                setTime = await api.setLoginTime({
                    uid:parse_token_user.id,
                    time:createNowTime()
                })
            }catch(e){
                console.log(e)
                ElMessage.error('设置用户最后登陆时间失败！')
            }

            // 登陆成功后，获取登陆用户的信息
            let userInfo = (await api.get_user_info(parse_token_user.id)).data
            // console.log(userInfo)
            userStore.setUserInfo(userInfo)
            ElMessage.success('登陆成功！')
            setTimeout(()=>{
                router.push('/')
            },1000)

        }else{
            // 注册事件
            let result
            try{
                result = await api.check_user_name(form.name)
            }catch(e){
                ElMessage.error('注册失败，请稍后再试！')
            }
            // console.log(result)
            if(!result){
                return
            }
            if(result.data){
                ElMessage.error('账户已存在，请更换账号名！')
                return
            }
            let userForm = {}
            userForm.create_time = createNowTime()
            userForm.id = uuidv4()
            userForm.name = form.name
            userForm.password = form.password
            userForm.nickName = form.name
            // console.log(userForm)
            let result1
            try{
                result1 = await api.add_new_user(userForm)
            }catch(e){
                ElMessage.error('注册失败，请稍后再试！')
            }
            if(!result1){
                return
            }

            ElMessage.success('注册成功！')
            changeCl(true)
        }
    }
    // ----------------------------------------------------------------------------------------------------------
    // 验证码模块
    const identifyCode = ref('1234')
    const sidentify = ref()
    const identifycodes = '1234567890abcdefghijklmnopqrstuvwxyz'
    const refesh_code = () =>{
        identifyCode.value = ''
        makeCode(identifycodes,4);
        sidentify.value.setIdentifyCode(identifyCode.value)
        // console.log(identifyCode.value)
    }
    const randomNum = (min, max)=>{
        return Math.floor(Math.random() * (max - min) + min)
    }
     // 生成随机验证码
    const makeCode=(list, num)=> {
        var numCode = ""
        for (let i = 0; i < num; i++) {
            numCode += list[
                randomNum(0,list.length)
            ]
        }
        identifyCode.value = numCode
    }

    onMounted(()=>{
        // 页面挂载前生成随机验证码
        refesh_code()
    })
</script>

<style lang="scss" scoped>
    .login{
        // background-color: aquamarine;
        width: 100%;
        height: 100vh;
        min-width: 1000px;
        position: relative;
        background: url('@/assets/images/bg.jpg') no-repeat;
        background-size: cover;
        .login-inp{
            background-color: white;
            opacity: 0.9;
            width: 730px;
            height: 360px;
            justify-content: space-around;
            align-items: center;
            position: absolute;
            right: 15%;
            bottom: 25%;
            border-radius: 20px;
            display: flex;
            .login-left{
                h3{
                    font-size: 30px;
                    font-style: italic;
                    margin-bottom: 10px;
                }
                .left-other{
                    color: rgb(188, 188, 188);
                }
            }
        }
    }
    .login-title{
        display: flex;
        width: 100%;
        // justify-content: space-between;
        // padding: 10px;
        height: 50px;
        div{
            width: 50%;
            text-align: center;
            padding: 10px;
            font-weight: bolder;
            font-size: 20px;
            line-height: 35px;
        }
        div:hover{
            cursor: pointer;
        }
    }
    .active{
        color: white;
        background-color: rgb(103, 194, 58);
    }
    .el-form{
        margin-top: 30px;
        // width: 320px;
        display: flex;
        flex-direction: column;
        // align-items: center;
    }
    .form-inp{
        // height: 45px;
        width: 220px;
    }
    .form-button{
        width: 250px;
        border-radius: 10px;
        margin: auto;
    }
    .randomCode{
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        .el-input{
            width: 130px;
        }
    }
    :deep(#s-canvas){
        height: 32px;
    }
    :deep(.s-canvas){
        display: flex;
        align-items: center;
    }
</style>