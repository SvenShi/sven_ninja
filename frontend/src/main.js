import {
    ElButton,
    ElInput,
    ElMessage,
    ElForm,
    ElFormItem,
    ElMessageBox,
    ElTabs,
    ElTabPane,
    ElDialog,
    ElLink
} from 'element-plus'
import 'element-plus/lib/theme-chalk/base.css'
import {createApp} from 'vue'
import App from './App.vue'
import './index.css'
import router from './router'

const components = [ElButton, ElInput, ElMessageBox, ElMessage, ElForm, ElFormItem, ElTabs, ElTabPane, ElDialog,ElLink]
const plugins = [ElMessage, ElMessageBox]

const app = createApp(App)

components.forEach((component) => {
    app.component(component.name, component)
})

plugins.forEach((plugin) => {
    app.use(plugin)
})

app.use(router)
app.mount('#app')
