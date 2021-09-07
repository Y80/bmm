import axios, { AxiosError } from 'axios'
import router from '../pages/router'

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_SERVER_BASEURL, timeout: 10000 })

axiosInstance.interceptors.request.use((request) => {
  request.headers ||= {}
  request.headers.authorization = `Bearer ${localStorage.getItem('token') || ''}`

  return request
})

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError) => {
    let msg = error.message
    if (error.response?.data) {
      const { data } = error.response
      msg = data.message
      if (data.code === 401) {
        msg = '身份验证失败，请重新登录'
        router.push('/login')
      }
    }
    window.$message?.error(msg)

    return Promise.reject()
  }
)

export const http = axiosInstance
