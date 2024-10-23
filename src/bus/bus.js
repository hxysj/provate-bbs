import { ref } from 'vue'

class Bus{
    constructor(){
        this.eventList = {}
        this.msg = ref('这是一条总线的消息')
    }
    // 订阅
    $on(name, fn) {
        this.eventList[name] = this.eventList[name] || []
        this.eventList[name].push(fn)
    }

    // 发布
    $emit(name, data) {
        if (this.eventList[name]) {
        this.eventList[name].forEach((fn) => {
            fn(data)
        });
        }
    }

    // 取消订阅
    $off(name) {
        if (this.eventList[name]) {
        delete this.eventList[name]
        }
    }
}

export default new Bus()