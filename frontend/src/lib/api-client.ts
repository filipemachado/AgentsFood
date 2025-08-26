import { getSession } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthHeaders() {
    const session = await getSession()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if ((session as any)?.accessToken) {
      headers.Authorization = `Bearer ${(session as any).accessToken}`
    }

    return headers
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}/api${endpoint}`
      const headers = await this.getAuthHeaders()

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...((options.headers as Record<string, string>) || {}),
        },
      })

      if (!response.ok) {
        let errorMessage = 'Erro na requisição'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`
        }
        throw new Error(errorMessage)
      }

      if (response.status === 204) {
        return { data: undefined as T }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error('API request failed:', error)
      return { 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    }
  }

  // Products endpoints
  async getProducts() {
    return this.request<Product[]>('/products')
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`)
  }

  async createProduct(product: CreateProductData) {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  async updateProduct(id: string, product: Partial<CreateProductData>) {
    return this.request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  async toggleProductAvailability(id: string) {
    return this.request<Product>(`/products/${id}/toggle-availability`, {
      method: 'PATCH',
    })
  }

  // Categories endpoints
  async getCategories() {
    return this.request<Category[]>('/categories')
  }

  async getCategory(id: string) {
    return this.request<Category>(`/categories/${id}`)
  }

  async createCategory(categoryData: CreateCategoryData) {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
  }

  async updateCategory(id: string, categoryData: Partial<CreateCategoryData>) {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
  }

  async deleteCategory(id: string) {
    return this.request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    })
  }

  async toggleCategoryActive(id: string) {
    return this.request<Category>(`/categories/${id}/toggle-active`, {
      method: 'PATCH',
    })
  }

  async reorderCategories(categories: { id: string; displayOrder: number }[]) {
    return this.request<{ message: string }>('/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ categories }),
    })
  }

  // Agent Config endpoints
  async getAgentConfig() {
    return this.request<AgentConfig>('/agent/config')
  }

  async createAgentConfig(config: CreateAgentConfigData) {
    return this.request<AgentConfig>('/agent/config', {
      method: 'POST',
      body: JSON.stringify(config),
    })
  }

  async updateAgentConfig(config: Partial<CreateAgentConfigData>) {
    return this.request<AgentConfig>('/agent/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    })
  }

  async deleteAgentConfig() {
    return this.request<void>('/agent/config', {
      method: 'DELETE',
    })
  }

  async testAgentResponse(message: string) {
    return this.request<AgentTestResponse>('/agent/test-response', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  // WhatsApp endpoints
  async getWhatsAppConfig() {
    return this.request<WhatsAppConfig>('/whatsapp/config')
  }

  async saveWhatsAppConfig(config: WhatsAppConfigData) {
    return this.request<WhatsAppConfigResponse>('/whatsapp/config', {
      method: 'POST',
      body: JSON.stringify(config),
    })
  }

  async testWhatsAppConnection(testData: WhatsAppTestConnectionData) {
    return this.request<WhatsAppTestResponse>('/whatsapp/test-connection', {
      method: 'POST',
      body: JSON.stringify(testData),
    })
  }

  async sendWhatsAppTestMessage(testData: WhatsAppTestMessageData) {
    return this.request<WhatsAppTestResponse>('/whatsapp/test-message', {
      method: 'POST',
      body: JSON.stringify(testData),
    })
  }

  // Upload endpoints
  async uploadImage(file: File) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const url = `${this.baseURL}/api/upload/image`
      const session = await getSession()
      const headers: Record<string, string> = {}

      if ((session as any)?.accessToken) {
        headers.Authorization = `Bearer ${(session as any).accessToken}`
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Erro no upload'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error('Upload failed:', error)
      return { 
        error: error instanceof Error ? error.message : 'Erro no upload' 
      }
    }
  }
}

// Types
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  available: boolean
  displayOrder: number
  categoryId?: string
  category?: Category
  createdAt: string
  updatedAt: string
}

export interface CreateProductData {
  name: string
  description?: string
  price: number
  imageUrl?: string
  available?: boolean
  displayOrder?: number
  categoryId?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  displayOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
  products?: Product[]
}

export interface CreateCategoryData {
  name: string
  description?: string
  displayOrder?: number
  active?: boolean
}

export interface AgentConfig {
  id: string
  welcomeMessage: string
  tone: string
  language: string
  maxResponseLength: number
  enabledFeatures: Record<string, boolean>
  customPrompt?: string
  fallbackMessage: string
  active: boolean
  createdAt: string
  updatedAt: string
  establishmentId: string
}

export interface CreateAgentConfigData {
  welcomeMessage?: string
  tone?: string
  language?: string
  maxResponseLength?: number
  enabledFeatures?: Record<string, boolean>
  customPrompt?: string
  fallbackMessage?: string
  active?: boolean
}

export interface AgentTestResponse {
  userMessage: string
  agentResponse: string
  timestamp: string
}

// WhatsApp types
export interface WhatsAppConfig {
  whatsappPhoneNumberId: string
  whatsappBusinessAccountId: string
  whatsappToken: string
  isConfigured: boolean
}

export interface WhatsAppConfigData {
  whatsappPhoneNumberId?: string
  whatsappBusinessAccountId?: string
  whatsappToken?: string
}

export interface WhatsAppConfigResponse {
  whatsappPhoneNumberId: string
  whatsappBusinessAccountId: string
  whatsappToken: string
  isConfigured: boolean
  message: string
}

export interface WhatsAppTestConnectionData {
  phoneNumberId: string
  accessToken: string
  businessAccountId?: string
}

export interface WhatsAppTestMessageData {
  phoneNumber: string
  message: string
}

export interface WhatsAppTestResponse {
  success: boolean
  message: string
  messageId?: string
  to?: string
  sentMessage?: string
  displayPhoneNumber?: string
  verifiedName?: string
  details?: {
    status: string
    platform: string
  }
  error?: any
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient