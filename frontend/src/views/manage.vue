<template>
  <div class="content">
    <div class="card">
      <div class="card-header">
        <p class="card-title">Ninja管理</p>
      </div>
      <div class="card-body text-center">
        <el-tabs v-model="activeName" class="demo-tabs">
          <el-tab-pane label="自定义标语" name="slogan">
            <div class="card">
              <div class="card-header">
                <p class="card-title">自定义登录以及注册上方提示</p>
              </div>
              <div class="card-body text-center">
                <el-input
                    v-model="tip"
                    :autosize="{ minRows: 4, maxRows: 8 }"
                    type="textarea"
                />
              </div>
              <div class="card-footer">
                <el-button type="success" size="small" auto @click="customContent('tip')">修改</el-button>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <p class="card-title">自定义登录上方提示</p>
              </div>
              <div class="card-body text-center">
                <el-input
                    v-model="login"
                    :autosize="{ minRows: 4, maxRows: 8 }"
                    type="textarea"
                />
              </div>
              <div class="card-footer">
                <el-button type="success" size="small" auto @click="customContent('login')">修改</el-button>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <p class="card-title">自定义注册上方提示</p>
              </div>
              <div class="card-body text-center">
                <el-input
                    v-model="register"
                    :autosize="{ minRows: 4, maxRows: 8 }"
                    type="textarea"
                />
              </div>
              <div class="card-footer">
                <el-button type="success" size="small" auto @click="customContent('register')">修改</el-button>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <p class="card-title">自定义个人中心上方提示</p>
              </div>
              <div class="card-body text-center">
                <el-input
                    v-model="profile"
                    :autosize="{ minRows: 4, maxRows: 8 }"
                    type="textarea"
                />
              </div>
              <div class="card-footer">
                <el-button type="success" size="small" auto @click="customContent('profile')">修改</el-button>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <p class="card-title">自定义修改用户名上方提示</p>
              </div>
              <div class="card-body text-center">
                <el-input
                    v-model="updateUsername"
                    :autosize="{ minRows: 4, maxRows: 8 }"
                    type="textarea"
                />
              </div>
              <div class="card-footer">
                <el-button type="success" size="small" auto @click="customContent('updateUsername')">修改</el-button>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <p class="card-title">自定义修改Cookie上方提示</p>
              </div>
              <div class="card-body text-center">
                <el-input
                    v-model="updateCookie"
                    :autosize="{ minRows: 4, maxRows: 8 }"
                    type="textarea"
                />
              </div>
              <div class="card-footer">
                <el-button type="success" size="small" auto @click="customContent('updateCookie')">修改</el-button>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="系统设置" name="system">敬请期待</el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import {
  verifyToken,
  getContent,
  setContent
} from '@/api'
import {onMounted, reactive, toRefs} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'

export default {
  setup() {
    const router = useRouter()
    let data = reactive({
      activeName: 'slogan',
      tip: '',
      login: '',
      profile: '',
      register: '',
      updateCookie: '',
      updateUsername: ''
    })

    const verify = async () => {
      let res = await verifyToken()
      if (res.data.code !== 200) {
        router.push("/login")
      }
      localStorage.removeItem('token')
    }

    const customContent = async (contentName) => {
      let res = await setContent({contentName, content: data[contentName]})
      if (res.data.code === 200) {
        ElMessage.success("修改成功")
      } else {
        ElMessage.error("修改失败")
      }
    }

    const initContent = async () => {
      let tipRes = await getContent('tip')
      data.tip = tipRes.data.content
      let loginRes = await getContent('login')
      data.login = loginRes.data.content
      let profileRes = await getContent('profile')
      data.profile = profileRes.data.content
      let registerRes = await getContent('register')
      data.register = registerRes.data.content
      let updateCookieRes = await getContent('updateCookie')
      data.updateCookie = updateCookieRes.data.content
      let updateUsernameRes = await getContent('updateUsername')
      data.updateUsername = updateUsernameRes.data.content
    }

    onMounted(async () => {
      await verify()
      await initContent()
    })

    return {
      ...toRefs(data),
      customContent
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
