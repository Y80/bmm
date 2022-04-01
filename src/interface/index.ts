export interface ITag {
  id: number
  name: string
  bookmarkNum: number
}

export interface IBaseBookmark {
  name: string
  url: string
  description?: string
  favicon?: string
}

export interface IBookmark {
  id: number
  name: string
  url: string
  favicon?: string
  description?: string
  tags: ITag[]
}
