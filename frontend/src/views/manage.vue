<template>
  <div class="content">
    <div class="card">
      <div class="card-header">
        <p class="card-title">Ninja管理</p>
      </div>
      <div class="card-body text-center">
        <el-tabs v-model="activeName">
          <el-tab-pane label="系统设置" name="system">
            <el-form ref="configFrom" @submit.native.prevent :model="configForm" :rules="configRules"
                     label-width="30%">
              <el-form-item label="注册开关" prop="allowAdd">
                <el-switch
                    v-model="configForm.allowAdd"
                />
              </el-form-item>
              <el-form-item label="现有用户" prop="marginCount">
                <el-input v-model.number="this.marginCount" disabled style="width: 30%;min-width: 100px"></el-input>
              </el-form-item>
              <el-form-item label="用户容量" prop="allowNum">
                <el-input v-model.number="configForm.allowNum" :disabled="exception.noToken"
                          style="width: 30%;min-width: 100px"></el-input>
              </el-form-item>
              <el-form-item label="青龙授权ID" prop="clientId">
                <el-input v-model="configForm.clientId" style="width: 30%;min-width: 100px"></el-input>
              </el-form-item>
              <el-form-item label="青龙授权令牌" prop="clientSecret">
                <el-input type="password" v-model="configForm.clientSecret"
                          style="width: 30%;min-width: 100px"></el-input>
              </el-form-item>
              <el-form-item label="用户名加密密钥" prop="usernameSalt">
                <el-input v-model="configForm.usernameSalt" style="width: 30%;min-width: 100px"></el-input>
              </el-form-item>
              <el-form-item label="用户禁用CK权限" prop="allowSetStatus">
                <el-switch
                    v-model="configForm.allowSetStatus"
                />
              </el-form-item>
              <el-form-item label="管理功能" prop="allowAdmin">
                <el-switch
                    v-model="configForm.allowAdmin"
                />
              </el-form-item>
              <el-form-item label="管理员账号" prop="adminUsername">
                <el-input v-model="configForm.adminUsername" style="width: 30%;min-width: 100px"></el-input>
              </el-form-item>
              <el-form-item label="管理员密码" prop="adminPassword">
                <el-input type="password" v-model="configForm.adminPassword"
                          style="width: 30%;min-width: 100px"></el-input>
              </el-form-item>
              <div style="text-align: center">
                <el-button type="primary" v-loading.fullscreen.lock="loading" @click="updateConfig()">保存</el-button>
              </div>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="自定义标语" name="slogan"
                       style="overflow:hidden; overflow-y: auto; height: calc(100vh - 300px); text-align: center">
            <div style="margin-left: 10px;margin-right: 10px">
              <div style="padding-bottom: 10px" v-for="item in contents" :key="item.showSeq">
                <p style="float: left;font-size: 18px;margin-bottom: 10px">{{ item.title }}</p>
                <el-input
                    v-model="item.content"
                    :autosize="{ minRows: 4, maxRows: 8 }"
                    type="textarea"
                />
                <div style="text-align:right; margin-top: 10px">
                  <el-button type="success" auto @click="customContent(item.contentName,item.content)">修改</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import {
  verifyToken,
  getContent,
  setContent,
  getAllConfig,
  getInfoAPI,
  saveConfig
} from '@/api'
import {ElMessage, ElMessageBox} from 'element-plus'

