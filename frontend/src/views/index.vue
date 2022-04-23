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
        <el-button type="success" size="small" auto @click="changeremark">修改</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getUserInfoAPI,
  delAccountAPI,
  remarkupdateAPI,
  WSCKLoginAPI,
  WSCKDelaccountAPI,
  remarkupdateWSCKAPI
} from '@/api/index'
import {onMounted, reactive, toRefs} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {ElMessage} from 'element-plus'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    let data = reactive({
      remark: '',
      jdwsck: undefined,
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

    const changeremark = async () => {
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

    const WSCKLogin = async () => {
      const wskey =
          data.jdwsck.match(/wskey=(.*?);/) &&
          data.jdwsck.match(/wskey=(.*?);/)[1]
      const pin =
          data.jdwsck.match(/pin=(.*?);/) &&
          data.jdwsck.match(/pin=(.*?);/)[1]
      if (wskey && pin) {
        const body = await WSCKLoginAPI({wskey: wskey, pin: pin})
        if (body.data.wseid) {
          localStorage.setItem('wseid', body.data.wseid)
          ElMessage.success(body.message)
        } else {
          ElMessage.error(body.message || 'wskey 解析失败，请检查后重试！')
        }
      } else {
        ElMessage.error('wskey 解析失败，请检查后重试！')
      }
    }

    const delWSCKAccount = async () => {
      const wseid = localStorage.getItem('wseid')
      const body = await WSCKDelaccountAPI({wseid})
      if (body.code !== 200) {
        ElMessage.error(body.message)
      } else {
        ElMessage.success(body.message)
        setTimeout(() => {
          logout()
        }, 1000)
      }
    }

    const openUrlWithJD = (url) => {
      const params = encodeURIComponent(
          `{"category":"jump","des":"m","action":"to","url":"${url}"}`
      )
      window.location.href = `openapp.jdmobile://virtual?params=${params}`
      console.log(window.location.href)
    }

    return {
      ...toRefs(data),
      getInfo,
      logout,
      delAccount,
      changeremark,
      WSCKLogin,
      delWSCKAccount,
      openUrlWithJD,
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
