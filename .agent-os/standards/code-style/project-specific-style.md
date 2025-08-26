# Project-Specific Code Style Guide

## Context

Este guia de estilo é específico para o projeto "Vitrine de Alimentos via WhatsApp" e complementa os padrões globais do AgentOS.

## Stack-Specific Rules

### TypeScript & NestJS (Backend)

#### Naming Conventions
- **Interfaces**: Use PascalCase with descriptive names (e.g., `IWhatsAppMessage`, `IFoodItem`)
- **DTOs**: Suffix with `Dto` (e.g., `CreateOrderDto`, `UpdateProductDto`)
- **Services**: Suffix with `Service` (e.g., `WhatsAppService`, `OrderService`)
- **Controllers**: Suffix with `Controller` (e.g., `OrderController`, `ProductController`)
- **Guards**: Suffix with `Guard` (e.g., `AuthGuard`, `RoleGuard`)
- **Interceptors**: Suffix with `Interceptor` (e.g., `LoggingInterceptor`, `TransformInterceptor`)

#### File Structure
```
src/
├── modules/
│   ├── orders/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── orders.module.ts
│   └── products/
├── common/
│   ├── guards/
│   ├── interceptors/
│   └── decorators/
└── config/
```

#### Code Examples

**Service Method:**
```typescript
@Injectable()
export class OrderService {
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const order = await this.orderRepository.create(createOrderDto);
      await this.whatsAppService.sendOrderConfirmation(order);
      return order;
    } catch (error) {
      this.logger.error('Failed to create order', error);
      throw new BadRequestException('Failed to create order');
    }
  }
}
```

**DTO:**
```typescript
export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customerPhone: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### Next.js & React (Frontend)

#### Naming Conventions
- **Components**: Use PascalCase (e.g., `ProductCard`, `OrderForm`)
- **Hooks**: Prefix with `use` (e.g., `useWhatsApp`, `useOrders`)
- **Pages**: Use kebab-case for file names (e.g., `product-details.tsx`, `order-history.tsx`)
- **Utils**: Use camelCase (e.g., `formatPrice`, `validatePhone`)

#### File Structure
```
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── globals.css
├── components/
│   ├── ui/          # Shadcn/ui components
│   ├── forms/       # Form components
│   └── layout/      # Layout components
├── hooks/           # Custom hooks
├── lib/             # Utilities and configurations
└── types/           # TypeScript type definitions
```

#### Component Examples

**Functional Component:**
```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await onAddToCart(product);
      toast.success('Produto adicionado ao carrinho!');
    } catch (error) {
      toast.error('Erro ao adicionar produto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold">
            {formatPrice(product.price)}
          </span>
          <Button
            onClick={handleAddToCart}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Adicionar'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### TailwindCSS & Shadcn/ui

#### Class Organization
- **Layout**: Container, flexbox, grid, spacing
- **Typography**: Text size, weight, color
- **Background**: Colors, gradients, opacity
- **Borders**: Width, radius, color
- **Effects**: Shadows, transitions, transforms
- **Responsive**: Breakpoint-specific classes

#### Multi-line Class Formatting
```tsx
<div className="flex flex-col space-y-4 p-6 bg-white rounded-lg shadow-md
                hover:shadow-lg transition-shadow duration-200
                sm:flex-row sm:space-y-0 sm:space-x-4
                md:p-8 md:space-x-6
                lg:p-10 lg:space-x-8">
  {/* Content */}
</div>
```

#### Custom CSS Classes
```css
/* globals.css */
@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors;
  }
  
  .card-hover {
    @apply hover:shadow-lg hover:-translate-y-1 transition-all duration-200;
  }
}
```

### Database & Prisma

#### Naming Conventions
- **Tables**: Use snake_case plural (e.g., `food_items`, `order_items`)
- **Fields**: Use snake_case (e.g., `created_at`, `updated_at`, `phone_number`)
- **Relations**: Use descriptive names (e.g., `customer_orders`, `product_categories`)

#### Prisma Schema Example
```prisma
model FoodItem {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  imageUrl    String?
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("food_items")
}

model Order {
  id            String      @id @default(cuid())
  customerPhone String
  status        OrderStatus @default(PENDING)
  total         Decimal     @db.Decimal(10, 2)
  items         OrderItem[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@map("orders")
}
```

### WhatsApp Integration

#### Message Formatting
```typescript
// Use consistent message templates
const messageTemplates = {
  welcome: (customerName: string) => 
    `Olá ${customerName}! 👋\n\nBem-vindo à nossa vitrine de alimentos!\n\nDigite *menu* para ver nossos produtos.`,
  
  orderConfirmation: (order: Order) =>
    `✅ Pedido confirmado!\n\n📋 Número: #${order.id}\n💰 Total: ${formatPrice(order.total)}\n\n⏰ Entregaremos em breve!`,
  
  productList: (products: Product[]) =>
    `🍽️ Nossos Produtos:\n\n${products.map(p => 
      `• ${p.name} - ${formatPrice(p.price)}`
    ).join('\n')}`
};
```

### Error Handling

#### Backend Error Responses
```typescript
// Consistent error structure
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

// In controllers
@Post()
async createOrder(@Body() createOrderDto: CreateOrderDto) {
  try {
    return await this.orderService.createOrder(createOrderDto);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Internal server error', 'INTERNAL_ERROR');
  }
}
```

#### Frontend Error Handling
```typescript
// Use consistent error handling patterns
const handleApiError = (error: any) => {
  if (error.response?.data?.message) {
    toast.error(error.response.data.message);
  } else {
    toast.error('Ocorreu um erro inesperado');
  }
};
```

## Integration with Global Standards

Este guia complementa os padrões globais do AgentOS:
- **Indentação**: Mantém 2 espaços
- **Naming**: Adapta para TypeScript/JavaScript conventions
- **Estrutura**: Organiza arquivos por funcionalidade
- **Documentação**: Mantém comentários claros e relevantes
- **Shadcn/ui**: Use o guia específico para componentes UI
- **WhatsApp**: Use o guia específico para integração WhatsApp
- **IA/NLP**: Use padrões específicos para processamento de linguagem natural

## Quality Assurance

- **TypeScript**: Sempre use tipos explícitos
- **ESLint**: Configure regras específicas para o projeto
- **Prettier**: Formatação automática consistente
- **Testing**: Testes unitários para lógica de negócio
- **Performance**: Lazy loading e otimizações de bundle
