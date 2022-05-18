import axios, { AxiosError } from 'axios'
// useRouter() 只能在 setup() 内使用
import router from '../router'

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_SERVER_BASEURL, timeout: 50000 })

axiosInstance.interceptors.request.use((request) => {
  request.headers ||= {}
  request.headers.authorization = `Bearer ${localStorage.getItem('token') || ''}`

  return request
})

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  // API 错误信息的错误信息均会被 Message 组件展示
  (error: AxiosError) => {
    let msg = error.message
    if (error.response?.data) {
      const { data } = error.response
      msg = data.message
      if (data.code === 401) {
        msg = '身份验证失败，请重新登录'
        router.push('/login')
      }
      window.$message?.error(msg)
      return Promise.reject(data)
    }
    window.$message?.error(msg)

    return Promise.reject(error)
  },
)

export const http = axiosInstance
