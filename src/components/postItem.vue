<template>
    <div class="postitem">
        <div class="item" @click="showItem(props.listItem.tid)">
        <div class="item-left">
            <div class="item-title">{{props.listItem.title}}
                <span class="item-time">{{props.listItem['create_time']}}</span>
            </div>
            <div class="item-abstract" :class="props.listItem.tImg ? 'haveimg' : ''"> {{ props.listItem.abstract }}</div>
            <div class="left-other">
                <div class="item-user">{{props.listItem.name}}</div>
                <div class="item-likenum">
                    <img src="@/assets/images/点赞.svg" alt="">
                    <div>{{props.listItem.like.length}}</div>
                </div>
                <div class="item-leaveNum">
                    <img src="@/assets/images/回复default.svg" alt="">
                    <div>{{ listItem.leavelNum }}</div>
                </div>
            </div>
        </div>
        <div class="item-right" v-show="props.listItem.tImg">
            <!-- 如果存在就返回服务器的图片，没有就不显示 -->
            <img :src="props.listItem.tImg === null ? '' : `${baseUrl}/${props.listItem.tImg}`" alt="">
        </div>
    </div>
    <slot name="del"></slot>
    </div>
</template>

<script setup>
    import { defineProps,getCurrentInstance } from 'vue'
    import { useRouter } from 'vue-router'
    const router = useRouter()

    const baseUrl = getCurrentInstance().appContext.config.globalProperties.$request_url
    const props= defineProps({
        listItem:Object
    })
    
    function showItem(tid){
        router.push(`/postdetail/${tid}`)
    }
</script>

<style lang="scss" scoped>
    .postitem{
        display: flex;
        align-items: center
    }
    .item{
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid rgb(231, 231, 231);
        align-items: center;
        width:100%;
    }
    .item:hover{
        background-color: rgb(244, 244, 244);
    }
    .item-left{
        // margin: 20px
        padding: 10px;
        margin:5px 10px;
        flex: 1;
        .item-title{
            font-size: 20px;
            font-weight: bolder;
            max-width: 500px;
            .item-time{
                display: inline-block;
                font-size: 13px;
                font-weight: 600;
                color:rgb(138, 145, 159);
                margin-left:10px;
            }
        }
        .item-abstract{
            margin: 10px 0;
            font-size: 16px;
            color:rgb(125, 126, 128);
            overflow:hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            // width: 100%;
            // min-width: 800px;
            max-width: 1080px;
        }
        .haveimg{
            max-width: 960px;
        }
        .left-other{
            display: flex;
            align-items: center;
            gap:10px;
            font-size: 13px;
            color:rgb(138, 145, 159);
            margin: 5px 0;
        }
        .item-likenum{
            margin-left:10px ;
            display: flex;
            gap: 5px;
            align-items: center;
            img{
                width: 15px;
                height: 15px;
            }
        }
        .item-leaveNum{
            display: flex;
            gap: 5px;
            line-height: 18px;
            // align-items: center;
            img{
                width: 15px;
                height: 15px;
                margin-bottom: 3px;
            }
        }
    }
    .item-right{
        // width: 200px;
        margin-right:40px;
        flex:0 0 auto;
        // min-width: 200px;
        img{
            width: 100px;
            height: 70px;
            border-radius: 5px;
        }
    }
    .item :hover{
        cursor: pointer;
    }
</style>