export default {
  data() {
    return {
      activeName: 'system',
      loading: true,
      contents: [],
      token: undefined,
      configForm: {
        allowAdd: undefined,
        allowNum: undefined,
        clientId: undefined,
        clientSecret: undefined,
        allowAdmin: undefined,
        usernameSalt: undefined,
        adminUsername: undefined,
        adminPassword: undefined,
        allowSetStatus: undefined
      },
      configRules: {
        allowAdd: [
          {required: true, message: "必须选择是否允许注册", trigger: 'blur'}
        ],
        allowSetStatus: [
          {required: true, message: "必须选择用户CK禁用权限", trigger: 'blur'}
        ],
        allowNum: [
          {
            required: true, validator: (rule, value, callback) => {
              if (value) {
                if (value - Number(this.needMargin) < 0) {
                  callback(new Error("用户容量低于当前用户量"))
                } else {
                  callback()
                }
              } else {
                callback(new Error("必须输入用户容量"))
              }
            }, trigger: 'blur'
          }
        ],
        clientId: [
          {required: true, message: "必须输入青龙授权ID", trigger: 'blur'}
        ],
        clientSecret: [
          {required: true, message: "必须输入青龙授权令牌", trigger: 'blur'}
        ],
        allowAdmin: [
          {required: true, message: "必须选择是否开启管理账号", trigger: 'blur'}
        ],
        usernameSalt: [
          {
            required: true, validator: (rule, value, callback) => {
              if (value) {
                if (value.length % 8 !== 0) {
                  callback(new Error("密钥必须为8的倍数！"))
                } else {
                  callback()
                }
              } else {
                callback(new Error("必须输入密钥"))
              }
            }, trigger: 'blur'
          }
        ],
        adminUsername: [
          {required: true, message: "必须输入管理员账号", trigger: 'blur'}
        ],
        adminPassword: [
          {required: true, message: "必须输入管理员密码", trigger: 'blur'}
        ],
      },
      alarm: {},
      formInited: false,
      needMargin: undefined,
      marginCount: undefined,
      exception: {}
    }
  },
  mounted() {
    this.verify()
    this.initContent()
    this.initConfig()
  },
  watch: {
    'configForm.allowAdmin'(newV, oldV) {
      if (this.formInited) {
        if (!newV.allowAdmin) {
          if (!this.alarm.admin) {
            ElMessageBox.alert('关闭后将无法进入本页面！请谨慎选择！', '警告', {
              confirmButtonText: '我知道了',
              type: 'warning',
              callback: () => {
                this.alarm.admin = true
              },
            })
          }
        }
      }
    },
    'configForm.usernameSalt'(newV, oldV) {
      if (this.formInited) {
        if (newV !== oldV) {
          if (!this.alarm.usernameSalt) {
            ElMessageBox.alert('密钥修改后将会导致所有用户下线，需要重新登录！', '警告', {
              confirmButtonText: '我知道了',
              type: 'warning',
              callback: () => {
                this.alarm.usernameSalt = true
              },
            })
          }
        }
      }
    }
  },
  methods: {
    verify() {
      this.token = this.$route.params.token
      if (this.token) {
        verifyToken(this.token).then(res => {
          if (res.data.code !== 200) {
            this.$router.push("/login")
          }
        })
      } else {
        ElMessage.error("您没有权限访问此页面")
        this.$router.push("/login")
      }
    },
    customContent(contentName, content) {
      setContent({contentName, content}).then(res => {
        if (res.data.code === 200) {
          ElMessage.success("修改成功")
        } else {
          ElMessage.error("修改失败")
        }
      })
    },
    updateConfig() {
      this.$refs.configFrom.validate(isValid => {
        if (isValid) {
          saveConfig({...this.configForm, token: this.token}).then(res => {
            if (res.data && res.data.code === 200) {
              ElMessage.success(res.data.msg)
            } else {
              ElMessage.error(res.data.msg || res.message)
            }
          })
        }
      })
    },
    initConfig() {
      const that = this
      getAllConfig(this.token).then(res => {
        this.configForm = {...res.data}
        this.configForm.allowAdd = Boolean(this.configForm.allowAdd)
        this.configForm.allowAdmin = Boolean(this.configForm.allowAdmin)
        this.configForm.allowSetStatus = Boolean(this.configForm.allowSetStatus)
        this.$nextTick(function () {
          this.formInited = true
        })
        getInfoAPI().then(res => {
          if (res.data && res.data.code === 200){
            that.needMargin = Number(this.configForm.allowNum) - Number(res.data.marginCount)
            that.marginCount = res.data.marginCount
            that.loading = false
          }else {
            ElMessage.error(res.message)
            that.loading = false
            that.$router.push('/')
          }
        })
      })
    },
    initContent() {
      getContent('tip').then(res => {
        this.contents.push({
          content: res.data.content,
          title: '自定义登录以及注册上方提示',
          contentName: 'tip',
          showSeq: 0
        })
      })
      getContent('login').then(res => {
        this.contents.push({
          content: res.data.content,
          title: '自定义登录上方提示',
          contentName: 'login',
          showSeq: 1
        })
      })
      getContent('register').then(res => {
        this.contents.push({
          content: res.data.content,
          title: '自定义注册上方提示',
          contentName: 'register',
          showSeq: 2
        })
      })
      getContent('profile').then(res => {
        this.contents.push({
          content: res.data.content,
          title: '自定义个人中心上方提示',
          contentName: 'profile',
          showSeq: 3
        })
      })
      getContent('updateUsername').then(res => {
        this.contents.push({
          content: res.data.content,
          title: '自定义修改用户名上方提示',
          contentName: 'updateUsername',
          showSeq: 4
        })
      })
      getContent('updateCookie').then(res => {
        this.contents.push({
          content: res.data.content,
          title: '自定义修改Cookie上方提示',
          contentName: 'updateCookie',
          showSeq: 5
        })
      })
    }
  }
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
