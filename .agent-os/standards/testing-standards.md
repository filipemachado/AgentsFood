# Testing Standards

## Context

Este guia define os padrões de testes específicos para o projeto "Vitrine de Alimentos via WhatsApp" que garantem qualidade, confiabilidade e manutenibilidade do código.

## Testing Strategy

### Testing Pyramid
```
    /\
   /  \     E2E Tests (Few)
  /____\    Integration Tests (Some)
 /______\   Unit Tests (Many)
```

### Coverage Targets
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 60%+ coverage  
- **E2E Tests**: Critical user flows
- **Overall**: 75%+ combined coverage

## Backend Testing (NestJS)

### Unit Testing Framework
- **Framework**: Jest
- **Test Runner**: Jest CLI
- **Coverage**: Jest Coverage
- **Mocking**: Jest Mocks + ts-mockito

### Test Structure
```
src/
├── modules/
│   └── orders/
│       ├── orders.service.spec.ts
│       ├── orders.controller.spec.ts
│       └── orders.module.spec.ts
└── test/
    ├── setup.ts
    ├── mocks/
    └── helpers/
```

### Service Testing Example
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: jest.Mocked<OrdersRepository>;
  let whatsAppService: jest.Mocked<WhatsAppService>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockWhatsAppService = {
      sendOrderConfirmation: jest.fn(),
      sendOrderUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: mockRepository },
        { provide: WhatsAppService, useValue: mockWhatsAppService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get(OrdersRepository);
    whatsAppService = module.get(WhatsAppService);
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      // Arrange
      const createOrderDto: CreateOrderDto = {
        customerPhone: '+5511999999999',
        items: [
          { productId: '1', quantity: 2, price: 25.50 }
        ],
        notes: 'Sem cebola'
      };

      const expectedOrder: Order = {
        id: 'order-123',
        customerPhone: '+5511999999999',
        status: 'PENDING',
        total: 51.00,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      repository.create.mockResolvedValue(expectedOrder);
      whatsAppService.sendOrderConfirmation.mockResolvedValue(undefined);

      // Act
      const result = await service.createOrder(createOrderDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(createOrderDto);
      expect(whatsAppService.sendOrderConfirmation).toHaveBeenCalledWith(expectedOrder);
      expect(result).toEqual(expectedOrder);
    });

    it('should throw error when customer phone is invalid', async () => {
      // Arrange
      const createOrderDto: CreateOrderDto = {
        customerPhone: 'invalid-phone',
        items: [{ productId: '1', quantity: 1, price: 25.50 }]
      };

      // Act & Assert
      await expect(service.createOrder(createOrderDto))
        .rejects
        .toThrow('Invalid phone number format');
    });
  });
});
```

### Controller Testing Example
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

  beforeEach(async () => {
    const mockService = {
      createOrder: jest.fn(),
      findById: jest.fn(),
      updateOrder: jest.fn(),
      deleteOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get(OrdersService);
  });

  describe('POST /orders', () => {
    it('should create order and return 201', async () => {
      // Arrange
      const createOrderDto: CreateOrderDto = {
        customerPhone: '+5511999999999',
        items: [{ productId: '1', quantity: 1, price: 25.50 }]
      };

      const expectedOrder: Order = {
        id: 'order-123',
        customerPhone: '+5511999999999',
        status: 'PENDING',
        total: 25.50,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.createOrder.mockResolvedValue(expectedOrder);

      // Act
      const result = await controller.createOrder(createOrderDto);

      // Assert
      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(expectedOrder);
    });
  });
});
```

### Integration Testing
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders.module';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

describe('Orders Integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test',
          password: 'test',
          database: 'test_db',
          entities: [Order],
          synchronize: true,
        }),
        OrdersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create order through API', async () => {
    // Arrange
    const createOrderDto: CreateOrderDto = {
      customerPhone: '+5511999999999',
      items: [{ productId: '1', quantity: 1, price: 25.50 }]
    };

    // Act
    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);

    // Assert
    expect(response.body).toMatchObject({
      customerPhone: '+5511999999999',
      status: 'PENDING',
      total: 25.50
    });
  });
});
```

## Frontend Testing (Next.js + React)

### Testing Framework
- **Framework**: Jest + React Testing Library
- **Test Runner**: Jest CLI
- **Component Testing**: React Testing Library
- **Mocking**: Jest Mocks + MSW (Mock Service Worker)

### Test Structure
```
src/
├── components/
│   └── ProductCard/
│       ├── ProductCard.tsx
│       ├── ProductCard.test.tsx
│       └── __mocks__/
├── hooks/
│   └── useOrders/
│       ├── useOrders.ts
│       └── useOrders.test.ts
└── __tests__/
    ├── setup.ts
    ├── mocks/
    └── helpers/
