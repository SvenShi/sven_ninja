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
    ElLink,
    ElLoading,
    ElSwitch,
    ElIcon
} from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/dist/index.css'
import {createApp} from 'vue'
import App from './App.vue'
import './index.css'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const components = [ElButton, ElInput, ElMessageBox, ElSwitch, ElMessage, ElForm, ElFormItem, ElTabs, ElTabPane, ElDialog, ElLink, ElIcon]
const plugins = [ElMessage, ElMessageBox, ElLoading]

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

components.forEach((component) => {
    app.component(component.name, component)
})

plugins.forEach((plugin) => {
    app.use(plugin)
})

app.use(router)
app.mount('#app')
