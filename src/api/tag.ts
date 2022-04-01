import { ITag } from '../interface'
import { http } from './http'

export function add(payload: any) {
  return http.post('/tag', payload)
}

export function remove(id: number) {
  return http.delete('/tag', { params: { id } })
}

export function update(payload: any) {
  return http.put('/tag', payload)
}

export function getAll() {
  return http.get<null, ITag[]>('/tag')
}

export default { add, remove, update, getAll }
