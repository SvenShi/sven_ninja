import {defineStore} from "pinia";
import {ref} from "vue";
import {ElMessage} from "element-plus";

export const useManageStore = defineStore('manage', {
  // 为了完整类型推理，推荐使用箭头函数
  state: () => {
    return {
      token: ''
    }
  },
  actions: {
    alertMsg(type, msg) {
      if (type === 'success') {
        ElMessage.success(msg)
      } else {
        ElMessage.error(msg)
      }
    }
  }
})
