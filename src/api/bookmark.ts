import { IBaseBookmark, IBookmark } from '../interface'
import { http } from './http'

export function add(payload: IBaseBookmark & { tagIds: number[] }) {
  return http.post('/bookmark', payload)
}

export function update(payload: IBaseBookmark & { id: number; tagIds: number[] }) {
  return http.put('/bookmark', payload)
}

export function remove(id: number) {
  return http.delete('/bookmark', { params: { id } })
}

export function query(tagId?: number) {
  return http.get<null, IBookmark[]>('/bookmark', { params: { tagId } })
}

export default { add, remove, update, query }
