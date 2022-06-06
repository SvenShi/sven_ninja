<template>
  <div class="content">
    <div class="card">
      <div class="card-header">
        <p class="card-title">个人中心</p>
      </div>
      <div class="card-body">
        <p>昵称：{{ nickName }}</p>
        <p>更新时间：{{ timestamp }}</p>
        <span>状态：<p v-if="userStatus === 1" style="color: red;display: inline">过期已禁用</p><p v-if="userStatus === 0" style="color: green;display: inline">正常</p></span>
      </div>
      <div class="card-footer">
        <el-button size="small" auto @click="logout">退出登录</el-button>
        <el-button type="danger" size="small" auto @click="delAccount">删除CK</el-button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <p class="card-title">修改备注</p>
      </div>
      <div class="card-body text-center">
        <el-input v-model="remark" size="small" clearable class="my-4 w-full"/>
      </div>
      <div class="card-footer">
        <el-button type="success" size="small" auto @click="changeRemark">修改</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getUserInfoAPI,
  delAccountAPI,
  remarkupdateAPI
} from '@/api'
import {onMounted, reactive, toRefs} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'

export default {
  setup() {
    const router = useRouter()

    let data = reactive({
      remark: '',
      nickName: undefined,
      timestamp: undefined,
      userStatus: undefined,
    })

    const getInfo = async () => {
      const eid = localStorage.getItem('eid')
      const wseid = localStorage.getItem('wseid')
      if (!eid && !wseid) {
        logout()
        return
      }
      if (eid) {
        const userInfo = await getUserInfoAPI(eid)
        if (!userInfo) {
          ElMessage.error('获取用户CK信息失败，请重重新登录')
          logout()
          return
        }
        data.nickName = userInfo.data.nickName
        data.userStatus = userInfo.data.status
        data.timestamp = new Date(userInfo.data.timestamp).toLocaleString()
      }

      if (wseid) {
        const userInfo = await getWSCKUserinfoAPI(wseid)
        if (!userInfo) {
          ElMessage.error('获取用户WSCK信息失败，请重重新登录')
          logout()
          return
        }
        data.nickName = userInfo.data.nickName
        data.timestamp = new Date(userInfo.data.timestamp).toLocaleString()
      }
    }

    onMounted(getInfo)

    const logout = () => {
      localStorage.removeItem('eid')
      localStorage.removeItem('wseid')
      router.push('/login')
    }

    const delAccount = async () => {
      const eid = localStorage.getItem('eid')
      const body = await delAccountAPI({eid})
      if (body.code !== 200) {
        ElMessage.error(body.message)
      } else {
        ElMessage.success(body.message)
        setTimeout(() => {
          logout()
        }, 1000)
      }
    }

    const changeRemark = async () => {
      const eid = localStorage.getItem('eid')
      const wseid = localStorage.getItem('wseid')
      const remark = data.remark
      if (eid) {
        const body = await remarkupdateAPI({eid, remark})
        if (body.code !== 200) {
          ElMessage.success(body.message)
        } else {
          ElMessage.error(body.message)
        }
      }
      if (wseid) {
        const wsbody = await remarkupdateWSCKAPI({wseid, remark})
        if (wsbody.code !== 200) {
          ElMessage.success(wsbody.message)
        } else {
          ElMessage.error(wsbody.message)
        }
      }
    }

    return {
      ...toRefs(data),
      getInfo,
      logout,
      delAccount,
      changeRemark
    }
  },
}
</script>

<style scoped>
/*没被访问过之前*/
a:link {
  color: #B321FF;
}

/*默认*/
a {
  color: #EECDFF;
}

/*鼠标掠过*/
a:hover {
  color: red;
}
</style>