```

### Component Testing Example
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';

const mockProduct: Product = {
  id: '1',
  name: 'X-Burger',
  description: 'Hambúrguer delicioso',
  price: 25.50,
  imageUrl: '/images/x-burger.jpg',
  categoryId: 'burgers'
};

const mockOnAddToCart = jest.fn();

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product information correctly', () => {
    // Arrange & Act
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
      />
    );

    // Assert
    expect(screen.getByText('X-Burger')).toBeInTheDocument();
    expect(screen.getByText('Hambúrguer delicioso')).toBeInTheDocument();
    expect(screen.getByText('R$ 25,50')).toBeInTheDocument();
    expect(screen.getByAltText('X-Burger')).toHaveAttribute('src', '/images/x-burger.jpg');
  });

  it('should call onAddToCart when button is clicked', async () => {
    // Arrange
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
      />
    );

    const addButton = screen.getByRole('button', { name: /adicionar/i });

    // Act
    fireEvent.click(addButton);

    // Assert
    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
    });
  });

  it('should show loading state while adding to cart', async () => {
    // Arrange
    const slowOnAddToCart = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={slowOnAddToCart} 
      />
    );

    const addButton = screen.getByRole('button', { name: /adicionar/i });

    // Act
    fireEvent.click(addButton);

    // Assert
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /adicionar/i })).not.toBeDisabled();
    });
  });
});
```

### Hook Testing Example
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useOrders } from './useOrders';
import { ordersApi } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api');
const mockOrdersApi = ordersApi as jest.Mocked<typeof ordersApi>;

describe('useOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch orders successfully', async () => {
    // Arrange
    const mockOrders = [
      { id: '1', customerPhone: '+5511999999999', status: 'PENDING', total: 25.50 }
    ];

    mockOrdersApi.getOrders.mockResolvedValue(mockOrders);

    // Act
    const { result } = renderHook(() => useOrders());

    // Assert
    expect(result.current.orders).toEqual([]);
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.orders).toEqual(mockOrders);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle error when API fails', async () => {
    // Arrange
    const mockError = new Error('API Error');
    mockOrdersApi.getOrders.mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useOrders());

    // Assert
    await waitFor(() => {
      expect(result.current.error).toBe(mockError.message);
      expect(result.current.loading).toBe(false);
    });
  });
});
```

## WhatsApp Integration Testing

### Mock WhatsApp API
```typescript
// __mocks__/whatsapp-api.ts
export const mockWhatsAppApi = {
  sendMessage: jest.fn(),
  sendTemplate: jest.fn(),
  getWebhook: jest.fn(),
};

// In tests
jest.mock('@/lib/whatsapp-api', () => ({
  whatsAppApi: mockWhatsAppApi,
}));

describe('WhatsApp Integration', () => {
  it('should send order confirmation message', async () => {
    // Arrange
    const order = { id: '1', customerPhone: '+5511999999999', total: 25.50 };
    
    // Act
    await whatsAppService.sendOrderConfirmation(order);

    // Assert
    expect(mockWhatsAppApi.sendMessage).toHaveBeenCalledWith(
      '+5511999999999',
      expect.stringContaining('✅ Pedido confirmado!')
    );
  });
});
```

## Test Configuration

### Jest Configuration (Backend)
```javascript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/index.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
```

### Jest Configuration (Frontend)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Quality Metrics

### Test Coverage Reports
- **Unit Tests**: Jest coverage reports
- **Integration Tests**: API endpoint coverage
- **E2E Tests**: Critical user flow coverage
- **Performance Tests**: Response time benchmarks

### Continuous Integration
- Run tests on every commit
- Block merges with failing tests
- Generate coverage reports
- Track test performance over time

## Best Practices

### Test Organization
- **AAA Pattern**: Arrange, Act, Assert
- **Descriptive Names**: Clear test descriptions
- **Single Responsibility**: One assertion per test
- **Mock External Dependencies**: Isolate unit tests

### Test Data Management
- **Factories**: Create test data consistently
- **Fixtures**: Reusable test data sets
- **Cleanup**: Reset state between tests
- **Isolation**: Tests should not depend on each other

### Performance Testing
- **Response Times**: API endpoints under 200ms
- **Database Queries**: Optimize N+1 queries
- **Memory Usage**: Monitor for memory leaks
- **Load Testing**: Simulate realistic user loads
