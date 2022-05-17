import { createApp } from 'vue'
import App from './App'
import store from './store'
import router from './router'
// https://www.npmjs.com/package/vfonts
// import 'vfonts/FiraSans.css'
// import 'vfonts/FiraCode.css'
import './style/base.css'
import 'uno.css'

createApp(App).use(store).use(router).mount('#app')
