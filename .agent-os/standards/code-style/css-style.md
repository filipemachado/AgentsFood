# TailwindCSS Style Guide

## Context

Este guia define os padrões de estilo para TailwindCSS em projetos AgentOS, aplicável para frontend com Next.js, React e TailwindCSS.

## TailwindCSS Best Practices

### Class Organization
- **Layout**: Container, flexbox, grid, spacing
- **Typography**: Text size, weight, color, alignment
- **Background**: Colors, gradients, opacity
- **Borders**: Width, radius, color, style
- **Effects**: Shadows, transitions, transforms, filters
- **Responsive**: Breakpoint-specific classes
- **Interactive**: Hover, focus, active states

### Multi-line Class Formatting
```tsx
// ✅ Good - Organized by category with responsive variants
<div className="flex flex-col space-y-4 p-6 bg-white rounded-lg shadow-md
                hover:shadow-lg transition-shadow duration-200
                sm:flex-row sm:space-y-0 sm:space-x-4
                md:p-8 md:space-x-6
                lg:p-10 lg:space-x-8">
  {/* Content */}
</div>

// ✅ Good - Responsive breakpoints on separate lines
<button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                  sm:w-auto sm:px-6
                  md:text-base md:px-8
                  lg:text-lg lg:px-10">
  Enviar
</button>

// ✅ Good - Complex components with clear organization
<div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100
                border border-gray-200 rounded-xl shadow-sm
                hover:shadow-md hover:border-blue-300
                transition-all duration-300 ease-in-out
                sm:p-6 sm:border-2
                md:p-8 md:shadow-md
                lg:p-10 lg:shadow-lg">
  {/* Content */}
</div>
```

### Responsive Design Patterns
```tsx
// ✅ Good - Mobile-first approach with progressive enhancement
<div className="grid grid-cols-1 gap-4 p-4
                sm:grid-cols-2 sm:gap-6 sm:p-6
                md:grid-cols-3 md:gap-8 md:p-8
                lg:grid-cols-4 lg:gap-10 lg:p-10
                xl:grid-cols-5 xl:gap-12 xl:p-12">
  {/* Grid items */}
</div>

// ✅ Good - Responsive typography
<h1 className="text-2xl font-bold text-gray-900
               sm:text-3xl
               md:text-4xl
               lg:text-5xl
               xl:text-6xl">
  Título Principal
</h1>

// ✅ Good - Responsive spacing
<section className="py-8 px-4
                  sm:py-12 sm:px-6
                  md:py-16 md:px-8
                  lg:py-20 lg:px-10
                  xl:py-24 xl:px-12">
  {/* Section content */}
</section>
```

### Color System Usage
```tsx
// ✅ Good - Consistent color palette
<div className="bg-white text-gray-900 border-gray-200
                hover:bg-gray-50 hover:border-gray-300
                focus:ring-blue-500 focus:border-blue-500">
  {/* Content */}
</div>

// ✅ Good - Semantic color usage
<div className="bg-green-50 text-green-800 border-green-200
                dark:bg-green-900 dark:text-green-200 dark:border-green-700">
  ✅ Sucesso
</div>

<div className="bg-red-50 text-red-800 border-red-200
                dark:bg-red-900 dark:text-red-200 dark:border-red-700">
  ❌ Erro
</div>

<div className="bg-yellow-50 text-yellow-800 border-yellow-200
                dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700">
  ⚠️ Aviso
</div>
```

### Component Variants
```tsx
// ✅ Good - Button variants using conditional classes
function Button({ variant = 'primary', size = 'md', children, ...props }) {
  const baseClasses = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Dark Mode Support
```tsx
// ✅ Good - Dark mode classes
<div className="bg-white text-gray-900 border-gray-200
                dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700
                transition-colors duration-200">
  {/* Content */}
</div>

// ✅ Good - Dark mode with hover states
<button className="bg-blue-600 text-white hover:bg-blue-700
                  dark:bg-blue-500 dark:hover:bg-blue-600
                  transition-colors duration-200">
  Botão
</button>
```

### Custom CSS Classes
```css
/* globals.css - Custom component classes */
@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  }
  
  .btn-secondary {
    @apply bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
  }
  
  .card-hover {
    @apply hover:shadow-lg hover:-translate-y-1 transition-all duration-200;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
  
  .form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
}
```

### Animation and Transitions
```tsx
// ✅ Good - Smooth transitions
<div className="transform transition-all duration-300 ease-in-out
                hover:scale-105 hover:shadow-lg">
  {/* Content */}
</div>

// ✅ Good - Staggered animations
{items.map((item, index) => (
  <div
    key={item.id}
    className="opacity-0 animate-fade-in-up"
    style={{
      animationDelay: `${index * 100}ms`,
      animationFillMode: 'forwards'
    }}
  >
    {item.content}
  </div>
))}

// ✅ Good - Loading states
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

### Utility-First Approach
```tsx
// ✅ Good - Use utility classes for quick styling
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <span className="text-lg font-semibold text-gray-900">Título</span>
  <button className="text-blue-600 hover:text-blue-800 transition-colors">
    Ação
  </button>
</div>

// ✅ Good - Combine utilities for complex layouts
<div className="relative flex flex-col min-h-screen bg-gray-50">
  <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    {/* Header content */}
  </header>
  
  <main className="flex-1 container mx-auto px-4 py-8">
    {/* Main content */}
  </main>
  
  <footer className="bg-gray-900 text-white py-8">
    {/* Footer content */}
  </footer>
</div>
```

## Integration with Project Standards

Este guia complementa:
- **JSX Style**: Aplique classes TailwindCSS consistentemente
- **TypeScript Style**: Use tipos para props de estilo
- **Project-Specific Style**: Siga convenções específicas do projeto
- **Testing Standards**: Use classes consistentes para testes

## Quality Metrics

- **Consistent Formatting**: Organize classes por categoria
- **Responsive Design**: Implemente mobile-first approach
- **Dark Mode**: Suporte completo para temas escuros
- **Performance**: Minimize custom CSS, use utilities
- **Accessibility**: Mantenha contraste e foco adequados
- **Maintainability**: Use variáveis e componentes reutilizáveis
