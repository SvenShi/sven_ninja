<template>

  <div class="box">
    <div class="footer">
      <div class="footer-wrapper">
        <div class="flex items-center">
          <div style="text-align: left;margin-top:5px">
            <el-link type="info" href="javascript:;" @click="updateLogClick">更新日志</el-link>
          </div>
        </div>
      </div>

      <el-dialog
          v-model="dialogVisible"
          title="更新内容"
          :width="dialogWidth"
          @close="handleClose"
      >
        <div style="max-height: 55vh; overflow: hidden; overflow-y: auto;">
          <p>2022/06/26</p><br/>
          <p style="color: red;">1.管理页面添加系统设置功能，可以配置注册开关、容量、青龙令牌、密钥等等信息</p>
          <p style="color: red;">2.用户现在可以控制青龙变量的禁用与启用</p>
          <p>3.现在可以点击logo到达首页</p>
          <p>4.环境变量ALLOW_ADMIN=true 默认值改为true</p>
          <p>5.页面全部重构一边</p><br/>
          <p>6.响应结果统一封装</p><br/>

          <p>2022/06/09</p><br/>
          <p style="color: red;">1.环境变量.env文件添加 USERNAME_SALT=ninja123 变量，该变量用来加密用户名</p>
          <p>2.基于账号安全考虑，自动登录添加用户名校验功能。防止他人修改localStorage来登录</p><br/>

          <p>2022/06/07</p><br/>
          <p style="color: red;">1.添加管理功能，在环境变量中配置 ALLOW_ADMIN=true 即可开启管理功能，默认关闭 详情见 Ninja 环境变量</p>
          <p>2.开启管理功能后,按照环境变量中配置的管理员账号密码登录即可进入管理页面 详情见 Ninja 环境变量</p>
          <p style="color: red;">3.管理页面添加自定义标语功能 仅支持HTML</p>
          <p>4.修复一些小问题，修改提示信息。</p>
          <p>5.添加青龙令牌配置出错提示</p><br/>

          <p>2022/06/06</p><br/>
          <p style="color: red;">1.添加登录功能</p>
          <p>2.移除用户上线 下线通知功能</p>
          <p>3.移除所有无用代码</p>
          <p>4.更新后建议删除CK 重新录入 或者修改青龙容器中的备注 备注就是用户名</p><br/>

          <p> 2022/04/24</p><br/>
          <p> 1.移除提交WSKEY功能</p>
          <p style="color: red;"> 2.更换请求接口为青龙OpenAPI接口,废弃之前的api接口。适配高版本。</p>
          <p style="color: red;"> 3.改用OpenAPI解决以往token过期需要重新登录一次青龙的问题</p>
          <p style="color: red;"> 4.需要在.env文件中配置青龙的应用授权令牌 详情见 Ninja 环境变量</p><br/>

        </div>
        <el-link type="primary" href="https://github.com/sw-ashai/ashai_ninja" target="_blank">项目地址</el-link>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="dialogVisible = false">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      version: '22.06.26',
      dialogVisible: false,
      dialogWidth: '40%',
      screenWidth: undefined
    }
  },
  created() {
    this.verifyVersion()
    const that = this
    window.screenWidth = document.body.clientWidth;
    that.screenWidth = window.screenWidth
    if (that.screenWidth * 0.4 <= 400){
      if (that.screenWidth <= 410){
        that.dialogWidth = `${that.screenWidth - 10}px`
      }else {
        that.dialogWidth = '400px'
      }
    }else {
      that.dialogWidth = '40%'
    }

    window.onresize = () => {
      window.screenWidth = document.body.clientWidth;
      that.screenWidth = window.screenWidth
      if (that.screenWidth * 0.4 <= 400){
        if (that.screenWidth <= 410){
          that.dialogWidth = `${that.screenWidth - 10}px`
        }else {
          that.dialogWidth = '400px'
        }
      }else {
        that.dialogWidth = '40%'
      }
    }
  },
  methods: {
    verifyVersion() {
      const version = localStorage.getItem('version')
      if (version !== this.version) {
        this.dialogVisible = true;
      }
    },
    handleClose() {
      localStorage.setItem("version", this.version)

    },
    updateLogClick() {
      this.dialogVisible = true;
      return false;
    }
  }
}
</script>

<style scoped>
.footer {
  @apply h-12 drop-shadow-md shadow-sm bg-white fixed bottom-0 w-screen;
}

.box {
  @apply h-12;
}

.footer-wrapper {
  @apply w-11/12 max-w-5xl h-full m-auto font-bold text-2xl flex items-center justify-between;
}
</style>
