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
        <el-button auto @click="logout" style="margin-right: 10px;" v-loading.fullscreen.lock="loading">退出登录</el-button>
        <span v-if="showEnableCk" style="display: inline">
          <el-button v-if="userStatus === 0" style="margin-right: 10px;" type="danger" auto
                     @click="disableCK">禁用</el-button>
          <el-button v-if="userStatus === 1" style="margin-right: 10px;" type="success" auto
                     @click="enableCK">启用</el-button>
        </span>
        <el-button type="danger" auto @click="delAccount" v-loading.fullscreen.lock="loading">删除账号</el-button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <p class="card-title">修改用户名</p>
      </div>
      <div class="card-body text-base leading-6" v-html="usernameContent">
      </div>
      <div class="card-body text-center">
        <el-input v-model="username" style="min-width: 200px" @keyup.enter="updateUsername" clearable
                  class="my-4 w-full"/>
      </div>
      <div class="card-footer">
        <el-button type="success" auto @click="updateUsername" v-loading.fullscreen.lock="loading">修改</el-button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <p class="card-title">更新Cookie</p>
      </div>
      <div class="card-body text-base leading-6" v-html="cookieContent">
      </div>
      <div class="card-body text-center">
        <el-input v-model="cookie" style="min-width: 300px" @keyup.enter="updateCookie" clearable
                  class="my-4 w-full"/>
      </div>
      <div class="card-footer">
        <el-button type="success" auto @click="updateCookie" v-loading.fullscreen.lock="loading">更新</el-button>
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
  enableAPI,
  getContent,
  verifyUser, getInfoAPI
} from '@/api'
import {ElMessage, ElMessageBox} from 'element-plus'

export default {
  data() {
    return {
      loading: true,
      profileContent: '',
      usernameContent: '',
      cookieContent: '',
      username: '',
      cookie: '',
      nickName: undefined,
      timestamp: undefined,
      userStatus: undefined,
      showEnableCk: false
    }
  },
  mounted() {
    this.getInfo()
    this.initContent()
  },
  methods: {
    async getInfo() {
      const that = this
      const eid = localStorage.getItem('eid')
      if (eid === '0' || !eid) {
        that.logout()
        return
      }

      getInfoAPI().then(res => {
        if (res.data && res.data.code === 200) {
          that.showEnableCk = Boolean(res.data.allowSetStatus)
        } else {
          ElMessage.error(res.message)
          that.loading = false
          that.logout()
          return
        }

        verifyUser().then(res => {
          if (res.data.code !== 200) {
            if (res.data.code === 555) {
              ElMessage.error('检查环境变量中配置的密钥长度是否为8的倍数')
            } else {
              ElMessage.error('用户信息验证失败')
            }
            that.logout()
          }

          if (eid) {
            getUserInfoAPI(eid).then(res => {
              if (res.code === 400) {
                ElMessage.error(res.message)
                return
              }
              if (!res) {
                ElMessage.error('获取用户CK信息失败，请重新登录')
                that.logout()
                return
              }
              that.nickName = res.data.username
              that.userStatus = res.data.status
              that.timestamp = new Date(res.data.timestamp).toLocaleString()
              that.loading = false
            })
          }
        })
      })
    },
    logout() {
      localStorage.removeItem('eid')
      localStorage.removeItem('encryptUsername')
      this.$router.push('/login')
    },
    delAccount() {
      const that = this
      ElMessageBox.confirm("确定删除账号", "警告", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        that.loading = true
        const eid = localStorage.getItem('eid')
        delAccountAPI({eid}).then(res => {
              if (res.data.code === 200) {
                ElMessage.success(res.data.msg)
                that.logout()
              } else {
                ElMessage.error(res.data.msg || res.message)
              }
              that.loading = false
            }
        )

      })
    },
    async updateUsername() {
      this.loading = true
      if (this.username) {
        const eid = localStorage.getItem('eid')
        if (eid) {
          const body = await updateAPI({eid, ck: null, username: this.username})
          if (body.data && body.data.code && body.data.code === 200) {
            localStorage.removeItem('eid')
            localStorage.removeItem('encryptUsername')
            await this.$router.push({name: 'login', params: {isUpdate: 'true'}})
          } else {
            ElMessage.error(body.data.msg || body.message)
          }
          this.loading = false
        }
      } else {
        ElMessage.error("请输入用户名！")
      }
    },
    async updateCookie() {
      this.loading = true
      if (this.cookie) {
        const eid = localStorage.getItem('eid')
        let cookie
        if (eid) {
          const ptKey =
              this.cookie.match(/pt_key=(.*?);/) &&
              this.cookie.match(/pt_key=(.*?);/)[1]
          const ptPin =
              this.cookie.match(/pt_pin=(.*?);/) &&
              this.cookie.match(/pt_pin=(.*?);/)[1]
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
        await this.getInfo()
      } else {
        ElMessage.error("请输入Cookie！")
      }
    },
    async disableCK() {
      const that = this
      ElMessageBox.confirm("确定禁用吗", "警告", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        const eid = localStorage.getItem('eid')
        if (eid) {
          disableAPI({eid}).then(res => {
            if (res.data && res.data.code && res.data.code === 200) {
              ElMessage.success(res.data.msg)
            } else {
              ElMessage.error(res.data.msg || res.message)
            }
            that.getInfo()
          })
        } else {
          that.loading = false
          that.$router.push('/')
        }
      })
    },
    async enableCK() {
      const that = this
      ElMessageBox.confirm("启用前请先确认已更新CK", "警告", {
        confirmButtonText: '已确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.loading = true
        const eid = localStorage.getItem('eid')
        if (eid) {
          enableAPI({eid}).then(res => {
            if (res.data && res.data.code && res.data.code === 200) {
              ElMessage.success(res.data.msg)
            } else {
              ElMessage.error(res.data.msg || res.message)
            }
            that.getInfo()
          })
        } else {
          that.loading = false
          that.$router.push('/')
        }
      })
    },
    initContent() {
      const that = this
      getContent('profile').then(res => {
        that.profileContent = res.data.content
      })
      getContent('updateUsername').then(res => {
        that.usernameContent = res.data.content
      })
      getContent('updateCookie').then(res => {
        that.cookieContent = res.data.content
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
</style>
