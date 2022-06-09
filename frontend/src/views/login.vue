<template>
  <div class="content">
    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <p class="card-title">Ninja提醒您</p>
        </div>
      </div>
      <div class="card-body text-base leading-6" v-html="tipContent">
      </div>
      <div class="card-footet"></div>
    </div>

    <div v-if="showLogin" class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <p class="card-title">登录</p>
        </div>
        <div class="card-body text-base leading-6" v-html="loginContent">
        </div>
      </div>
      <div style="padding: 30px">
        <el-form :model="userInfo" label-width="30%" size="small">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userInfo.username" @keyup.enter="loginUser"
                      style="width: 50%;margin-left: 20px;min-width: 200px"/>
          </el-form-item>
          <el-form-item v-if="isAdmin" label="密码" prop="password">
            <el-input v-model="userInfo.password" type="password" @keyup.enter="loginUser"
                      style="width: 50%;margin-left: 20px;min-width: 200px"/>
          </el-form-item>
          <el-form-item style="text-align: center;" label-width="0px">
            <el-button type="primary" :disabled="!userInfo.username" size="small" @click="loginUser">登录</el-button>
            <el-button @click="openRegister" v-if="allowAdd" size="small">注册</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>


    <div v-if="showRegister" class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <p class="card-title">注册</p>
          <span class="ml-2 px-2 py-1 bg-gray-200 rounded-full font-normal text-xs">余量：{{ marginCount }}</span>
        </div>
        <div class="card-body text-base leading-6" v-html="registerContent">
        </div>
      </div>
      <div style="padding: 30px">
        <el-form ref="registerForm" :model="userInfo" :rules="registerRules" size="small" label-width="30%">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userInfo.username" @keyup.enter="registerConfirm(registerForm)"
                      style="width: 50%;margin-left: 20px;min-width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="Cookie" prop="cookie">
            <el-input v-model="userInfo.cookie" @keyup.enter="registerConfirm(registerForm)"
                      style="width: 70%;margin-left: 20px;min-width: 200px"></el-input>
          </el-form-item>
          <el-form-item style="text-align: center;" label-width="0px">
            <el-button type="primary" @click="registerConfirm(registerForm)" size="small">确定</el-button>
            <el-button @click="registerCancel" size="small">返回</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import {onMounted, reactive, toRefs, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {
  getInfoAPI,
  login,
  registerUser,
  getContent
} from '@/api'

export default {
  setup() {
    const router = useRouter()
    const registerForm = ref('')

    let data = reactive({
      dialogVisible: false,
      tipContent: '',
      loginContent: '',
      registerContent: '',
      marginCount: 0,
      allowAdd: true,
      showRegister: false,
      showLogin: true,
      userInfo: {
        username: undefined,
        password: '',
        cookie: '',
        ptKey: '',
        ptPin: ''
      },
      isAdmin: false,
      registerRules: {
        username: [
          {required: true, message: "请输入用户名", trigger: 'blur'}
        ],
        cookie: [
          {required: true, message: "请输入cookie", trigger: 'blur'}
        ]
      }
    })

    const getInfo = async () => {
      const info = (await getInfoAPI())
      if (info.code === 400){
        ElMessage.error(info.message)
        return
      }
      data.marginCount = info.data.marginCount
      data.allowAdd = info.data.allowAdd
    }

    const loginUser = async () => {
      if (data.isAdmin) {
        if (!data.userInfo.password) {
          ElMessage.error('请输入密码')
        }
      }
      if (data.userInfo.username) {
        const resData = (await login(data.userInfo))
        if (resData.code === 400){
          ElMessage.error(resData.message)
          return
        }
        let res = resData.data
        if (res.errCode === 0) {
          //成功
          localStorage.setItem('eid', res.eid)
          localStorage.setItem('encryptUsername', res.encryptUsername)
          if (res.eid === 0) {
            localStorage.setItem('token', res.token)
            router.push("/manage")
          } else {
            router.push("/")
          }
        } else {
          if (res.errCode === 1) {
            //管理员登录
            data.isAdmin = true
          }
          if (res.errCode === 2) {
            ElMessage.error('该账号未启用，禁止登录')
          }
          if (res.errCode === 404) {
            ElMessage.error('未注册的用户')
          }
          if (res.errCode === 500) {
            ElMessage.error('未知错误')
          }
        }
      } else {
        ElMessage.error('请输入用户名')
      }
    }

    const openRegister = async () => {
      data.showLogin = false
      data.showRegister = true
    }

    const registerConfirm = async (formEl) => {
      if (!formEl) {
        return
      }
      formEl.validate(async (valid) => {
        if (valid) {
          const ptKey =
              data.userInfo.cookie.match(/pt_key=(.*?);/) &&
              data.userInfo.cookie.match(/pt_key=(.*?);/)[1]
          const ptPin =
              data.userInfo.cookie.match(/pt_pin=(.*?);/) &&
              data.userInfo.cookie.match(/pt_pin=(.*?);/)[1]
          if (ptKey && ptPin) {
            data.userInfo.ptKey = ptKey
            data.userInfo.ptPin = ptPin
          } else {
            ElMessage.error('cookie 解析失败，请检查后重试！')
            return
          }

          const resData = (await registerUser(data.userInfo))
          if (resData.code === 400){
            ElMessage.error(resData.message)
            return
          }
          const res = resData.data
          if (res.errCode === 0) {
            ElMessage.success(res.msg)
            data.showLogin = true
            data.showRegister = false
          } else {
            if (res.errCode === 201) {
              ElMessage.error('用户名重复')
            }
            if (res.errCode === 500) {
              ElMessage.error('未知错误')
            }
          }
        }
      })
    }

    const registerCancel = async () => {
      data.showLogin = true
      data.showRegister = false
    }

    const initContent = async () => {
      data.tipContent = (await getContent('tip')).data.content
      data.loginContent = (await getContent('login')).data.content
      data.registerContent = (await getContent('register')).data.content
    }

    onMounted(() => {
      const eid = localStorage.getItem('eid')
      if (eid !== '0' && eid) {
          router.push("/")
      } else {
        getInfo()
      }
      initContent()
    })

    return {
      ...toRefs(data),
      getInfo,
      loginUser,
      registerConfirm,
      registerCancel,
      openRegister,
      registerForm
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
