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


    <div v-if="showCK" class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <p class="card-title">CK 登录</p>
          <span class="ml-2 px-2 py-1 bg-gray-200 rounded-full font-normal text-xs">余量：{{ marginCount }}</span>
        </div>
        <div class="card-body text-base leading-6">
          <p>安卓手机傻瓜式获取CK（强烈推荐，非常方便）<a style="" href="https://github.com/ZhuSky/JDCookie" target="_blank">点此访问下载连接</a></p>
          <p>电脑用户浏览器登录<a style="" href="https://m.jd.com/" target="_blank">JD官网</a>，点击我的出现登录页面后点击F12，通过开发者工具获取cookie。</p>
          <p>手机用户可以使用Alook浏览器登录<a style="" href="https://m.jd.com/" target="_blank" id="jd">JD官网</a>，并在菜单-工具箱-开发者工具-Cookies中获取（Android和iPhone通用）。</p>
          <p>另外也可以使用抓包工具（iPhone：Stream，Android：HttpCanary）抓取京东app的ck</p>
          <p>cookie直接填入输入框即可，Ninja会自动正则提取pt_key和pt_pin。</p>
        </div>
        <span class="card-subtitle" style="color: red"> 可以直接填写整个cookie。 </span><br/>
        <span class="card-subtitle"
              style="color: red"> 注意格式（pt_key=xxxxxxxxxxxxxxx;pt_pin=xxxxxxxxxxxxxx;）注意分号不能少！ </span><br/>
        <span class="card-subtitle"> 请在下方输入您的 cookie 登录。 </span><br/>

      </div>
      <div class="card-body text-center">
        <el-input v-model="nickName" size="small" style="width: 300px; float: left" placeholder="备注" clearable/>
        <el-input v-model="cookie" size="small" placeholder="Cookie" clearable class="my-4 w-full"/>
        <el-button type="primary" size="small" round @click="CKLogin">登录</el-button>
      </div>
      <div class="card-footet"></div>
    </div>
  </div>
</template>

<script>
import {onMounted, reactive, toRefs} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {
  getInfoAPI,
  getQrcodeAPI,
  CKLoginAPI,
  checkLoginAPI,
  WSCKLoginAPI,
} from '@/api/index'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    let data = reactive({
      marginCount: 0,
      allowAdd: true,
      cookie: '',
      QRCode: undefined,
      qrCodeVisibility: false,
      token: undefined,
      okl_token: undefined,
      cookies: undefined,
      timer: undefined,
      waitLogin: false,
      //
      marginWSCKCount: 0,
      allowWSCKAdd: true,
      jdwsck: undefined,
      showQR: false,
      showWSCK: false,
      showCK: true,
      nickName: undefined,

    })

    const getInfo = async () => {
      const info = (await getInfoAPI()).data
      data.marginCount = info.marginCount
      data.allowAdd = info.allowAdd
      data.marginWSCKCount = info.marginWSCKCount
      data.allowWSCKAdd = info.allowWSCKAdd
      data.showQR = info.showQR
      data.showWSCK = info.showWSCK
      data.showCK = info.showCK

    }

    const getQrcode = async () => {
      // 增加扫码是否禁用判断
      if (this.showQR) {
        try {
          const body = await getQrcodeAPI()
          data.token = body.data.token
          data.okl_token = body.data.okl_token
          data.cookies = body.data.cookies
          data.QRCode = body.data.QRCode
          if (data.QRCode) {
            // data.qrCodeVisibility = true
            data.waitLogin = true
            clearInterval(data.timer) // 清除定时器
            data.timer = setInterval(ckeckLogin, 3000) // 设置定时器
          }
        } catch (e) {
          console.error(e)
          ElMessage.error('生成二维码失败！请重试或放弃')
        }
      } else {
        ElMessage.warning('扫码已禁用请手动抓包')
      }

    }

    const showQrcode = async () => {
      data.qrCodeVisibility = true
    }

    const jumpLogin = async () => {
      const href = `openapp.jdmobile://virtual/ad?params={"category":"jump","des":"ThirdPartyLogin","action":"to","onekeylogin":"return","url":"https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=${data.token}","authlogin_returnurl":"weixin://","browserlogin_fromurl":"${window.location.host}"}`
      window.location.href = href
    }

    const ckeckLogin = async () => {
      try {
        const body = await checkLoginAPI({
          token: data.token,
          okl_token: data.okl_token,
          cookies: data.cookies,
        })

        switch (body?.data.errcode) {
          case 0:
            localStorage.setItem('eid', body.data.eid)
            ElMessage.success(body.message)
            clearInterval(data.timer)
            router.push('/')
            break
          case 176:
            break
          default:
            ElMessage.error(body.message)
            data.waitLogin = false
            clearInterval(data.timer)
            break
        }
      } catch (error) {
        clearInterval(data.timer)
        data.waitLogin = false
      }
    }

    const CKLogin = async () => {
      const ptKey =
          data.cookie.match(/pt_key=(.*?);/) &&
          data.cookie.match(/pt_key=(.*?);/)[1]
      const ptPin =
          data.cookie.match(/pt_pin=(.*?);/) &&
          data.cookie.match(/pt_pin=(.*?);/)[1]
      if (ptKey && ptPin) {
        let body;
        if (data.nickName) {
          body = await CKLoginAPI({pt_key: ptKey, pt_pin: ptPin, nickName: data.nickName})
          if (body.data.eid) {
            localStorage.setItem('eid', body.data.eid)
            ElMessage.success(body.message)
            router.push('/')
          } else {
            ElMessage.error(body.message || 'cookie 解析失败，请检查后重试！')
          }
        } else {
          ElMessageBox.confirm("建议填写具有辨识度的备注，以方便查看运行日志！", "提示", {
            confirmButtonText: '返回填写备注',
            cancelButtonText: '我不管，就用默认的！',
          }).then(() => {
          }).catch(async () => {
            body = await CKLoginAPI({pt_key: ptKey, pt_pin: ptPin})
            if (body.data.eid) {
              localStorage.setItem('eid', body.data.eid)
              ElMessage.success(body.message)
              router.push('/')
            } else {
              ElMessage.error(body.message || 'cookie 解析失败，请检查后重试！')
            }
          })
        }
      } else {
        ElMessage.error('cookie 解析失败，请检查后重试！')
      }
    }

    // 新增 wskey登录
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
          router.push('/')
        } else {
          ElMessage.error(body.message || 'wskey 解析失败，请检查后重试！')
        }
      } else {
        ElMessage.error('wskey 解析失败，请检查后重试！')
      }
    }

    onMounted(() => {
      getInfo()
      getQrcode()
    })

    return {
      ...toRefs(data),
      getInfo,
      getQrcode,
      showQrcode,
      ckeckLogin,
      jumpLogin,
      CKLogin,
      WSCKLogin,
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
