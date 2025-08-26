# JSX/React Style Guide

## Context

Este guia define os padrões de estilo para JSX/React em projetos AgentOS, aplicável para frontend com Next.js e React.

## JSX Structure Rules

### Component Structure
- Use 2 spaces for indentation
- Place nested elements on new lines with proper indentation
- Content between tags should be on its own line when multi-line
- Use PascalCase for component names
- Use camelCase for props and event handlers

### JSX Attribute Formatting
- Place each JSX attribute on its own line for readability
- Align attributes vertically when multiple lines
- Keep the closing `>` on the same line as the last attribute
- Use consistent attribute ordering: className, id, event handlers, other props

## Example JSX Structure

### Basic Component
```tsx
function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mt-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-green-600">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Complex Component with Multiple Props
```tsx
<Card
  className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
  onClick={handleCardClick}
  data-testid="product-card"
>
  <CardHeader className="p-0">
    <img
      src={product.imageUrl}
      alt={product.name}
      className="w-full h-48 object-cover"
      loading="lazy"
    />
  </CardHeader>
  <CardContent className="p-4">
    <h3 className="font-semibold text-lg text-gray-900">
      {product.name}
    </h3>
    <p className="text-gray-600 text-sm mt-2">
      {product.description}
    </p>
  </CardContent>
</Card>
```

### Conditional Rendering
```tsx
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <Spinner className="h-8 w-8 text-blue-600" />
    <span className="ml-2 text-gray-600">Carregando...</span>
  </div>
) : error ? (
  <div className="text-center p-8">
    <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
    <p className="text-red-600">{error.message}</p>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {products.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        onAddToCart={handleAddToCart}
      />
    ))}
  </div>
)}
```

### Form Elements
```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label
      htmlFor="email"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      Email
    </label>
    <input
      id="email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="seu@email.com"
      required
    />
  </div>
  
  <button
    type="submit"
    disabled={isSubmitting}
    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
  >
    {isSubmitting ? 'Enviando...' : 'Enviar'}
  </button>
</form>
```

## JSX Best Practices

### Fragment Usage
```tsx
// ✅ Good - Use fragments for multiple elements
function ProductList() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Nossos Produtos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}

// ❌ Avoid - Unnecessary div wrapper
function ProductList() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Nossos Produtos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### Event Handler Naming
```tsx
// ✅ Good - Descriptive event handler names
<button onClick={handleAddToCart}>Adicionar</button>
<input onChange={handleEmailChange} />
<form onSubmit={handleFormSubmit} />

// ❌ Avoid - Generic names
<button onClick={handleClick}>Adicionar</button>
<input onChange={handleChange} />
<form onSubmit={handleSubmit} />
```

### Conditional Classes
```tsx
// ✅ Good - Dynamic classes with conditional logic
<button
  className={clsx(
    'px-4 py-2 rounded-md transition-colors',
    isActive
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
  )}
>
  {isActive ? 'Ativo' : 'Inativo'}
</button>

// ✅ Good - Template literals for simple conditions
<div className={`p-4 ${isExpanded ? 'bg-blue-50' : 'bg-white'}`}>
  {content}
</div>
```

## Accessibility Guidelines

### Semantic HTML
```tsx
// ✅ Good - Use semantic elements
<main className="container mx-auto px-4 py-8">
  <section aria-labelledby="products-heading">
    <h2 id="products-heading" className="text-2xl font-bold mb-6">
      Nossos Produtos
    </h2>
    <div role="list" className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {products.map((product) => (
        <article key={product.id} role="listitem">
          <ProductCard product={product} />
        </article>
      ))}
    </div>
  </section>
</main>
```

### ARIA Labels and Descriptions
```tsx
// ✅ Good - Proper ARIA attributes
<button
  aria-label="Adicionar produto ao carrinho"
  aria-describedby="product-description"
  onClick={handleAddToCart}
>
  <ShoppingCart className="h-5 w-5" />
</button>
<div id="product-description" className="sr-only">
  Adiciona {product.name} ao carrinho de compras
</div>
```

## Integration with Project Standards

Este guia complementa:
- **TypeScript Style**: Use tipos corretos para props e eventos
- **CSS Style**: Aplique padrões TailwindCSS consistentes
- **Project-Specific Style**: Siga convenções específicas do projeto
- **Testing Standards**: Use data-testid para testes

## Quality Metrics

- **Semantic HTML**: Use elementos HTML apropriados
- **Accessibility**: Inclua ARIA labels e descrições
- **Consistent Formatting**: Mantenha estrutura JSX consistente
- **Event Handler Naming**: Use nomes descritivos para handlers
- **Conditional Rendering**: Implemente lógica condicional clara
