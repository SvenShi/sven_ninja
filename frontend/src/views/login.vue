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
    <div style="text-align: left;margin-top:5px">
      <el-link type="info" href="javascript:;" @click="updateLogClick" >更新日志</el-link>
    </div>


    <el-dialog
        v-model="dialogVisible"
        title="更新内容"
        width="35%"
        @close="handleClose"
    >
      <div>
        <p>
          环境变量配置在.env文件中
        </p>
        <p>
          1.添加管理功能，在环境变量中配置 ALLOW_ADMIN=true 即可开启管理功能，默认关闭
        </p>
        <p>
          2.开启管理功能后,按照环境变量中配置的管理员账号密码登录即可进入管理页面
        </p>
        <p>
          3.管理页面添加自定义标语功能 仅支持HTML
        </p>
        <p>
          4.修复一些小问题，修改提示信息。
        </p>
        <el-link type="primary" href="https://github.com/sw-ashai/ashai_ninja" target="_blank" >项目地址</el-link>
      </div>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">关闭</el-button>
        <el-button type="primary" @click="dialogVisible = false" size="small">确定</el-button>
      </span>
      </template>
    </el-dialog>

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
      version: '1.1',
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
      const info = (await getInfoAPI()).data
      data.marginCount = info.marginCount
      data.allowAdd = info.allowAdd
    }

    const loginUser = async () => {
      if (data.isAdmin) {
        if (!data.userInfo.password) {
          ElMessage.error('请输入密码')
        }
      }
      if (data.userInfo.username) {
        const res = (await login(data.userInfo)).data
        if (res.errCode === 0) {
          //成功
          localStorage.setItem('eid', res.eid)
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

          const res = (await registerUser(data.userInfo)).data
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


    const handleClose = function () {
      localStorage.setItem("version", data.version)
    }
    const updateLogClick = function () {
      data.dialogVisible = true;
      return false;
    }

    const verifyVersion = function () {
      const version = localStorage.getItem('version')
      if (version !== data.version) {
        data.dialogVisible = true;
        return false
      }
      return true
    }

    onMounted(() => {
      let flag = verifyVersion()
      const eid = localStorage.getItem('eid')
      if (eid !== '0' && eid) {
        if (flag){
          router.push("/")
        }
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
      registerForm,
      updateLogClick,
      handleClose
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
