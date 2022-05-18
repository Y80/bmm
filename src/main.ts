import { createApp } from 'vue'
import App from './App'
import store from './store'
import router from './router'
// https://www.npmjs.com/package/vfonts
// import 'vfonts/FiraSans.css'
// import 'vfonts/FiraCode.css'
import './style/base.css'
import 'uno.css'

if (import.meta.env.DEV) {
  localStorage.setItem(
    'token',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ilk4MCIsImF2YXRhciI6Imh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS80MDEzMjQzMz92PTQiLCJpYXQiOjE2NTI3MDA1NTksImV4cCI6MTY1MzU2NDU1OX0.HqAi5QoL0PXFlhGhaL8toJV7sc3AuWUNxXJZEhPxPPc',
  )
}

createApp(App).use(store).use(router).mount('#app')
