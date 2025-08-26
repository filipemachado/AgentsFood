# Shadcn/ui Style Guide

## Context

Este guia define os padrões de uso do Shadcn/ui em projetos AgentOS, aplicável para frontend com Next.js, React e TailwindCSS. O Shadcn/ui é nossa biblioteca de componentes UI principal, fornecendo componentes acessíveis e customizáveis.

## Shadcn/ui Fundamentals

### Component Philosophy
- **Copy-Paste Approach**: Componentes são copiados para o projeto, não instalados via npm
- **Fully Customizable**: Todos os componentes podem ser modificados conforme necessário
- **TypeScript First**: Componentes são escritos em TypeScript com tipos explícitos
- **TailwindCSS Integration**: Usa TailwindCSS para estilização e customização

### Installation & Setup
```bash
# Instalar CLI do Shadcn/ui
npm install -D @shadcn/ui

# Inicializar no projeto
npx shadcn-ui@latest init

# Adicionar componentes
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
```

## Component Usage Patterns

### Button Component
```tsx
// ✅ Good - Uso padrão com variants
<Button variant="default" size="default">
  Clique aqui
</Button>

// ✅ Good - Variants específicos para ações
<Button variant="destructive" size="sm">
  Excluir
</Button>

<Button variant="outline" size="lg">
  Cancelar
</Button>

// ✅ Good - Estados de loading
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Salvando...
    </>
  ) : (
    'Salvar'
  )}
</Button>

// ✅ Good - Composição com ícones
<Button variant="ghost" size="icon">
  <Plus className="h-4 w-4" />
</Button>
```

### Card Component
```tsx
// ✅ Good - Estrutura padrão de card
<Card className="overflow-hidden">
  <CardHeader className="p-0">
    <img
      src={product.imageUrl}
      alt={product.name}
      className="w-full h-48 object-cover"
    />
  </CardHeader>
  <CardContent className="p-4">
    <h3 className="font-semibold text-lg">{product.name}</h3>
    <p className="text-gray-600 text-sm">{product.description}</p>
  </CardContent>
  <CardFooter className="p-4 pt-0">
    <Button className="w-full">Adicionar ao Carrinho</Button>
  </CardFooter>
</Card>

// ✅ Good - Card com hover effects
<Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
  {/* Card content */}
</Card>
```

### Form Components
```tsx
// ✅ Good - Input com label e validação
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="seu@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className={cn(
      "transition-colors",
      errors.email && "border-red-500 focus:border-red-500"
    )}
  />
  {errors.email && (
    <p className="text-sm text-red-500">{errors.email}</p>
  )}
</div>

// ✅ Good - Select com opções
<Select value={category} onValueChange={setCategory}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione uma categoria" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="burgers">Hambúrgueres</SelectItem>
    <SelectItem value="drinks">Bebidas</SelectItem>
    <SelectItem value="desserts">Sobremesas</SelectItem>
  </SelectContent>
</Select>
```

### Dialog & Modal Components
```tsx
// ✅ Good - Dialog para confirmações
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Confirmar Ação</DialogTitle>
      <DialogDescription>
        Tem certeza que deseja continuar? Esta ação não pode ser desfeita.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>
        Confirmar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Theme Configuration

### Color System
```tsx
// ✅ Good - Uso consistente de cores do tema
<Button 
  className="bg-primary text-primary-foreground hover:bg-primary/90"
>
  Botão Primário
</Button>

<Button 
  className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
>
  Botão Secundário
</Button>

// ✅ Good - Estados de erro e sucesso
<div className="bg-destructive text-destructive-foreground p-4 rounded-md">
  Erro: Algo deu errado
</div>

<div className="bg-green-100 text-green-800 p-4 rounded-md border border-green-200">
  Sucesso: Operação realizada com sucesso
</div>
```

### Dark Mode Support
```tsx
// ✅ Good - Componentes com suporte a dark mode
<Card className="bg-card text-card-foreground border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Título</CardTitle>
    <CardDescription className="text-muted-foreground">
      Descrição
    </CardDescription>
  </CardHeader>
</Card>

// ✅ Good - Customização específica para dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
  {/* Content */}
</div>
```

### Custom CSS Variables
```css
/* globals.css - Variáveis do tema Shadcn/ui */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}
```

## Customization Guidelines

### Component Variants
```tsx
// ✅ Good - Variants customizados para botões
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700"
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
```

### Responsive Design
```tsx
// ✅ Good - Componentes responsivos
<Card className="p-4 sm:p-6 md:p-8">
  <CardHeader className="space-y-2 sm:space-y-3">
    <CardTitle className="text-lg sm:text-xl md:text-2xl">
      Título Responsivo
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4 sm:space-y-6">
    {/* Content */}
  </CardContent>
