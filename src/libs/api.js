import axios from './axios'

export function login() {
  return axios.post('/login')
}
