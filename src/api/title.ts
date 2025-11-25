export interface TitleVO {
  id: string
  title: string
  order: number
}

export interface TitleGroup {
  title: TitleVO | null
  tasks: TaskVO[]
}