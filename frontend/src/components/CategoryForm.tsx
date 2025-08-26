'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Category } from '@/lib/api-client'

interface CategoryFormProps {
  category?: Category | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (categoryData: any) => void
  isLoading?: boolean
}

export default function CategoryForm({
  category,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: '',
    active: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        displayOrder: category.displayOrder?.toString() || '',
        active: category.active ?? true
      })
    } else {
      setFormData({
        name: '',
        description: '',
        displayOrder: '',
        active: true
      })
    }
    setErrors({})
  }, [category, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres'
    }

    if (formData.displayOrder && isNaN(Number(formData.displayOrder))) {
      newErrors.displayOrder = 'Ordem deve ser um número'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : undefined,
      active: formData.active
    }

    onSubmit(categoryData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Lanches, Bebidas, Sobremesas..."
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição opcional da categoria..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Ordem de Exibição</Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleInputChange('displayOrder', e.target.value)}
              placeholder="1, 2, 3... (deixe vazio para automático)"
              min="1"
              className={errors.displayOrder ? 'border-red-500' : ''}
            />
            {errors.displayOrder && <p className="text-sm text-red-500">{errors.displayOrder}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="active" className="text-sm">
              Categoria ativa (visível no cardápio)
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : (category ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}