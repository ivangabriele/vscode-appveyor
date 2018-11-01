export interface Status {
  [key: string]: StatusContent
}
export interface StatusContent {
  name: string
  icon: string
  message: string
  tooltip: string
}