</Card>

// ✅ Good - Grid responsivo
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

## Integration with TailwindCSS

### Utility Classes
```tsx
// ✅ Good - Combinação de Shadcn/ui com TailwindCSS
<Button 
  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
>
  Botão Gradiente
</Button>

// ✅ Good - Animações customizadas
<div className="animate-fade-in-up hover:animate-bounce">
  <Card className="hover:scale-105 transition-transform duration-200">
    {/* Card content */}
  </Card>
</div>
```

### Custom Animations
```css
/* globals.css - Animações customizadas */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out;
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
```

## Performance Best Practices

### Lazy Loading
```tsx
// ✅ Good - Lazy loading de componentes pesados
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Memoization
```tsx
// ✅ Good - Memoização de componentes
const ProductCard = memo(({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card>
      {/* Card content */}
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';
```

### Bundle Optimization
```tsx
// ✅ Good - Import seletivo de componentes
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ❌ Avoid - Import de todos os componentes
import * as UI from "@/components/ui";
```

## Accessibility Standards

### ARIA Labels
```tsx
// ✅ Good - Labels acessíveis
<Button
  aria-label="Adicionar produto ao carrinho"
  aria-describedby="product-description"
  onClick={handleAddToCart}
>
  <ShoppingCart className="h-5 w-5" />
</Button>

<div id="product-description" className="sr-only">
  Adiciona {product.name} ao carrinho de compras
</div>
```

### Keyboard Navigation
```tsx
// ✅ Good - Navegação por teclado
<Dialog>
  <DialogTrigger asChild>
    <Button onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
    }}>
      Abrir Modal
    </Button>
  </DialogTrigger>
  {/* Dialog content */}
</Dialog>
```

### Focus Management
```tsx
// ✅ Good - Gerenciamento de foco
useEffect(() => {
  if (isOpen) {
    // Focus no primeiro elemento interativo
    const firstButton = dialogRef.current?.querySelector('button');
    firstButton?.focus();
  }
}, [isOpen]);
```

## Testing Guidelines

### Component Testing
```tsx
// ✅ Good - Teste de componentes Shadcn/ui
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with correct variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-destructive');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Testing
```tsx
// ✅ Good - Teste de integração com formulários
describe('Product Form', () => {
  it('should submit form with valid data', async () => {
    render(<ProductForm onSubmit={mockSubmit} />);
    
    const nameInput = screen.getByLabelText(/nome/i);
    const priceInput = screen.getByLabelText(/preço/i);
    const submitButton = screen.getByRole('button', { name: /salvar/i });
    
    fireEvent.change(nameInput, { target: { value: 'X-Burger' } });
    fireEvent.change(priceInput, { target: { value: '25.50' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'X-Burger',
        price: 25.50
      });
    });
  });
});
```

## Integration with Project Standards

Este guia complementa:
- **TypeScript Style**: Use tipos corretos para props dos componentes
- **JSX Style**: Aplique padrões JSX consistentes
- **TailwindCSS Style**: Use classes TailwindCSS com componentes
- **Project-Specific Style**: Siga convenções específicas do projeto
- **Testing Standards**: Implemente testes para componentes UI

## Quality Metrics

- **Component Consistency**: Use variants e sizes padrão
- **Accessibility**: Implemente ARIA labels e navegação por teclado
- **Performance**: Lazy loading e memoização quando apropriado
- **Responsiveness**: Componentes adaptáveis a diferentes telas
- **Theme Integration**: Uso consistente de variáveis CSS
- **Testing Coverage**: Testes para todos os componentes customizados

## Common Patterns

### Form Layout
```tsx
// ✅ Good - Layout de formulário consistente
<form className="space-y-6" onSubmit={handleSubmit}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <Label htmlFor="name">Nome</Label>
      <Input id="name" name="name" required />
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" name="email" type="email" required />
    </div>
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="message">Mensagem</Label>
    <Textarea id="message" name="message" rows={4} />
  </div>
  
  <div className="flex justify-end space-x-3">
    <Button type="button" variant="outline" onClick={onCancel}>
      Cancelar
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Enviando...' : 'Enviar'}
    </Button>
  </div>
</form>
```

### Data Display
```tsx
// ✅ Good - Exibição de dados em cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {orders.map((order) => (
    <Card key={order.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pedido #{order.id}
          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
            {order.status}
          </Badge>
        </CardTitle>
        <CardDescription>
          {formatDate(order.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-semibold">{formatPrice(order.total)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  ))}
</div>
```
