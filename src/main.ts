import { createApp } from 'vue'
import App from './components/App'
import store from './store'
import router from './pages/router'
// https://www.npmjs.com/package/vfonts
import 'vfonts/FiraSans.css'
import 'vfonts/FiraCode.css'
import './style/base.css'

createApp(App).use(store).use(router).mount('#app')

window.handleSuccessLogin = () => {
  alert('window.handleSuccessLogin 占位函数')
}
