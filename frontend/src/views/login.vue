<template>
  <div class="content">
    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <p class="card-title">Ninja提醒您</p>
        </div>
      </div>
      <div class="card-body text-base leading-6" v-html="contents.tip.content">
      </div>
      <div class="card-footet"></div>
    </div>

    <div v-if="showLogin" class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <p class="card-title">登录</p>
        </div>
        <div class="card-body text-base leading-6" v-html="contents.login.content">
        </div>
      </div>
      <div style="padding: 30px;">
        <el-form :model="userInfo" @submit.native.prevent label-width="30%">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userInfo.username" @keyup.enter="loginUser"
                      style="width: 50%;margin-left: 20px;min-width: 180px"/>
          </el-form-item>
          <el-form-item v-if="isAdmin" label="密码" prop="password">
            <el-input v-model="userInfo.password" ref="passwordInput" type="password" @keyup.enter="loginUser"
                      style="width: 50%;margin-left: 20px;min-width: 180px"/>
            <el-icon style="margin-left: 5px;cursor: pointer" @click="isAdmin = false;userInfo.password = '';">
              <CircleClose class="icon"/>
            </el-icon>
          </el-form-item>
          <div style="text-align: center;">
            <el-button type="primary" v-loading.fullscreen.lock="loading" :disabled="!userInfo.username"
                       @click="loginUser">登录
            </el-button>
            <el-button @click="openRegister" v-if="allowAdd">注册</el-button>
          </div>
        </el-form>
      </div>

    </div>


    <div v-if="showRegister" class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <p class="card-title">注册</p>
          <span class="ml-2 px-2 py-1 bg-gray-200 rounded-full font-normal text-xs">余量：{{ marginCount }}</span>
        </div>
        <div class="card-body text-base leading-6" v-html="contents.register.content">
        </div>
      </div>
      <div style="padding: 30px">
        <el-form ref="registerForm" @submit.native.prevent :model="userInfo" :rules="registerRules" label-width="30%">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userInfo.username" @keyup.enter="registerConfirm()"
                      style="width: 50%;margin-left: 20px;min-width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="Cookie" prop="cookie">
            <el-input v-model="userInfo.cookie" @keyup.enter="registerConfirm()"
                      style="width: 70%;margin-left: 20px;min-width: 200px"></el-input>
          </el-form-item>
          <div style="text-align: center">
            <el-button type="primary" v-loading.fullscreen.lock="loading" @click="registerConfirm()">确定</el-button>
            <el-button @click="registerCancel">返回</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import {ElMessage} from 'element-plus'
import {
  getInfoAPI,
  login,
  registerUser,
  getContent
} from '@/api'
import {mapStores} from "pinia";
import {useManageStore} from "@/manageStore";

export default {
  data() {
    return {
      loading: true,
      dialogVisible: false,
      contents: {
        tip: {},
        login: {},
        register: {}
      },
      marginCount: 0,
      allowAdd: false,
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
    }
  },
  computed: {
    ...mapStores(useManageStore)
  },
  mounted() {
    const eid = localStorage.getItem('eid')
    if (eid !== '0' && eid) {
      this.$router.push("/")
    } else {
      this.getInfo()
    }
    this.initContent()
  },
  methods: {
    async getInfo() {
      getInfoAPI().then(res => {
        if (res.code === 200) {
          this.marginCount = res.data.marginCount
          this.allowAdd = res.data.allowAdd
          this.loading = false
        } else {
          ElMessage.error(res.msg)
          this.loading = false
          this.logout()
        }
      })
    },
    async loginUser() {
      const that = this
      this.loading = true
      if (this.isAdmin) {
        if (!this.userInfo.password) {
          ElMessage.error('请输入密码')
          this.loading = false
          return
        }
      }
      if (this.userInfo.username) {
        login(this.userInfo).then(res => {
          that.loading = false
          if (res.code === 200) {
            if (res.data.isAdmin) {
              //管理员登录
              that.isAdmin = true
              that.$nextTick(function () {
                that.$refs.passwordInput.focus()
              })
            } else {
              //成功
              localStorage.setItem('eid', res.data.eid)
              localStorage.setItem('encryptUsername', res.data.encryptUsername)
              if (res.data.eid === 0) {
                this.manageStore.token = res.data.token
                that.$router.push({name: 'manage'})
              } else {
                that.$router.push("/")
              }
            }
          } else {
            ElMessage.error(res.msg)
            localStorage.removeItem('eid')
            localStorage.removeItem('encryptUsername')
          }
        })
      } else {
        ElMessage.error('请输入用户名')
        localStorage.removeItem('eid')
        localStorage.removeItem('encryptUsername')
      }
    },
    openRegister() {
      this.showLogin = false
      this.showRegister = true
    },
    async registerConfirm() {
      this.loading = true
      await this.$refs.registerForm.validate(async valid => {
        if (valid) {
          const ptKey =
            this.userInfo.cookie.match(/pt_key=(.*?);/) &&
            this.userInfo.cookie.match(/pt_key=(.*?);/)[1]
          const ptPin =
            this.userInfo.cookie.match(/pt_pin=(.*?);/) &&
            this.userInfo.cookie.match(/pt_pin=(.*?);/)[1]
          if (ptKey && ptPin) {
            this.userInfo.ptKey = ptKey
            this.userInfo.ptPin = ptPin
          } else {
            ElMessage.error('cookie 解析失败，请检查后重试！')
            this.loading = false
            return
          }

          registerUser(this.userInfo).then(res => {
            if (res.code === 200) {
              ElMessage.success(res.msg)
              this.showLogin = true
              this.showRegister = false
              this.loading = false
            } else {
              ElMessage.error(res.msg)
              this.loading = false
            }
          })
        }
      })
    },
    registerCancel() {
      this.showLogin = true
      this.showRegister = false
    },
    async initContent() {
      const that = this
      getContent().then(res => {
        if (res.code === 200) {
          that.contents = res.data
        } else {
          ElMessage.error(res.msg)
        }
      })
    }
  }
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

.icon:hover {
  color: #ff0000;
}
</style>
