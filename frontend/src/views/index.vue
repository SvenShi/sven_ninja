<template>
  <div class="content">
    <div class="card">
      <div class="card-header">
        <p class="card-title">个人中心</p>
      </div>
      <div class="card-body text-base leading-6" v-html="profileContent">
      </div>
      <div class="card-body">
        <p>用户名：{{ nickName }}</p>
        <p>更新时间：{{ timestamp }}</p>
        <span>状态：<p v-if="userStatus === 1" style="color: red;display: inline">过期已禁用</p><p v-if="userStatus === 0"
                                                                                           style="color: green;display: inline">正常</p></span>
      </div>
      <div class="card-footer">
        <el-button size="small" auto @click="logout">退出登录</el-button>
        <!--        <el-button v-if="userStatus === 0" type="danger" size="small" auto @click="disableCK">禁用</el-button>-->
        <!--        <el-button v-if="userStatus === 1" type="success" size="small" auto @click="enableCK">启用</el-button>-->
        <el-button type="danger" size="small" auto @click="delAccount">删除账号</el-button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <p class="card-title">修改用户名</p>
      </div>
      <div class="card-body text-base leading-6" v-html="usernameContent">
      </div>
      <div class="card-body text-center">
        <el-input v-model="username" style="min-width: 200px" @keyup.enter="updateUsername" size="small" clearable class="my-4 w-full"/>
      </div>
      <div class="card-footer">
        <el-button type="success" size="small" auto @click="updateUsername">修改</el-button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <p class="card-title">更新Cookie</p>
      </div>
      <div class="card-body text-base leading-6" v-html="cookieContent">
      </div>
      <div class="card-body text-center">
        <el-input v-model="cookie" style="min-width: 300px" @keyup.enter="updateCookie" size="small" clearable class="my-4 w-full"/>
      </div>
      <div class="card-footer">
        <el-button type="success" size="small" auto @click="updateCookie">更新</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getUserInfoAPI,
  delAccountAPI,
  updateAPI,
  disableAPI,
  enableAPI, getContent
} from '@/api'
import {onMounted, reactive, toRefs} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'

export default {
  setup() {
    const router = useRouter()
    let data = reactive({
      version: '1.1',
      profileContent: '',
      usernameContent: '',
      cookieContent: '',
      username: '',
      cookie: '',
      nickName: undefined,
      timestamp: undefined,
      userStatus: undefined,
    })

    const getInfo = async () => {
      const eid = localStorage.getItem('eid')
      if (eid === '0' || !eid) {
        logout()
        return
      }
      if (eid) {
        const userInfo = await getUserInfoAPI(eid)
        if (userInfo.code === 400){
          ElMessage.error(userInfo.message)
          return
        }
        if (!userInfo) {
          ElMessage.error('获取用户CK信息失败，请重新登录')
          logout()
          return
        }
        data.nickName = userInfo.data.username
        data.userStatus = userInfo.data.status
        data.timestamp = new Date(userInfo.data.timestamp).toLocaleString()
      }
    }

    const logout = () => {
      localStorage.removeItem('eid')
      router.push('/login')
    }

    const delAccount = async () => {
      ElMessageBox.confirm("确定删除账号", "警告", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const eid = localStorage.getItem('eid')
        const body = await delAccountAPI({eid})
        if (body.data.code === 200) {
          ElMessage.success(body.data.msg)
          logout()
        } else {
          ElMessage.error(body.data.msg || body.message)
        }
      })
    }

    const updateUsername = async () => {
      if (data.username) {
        const eid = localStorage.getItem('eid')
        if (eid) {
          const body = await updateAPI({eid, ck: null, username: data.username})
          if (body.data && body.data.code && body.data.code === 200) {
            ElMessage.success(body.data.msg)
          } else {
            ElMessage.error(body.data.msg || body.message)
          }
        }
        await getInfo()
      } else {
        ElMessage.error("请输入用户名！")
      }
    }
    const updateCookie = async () => {
      if (data.cookie) {
        const eid = localStorage.getItem('eid')
        let cookie
        if (eid) {
          const ptKey =
              data.cookie.match(/pt_key=(.*?);/) &&
              data.cookie.match(/pt_key=(.*?);/)[1]
          const ptPin =
              data.cookie.match(/pt_pin=(.*?);/) &&
              data.cookie.match(/pt_pin=(.*?);/)[1]
          if (ptKey && ptPin) {
            cookie = 'pt_key=' + ptKey + ';pt_pin=' + ptPin + ';';
          } else {
            ElMessage.error('cookie 解析失败，请检查后重试！')
            return
          }

          const body = await updateAPI({eid, ck: cookie, username: null})
          if (body.data && body.data.code && body.data.code === 200) {
            ElMessage.success(body.data.msg)
          } else {
            ElMessage.error(body.data.msg || body.message)
          }
        }
        await getInfo()
      } else {
        ElMessage.error("请输入Cookie！")
      }
    }

    const disableCK = async () => {
      const eid = localStorage.getItem('eid')
      if (eid) {
        const body = await disableAPI({eid})
        if (body.data && body.data.code && body.data.code === 200) {
          ElMessage.success(body.msg)
        } else {
          ElMessage.error(body.data.msg || body.message)
        }
      }
      await getInfo()
    }

    const enableCK = async () => {
      const eid = localStorage.getItem('eid')
      if (eid) {
        const body = await enableAPI({eid})
        if (body.data && body.data.code && body.data.code === 200) {
          ElMessage.success(body.msg)
        } else {
          ElMessage.error(body.data.msg || body.message)
        }
      }
      await getInfo()
    }

    const initContent = async () => {
      data.profileContent = (await getContent('profile')).data.content
      data.usernameContent = (await getContent('updateUsername')).data.content
      data.cookieContent = (await getContent('updateCookie')).data.content
    }

    const verifyVersion = function () {
      const version = localStorage.getItem('version')
      if (version !== data.version){
        router.push('/login')
      }
    }

    onMounted(() => {
      getInfo()
      initContent()
      verifyVersion()
    })

    return {
      ...toRefs(data),
      getInfo,
      logout,
      delAccount,
      updateUsername,
      updateCookie,
      disableCK,
      enableCK
    }
  },
}
</script>

<style scoped>
/*没被访问过之前*/
a:link {
  color: #003fff;
}

/*默认*/
a {
  color: #003fff;
}

/*鼠标掠过*/
a:hover {
  color: #4f6fff;
}
</style>
