export type SortInfo = {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export type PageableInfo = {
  offset: number
  pageNumber: number
  pageSize: number
  paged: boolean
  unpaged: boolean
  sort: SortInfo
}

export type Page<T> = {
  content: T[]
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  pageable: PageableInfo
  size: number
  sort: SortInfo
  totalElements: number
  totalPages: number
}
