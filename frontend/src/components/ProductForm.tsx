'use client'

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiClient, Category } from '@/lib/api-client';
import { Upload, X, Grid3x3 } from 'lucide-react';

interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  available?: boolean;
  displayOrder?: number;
  categoryId?: string;
}

interface ProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  isLoading?: boolean;
}

export default function ProductForm({
  product,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    imageUrl: product?.imageUrl || '',
    available: product?.available ?? true,
    displayOrder: product?.displayOrder || 0,
    categoryId: product?.categoryId || undefined,
  });

  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await apiClient.getCategories();
      if (response.data) {
        setCategories(response.data.filter(cat => cat.active));
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // Reset form when opening
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || 0,
          imageUrl: product.imageUrl || '',
          available: product.available ?? true,
          displayOrder: product.displayOrder || 0,
          categoryId: product.categoryId || undefined,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: 0,
          imageUrl: '',
          available: true,
          displayOrder: 0,
          categoryId: undefined,
        });
      }
    }
  }, [isOpen, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const response = await apiClient.uploadImage(file);
      if (response.data?.url) {
        handleChange('imageUrl', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${response.data.url}`);
      } else if (response.error) {
        alert('Erro ao fazer upload: ' + response.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = () => {
    handleChange('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isEditing = !!product?.id;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite as informações do produto.' 
              : 'Adicione um novo produto ao seu cardápio.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: X-Burger Especial"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição do produto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Ordem</Label>
              <Input
                id="displayOrder"
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) => handleChange('displayOrder', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoria</Label>
            {loadingCategories ? (
              <div className="p-2 text-sm text-gray-500">
                Carregando categorias...
              </div>
            ) : (
              <select
                id="categoryId"
                value={formData.categoryId || ''}
                onChange={(e) => handleChange('categoryId', e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category._count?.products || 0} produtos)
                  </option>
                ))}
              </select>
            )}
            {categories.length === 0 && !loadingCategories && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <Grid3x3 className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Nenhuma categoria encontrada. Crie categorias para organizar melhor seus produtos.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            
            {formData.imageUrl ? (
              <div className="relative">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleImageRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Clique para selecionar uma imagem
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG ou WebP (máx. 5MB)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Enviando...' : 'Selecionar Imagem'}
              </Button>
              
              {formData.imageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImageRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Ou insira URL da imagem</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => handleChange('available', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="available">Produto disponível</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (isEditing ? 'Salvar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}