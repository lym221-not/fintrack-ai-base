export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  category_id: string
  description: string
  date: string
  categories?: { name: string; color: string }
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  limit_amount: number
  month: number
  year: number
  categories?: { name: string }
}
