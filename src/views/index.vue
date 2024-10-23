<template>
    <div class="indexBody">
        <headerList></headerList>
        <router-view></router-view>
    </div>
    <!-- <bottomlist class="bottom"></bottomlist> -->
</template>

<script setup>
    import headerList from '@/components/headerList.vue';
    // import bottomlist from '@/components/bottomlist.vue';
</script>

<style lang="scss" scoped>
    .indexBody{
        width: 100%;
        display: flex;
        // justify-content: center;
        align-items: center;
        background-color: rgb(241, 241, 241);
        flex-direction: column;
        height: 100%;
        min-height: 100vh;
    }
    
    @media(max-width: 400px){
        .bottom{
            position: absolute;
            top:0
        }
    }
</style>