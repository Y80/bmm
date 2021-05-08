import 'bulma'
import { createApp } from 'vue'
import App from './App.vue'
import FormItem from './components/FormItem.vue'
import * as utils from './libs/utils'
import router from './libs/router'
import myAxios from '@/libs/axios'
import '@/assets/style/index.scss'

const app = createApp(App)

app.use(router)

// inject('axios) 获取 axios
app.provide('axios', myAxios)

// 全局注册组件，以在任何地方都可以使用该组件
app.component('FormItem', FormItem)

// 设置应用上下文的全局属性
app.config.globalProperties = {
  $axios: myAxios,
  $utils: utils,
  $db: null,
}
app.mount('#app')
