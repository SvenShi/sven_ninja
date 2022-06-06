<template>
  <div class="content">
    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <p class="card-title">Ninja提醒您</p>
        </div>
      </div>
      <div class="card-body text-base leading-6">
        <p style="color: red">撸豆有可能造成的任何损失本人概不负责！！！！！！！！！</p>
        <p>为了您的财产安全请关闭免密支付以及打开支付验密（京东-设置-支付设置-支付验密设置）。</p>
        <p>建议京东账户绑定微信以保证提现能到账。</p>
        <p style="font-weight: bold;">安全起见，切勿泄露您的cookie！</p>
      </div>
      <div class="card-footet"></div>
    </div>

    <div v-if="showLogin" class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <p class="card-title">登录</p>
        </div>
      </div>
      <div style="padding: 30px">
        <el-form :model="userInfo" label-width="30%" size="small">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userInfo.username" style="width: 50%;margin-left: 20px"/>
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
        <div class="card-body text-base leading-6">
          <p>安卓手机傻瓜式获取CK（强烈推荐，非常方便）<a style="" href="https://github.com/ZhuSky/JDCookie" target="_blank">点此访问下载连接</a></p>
          <p>电脑用户浏览器登录<a style="" href="https://m.jd.com/" target="_blank">JD官网</a>，点击我的出现登录页面后点击F12，通过开发者工具获取cookie。</p>
          <p>手机用户可以使用Alook浏览器登录<a style="" href="https://m.jd.com/" target="_blank" id="jd">JD官网</a>，并在菜单-工具箱-开发者工具-Cookies中获取（Android和iPhone通用）。</p>
          <p>另外也可以使用抓包工具（iPhone：Stream，Android：HttpCanary）抓取京东app的ck</p>
          <p>cookie直接填入输入框即可，Ninja会自动正则提取pt_key和pt_pin。</p>
          <span class="card-subtitle" style="color: red"> 可以直接填写整个cookie。</span><br/>
          <span class="card-subtitle" style="color: red"> 注意格式（pt_key=xxxxxxxxxxxxxxx;pt_pin=xxxxxxxxxxxxxx;）注意分号不能少！</span><br/>
          <span class="card-subtitle"> 请在下方输入您的 cookie 注册。</span><br/>
        </div>
      </div>
      <div style="padding: 30px">
        <el-form :model="userInfo" :rules="registerRules" size="small" label-width="30%">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userInfo.username" style="width: 50%;margin-left: 20px"></el-input>
          </el-form-item>
          <el-form-item label="Cookie" prop="cookie">
            <el-input v-model="userInfo.cookie" style="width: 70%;margin-left: 20px"></el-input>
          </el-form-item>
          <el-form-item style="text-align: center;" label-width="0px">
            <el-button type="primary" @click="registerConfirm" size="small">确定</el-button>
            <el-button @click="registerCancel" size="small">返回</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>


  </div>
</template>

<script>
import {onMounted, reactive, toRefs} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {
  getInfoAPI,
  login,
  registerUser
} from '@/api'

export default {
  setup() {
    const router = useRouter()

    let data = reactive({
      marginCount: 0,
      allowAdd: true,
      showRegister: false,
      showLogin: true,
      userInfo: {
        username: undefined,
        cookie: '',
        ptKey: '',
        ptPin: ''
      },
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
      const res = (await login(data.userInfo)).data
      if (res.errCode === 0) {
        //成功
        localStorage.setItem('eid', res.eid)
        router.push("/")
      } else {
        if (res.errCode === 404) {
          ElMessage.error('未注册的用户')
        }
        if (res.errCode === 500) {
          ElMessage.error('未知错误')
        }
      }
    }

    const openRegister = async () => {
      data.showLogin = false
      data.showRegister = true
    }

    const registerConfirm = async () => {
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

    const registerCancel = async () => {
      data.showLogin = true
      data.showRegister = false
    }

    onMounted(() => {
      const eid = localStorage.getItem('eid')
      if (eid){
        router.push("/")
      }else {
        getInfo()
      }
    })

    return {
      ...toRefs(data),
      getInfo,
      loginUser,
      registerConfirm,
      registerCancel,
      openRegister
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
