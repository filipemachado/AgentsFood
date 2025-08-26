# TypeScript Style Guide

## Context

Este guia define os padrões de estilo para TypeScript em projetos AgentOS, aplicável tanto para backend (NestJS) quanto frontend (Next.js/React).

## TypeScript Best Practices

### Type Safety
- **Always use explicit types**: Evite `any` e `unknown` quando possível
- **Strict mode**: Use `strict: true` no `tsconfig.json`
- **No implicit any**: Configure `noImplicitAny: true`
- **Exact types**: Use tipos específicos em vez de genéricos amplos

### Type Definitions
```typescript
// ✅ Good - Explicit types
interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ✅ Good - Union types for flexibility
type UserRole = 'admin' | 'user' | 'moderator';

// ✅ Good - Generic types with constraints
interface IRepository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
}

// ❌ Avoid - Implicit any
function processUser(user) { // user: any
  return user.name; // No type safety
}

// ❌ Avoid - Excessive use of any
function handleData(data: any): any {
  return data.process();
}
```

### Interface Naming Conventions
```typescript
// ✅ Good - Interface prefix for clarity
interface ICreateUserDto {
  name: string;
  email: string;
  password: string;
}

interface IUpdateUserDto {
  name?: string;
  email?: string;
}

// ✅ Good - Service interfaces
interface IUserService {
  createUser(data: ICreateUserDto): Promise<IUser>;
  updateUser(id: string, data: IUpdateUserDto): Promise<IUser>;
  deleteUser(id: string): Promise<void>;
}

// ✅ Good - Repository interfaces
interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  save(user: IUser): Promise<IUser>;
}
```

### Class Structure
```typescript
// ✅ Good - Clear class structure
@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger
  ) {}

  async createUser(data: ICreateUserDto): Promise<IUser> {
    try {
      const user = await this.userRepository.save({
        id: generateId(),
        ...data,
        createdAt: new Date()
      });
      
      this.logger.info('User created successfully', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw new BadRequestException('Failed to create user');
    }
  }
}
```

### Function Signatures
```typescript
// ✅ Good - Explicit return types
async function fetchUserData(userId: string): Promise<IUser | null> {
  // Implementation
}

// ✅ Good - Function overloading
function processData(data: string): string;
function processData(data: number): number;
function processData(data: string | number): string | number {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  return data * 2;
}

// ✅ Good - Optional and default parameters
function createUser(
  name: string,
  email: string,
  role: UserRole = 'user',
  metadata?: Record<string, unknown>
): IUser {
  // Implementation
}
```

### Error Handling
```typescript
// ✅ Good - Custom error classes
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ✅ Good - Type-safe error handling
async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<{ data: T } | { error: string }> {
  try {
    const data = await apiCall();
    return { data };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

### Generic Types
```typescript
// ✅ Good - Generic service base
abstract class BaseService<T extends { id: string }> {
  constructor(protected repository: IRepository<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    return this.repository.create(data);
  }
}

// ✅ Good - Generic API response
interface IApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: Date;
}

// ✅ Good - Generic pagination
interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Utility Types
```typescript
// ✅ Good - Use built-in utility types
type CreateUserData = Omit<IUser, 'id' | 'createdAt'>;
type UpdateUserData = Partial<Omit<IUser, 'id' | 'createdAt'>>;
type UserId = Pick<IUser, 'id'>['id'];

// ✅ Good - Custom utility types
type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;

// ✅ Good - Conditional types
type IsString<T> = T extends string ? true : false;
type StringOrNumber<T> = T extends string ? string : number;
```

### Module Organization
```typescript
// ✅ Good - Clear module structure
// user.types.ts
export interface IUser { /* ... */ }
export interface ICreateUserDto { /* ... */ }
export interface IUpdateUserDto { /* ... */ }

// user.service.ts
import { IUser, ICreateUserDto, IUpdateUserDto } from './user.types';

// user.controller.ts
import { IUser, ICreateUserDto, IUpdateUserDto } from './user.types';
import { UserService } from './user.service';

// index.ts
export * from './user.types';
export * from './user.service';
export * from './user.controller';
```

## Integration with Project Standards

Este guia complementa:
- **Project-Specific Style**: Use convenções específicas do projeto
- **ESLint Rules**: Aplica regras TypeScript estritas
- **Testing Standards**: Garante tipos corretos nos testes
- **Best Practices**: Segue princípios de qualidade do AgentOS

## Quality Metrics

- **Type Coverage**: 100% de tipos explícitos
- **No Implicit Any**: Zero uso de `any` implícito
- **Interface Usage**: Prefira interfaces sobre types quando possível
- **Generic Types**: Use genéricos para reutilização de código
- **Error Handling**: Tratamento de erro type-safe
