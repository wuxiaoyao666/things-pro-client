// 对应后端的 Result 结构
export interface Result<T = any> {
  code: number
  msg: string
  data: T
}

// 分页结构
export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  size: number
}