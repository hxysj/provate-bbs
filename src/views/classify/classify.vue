<template>
    <div class="classify">
        <div class="classify-title">
            <el-icon size="25">
                <Menu></Menu>
            </el-icon>
            <h2>板块地图</h2>
        </div>
        <div class="classify-body">
            <div class="body-item" v-for="item in platStore.takepaltlist" :key="item.pid">
                <div class="item-title" @click="gotoPlat(item.pid)">
                    <el-icon><Expand /></el-icon>
                    {{ item.name }}
                </div>
                <div class="item-children">
                    <div class="children" v-for="it in item.children" :key="it.cid" @click="gotoPlat(item.pid,it.cid)">
                        {{ it.name }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { Menu,Expand } from '@element-plus/icons-vue'
    import { usePlatStore } from '@/stores'
    import { useRouter } from 'vue-router'
    const platStore = usePlatStore()
    // console.log(platStore.takepaltlist)

    const router = useRouter()
    // 点击跳转到对应的板块下
    const gotoPlat = (pid,cid)=>{
        let url = pid
        if(cid){
            url += ('/' + cid)
        }
        router.push(`/form/${url}`)
    }

</script>

<style scoped lang="scss">
    .classify{
        width: 1140px;
        /* margin-top: 20px; */
        margin-top:10px;
        padding-top: 10px;
        background-color: white;
        .classify-title{
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
    }
    .classify-body{
        width: 100%;
        .body-item{
            border-top: 1px solid rgba(0,0,0,0.05);
            padding: 10px;
            .item-title{
                font-size: 20px;
                font-weight: 800;
                padding: 10px 0;
                gap: 5px;
                display: flex;
                align-items: center;
            }
            .item-title:hover{
                color: rgb(103, 194, 58);
                cursor: pointer;
            }
            .item-children{
                display: flex;
                padding: 10px;
                gap: 20px;
                .children{
                    padding: 8px 20px;
                    border: 1px solid rgb(103, 194, 58);
                    border-radius: 10px;
                }
                .children:hover{
                    cursor: pointer;
                    border: 1px solid rgba(0,0,0,0.2);
                    color: rgb(103, 194, 58);
                }
            }
        }
    }
    @media(max-width:1140px){
        .classify{
            width: 100%;
        }
    }
</style>