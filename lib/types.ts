export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  modelPath: string
  iosModelPath: string
  posterPath: string
  dimensions: string
  material: string
  color: string
  isNew?: boolean
  isCustomizable?: boolean
}
