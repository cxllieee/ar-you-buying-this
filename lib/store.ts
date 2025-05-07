"use client"

import { create } from "zustand"

interface ProductStoreState {
  searchQuery: string
  categoryFilter: string
  setSearchQuery: (query: string) => void
  setCategoryFilter: (category: string) => void
}

export const useProductStore = create<ProductStoreState>((set) => ({
  searchQuery: "",
  categoryFilter: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
}))
