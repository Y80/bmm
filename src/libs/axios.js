import axios from 'axios'
import router from '@/libs/router'

const MyAxios = axios.create({
  // 后台服务器地址
  // baseURL: 'http://localhost:2333/bmm',
  baseURL:
    'https://service-j3cuc7cz-1257263957.sh.apigw.tencentcs.com/release/bmm',
})

MyAxios.interceptors.request.use((req) => {
  req.headers.Authorization = localStorage.getItem('Authorization')
  return req
})

MyAxios.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // error 的五个属性：config request response isAxiosError toJSON
    throw new Error(error)
  }
)

export default MyAxios
