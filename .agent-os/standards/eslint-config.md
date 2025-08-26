# ESLint Configuration Guide

## Context

Este guia define as configurações ESLint específicas para o projeto "Vitrine de Alimentos via WhatsApp" que garantem a qualidade e consistência do código.

## Project-Specific ESLint Rules

### TypeScript & NestJS (Backend)

#### Strict TypeScript Rules
```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "@typescript-eslint/explicit-member-accessibility": "warn",
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/prefer-readonly": "warn",
  "@typescript-eslint/no-non-null-assertion": "warn"
}
```

#### NestJS Best Practices
```json
{
  "@typescript-eslint/no-empty-function": "off",
  "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  "prefer-const": "error",
  "no-var": "error"
}
```

#### Naming Convention Enforcement
```json
{
  "@typescript-eslint/naming-convention": [
    "error",
    {
      "selector": "interface",
      "format": ["PascalCase"],
      "prefix": ["I"]
    },
    {
      "selector": "typeAlias",
      "format": ["PascalCase"]
    },
    {
      "selector": "class",
      "format": ["PascalCase"]
    },
    {
      "selector": "function",
      "format": ["camelCase"]
    },
    {
      "selector": "variable",
      "format": ["camelCase", "UPPER_CASE"]
    }
  ]
}
```

### Next.js & React (Frontend)

#### React Best Practices
```json
{
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",
  "react/jsx-key": "error",
  "react/jsx-no-duplicate-props": "error",
  "react/jsx-no-undef": "error",
  "react/no-array-index-key": "warn",
  "react/no-unescaped-entities": "warn"
}
```

#### Import Organization
```json
{
  "import/order": [
    "error",
    {
      "groups": [
        "builtin",
        "external",
        "internal",
        "parent",
        "sibling",
        "index"
      ],
      "newlines-between": "always",
      "alphabetize": {
        "order": "asc",
        "caseInsensitive": true
      }
    }
  ],
  "import/no-unresolved": "error",
  "import/no-duplicates": "error"
}
```

### TailwindCSS & CSS

#### Class Naming Consistency
```json
{
  "tailwindcss/classnames-order": "warn",
  "tailwindcss/no-custom-classname": "warn",
  "tailwindcss/no-contradicting-classname": "error"
}
```

#### CSS-in-JS Rules
```json
{
  "css-modules/no-unused-class": "error",
  "css-modules/no-undef-class": "error"
}
```

## Complete ESLint Configuration

### Backend (.eslintrc.js)
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    '@nestjs/eslint-plugin',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@nestjs/eslint-plugin/recommended',
    'prettier'
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-member-accessibility': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/prefer-readonly': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // Naming conventions
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I']
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase']
      },
      {
        selector: 'class',
        format: ['PascalCase']
      },
      {
        selector: 'function',
        format: ['camelCase']
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE']
      }
    ],
    
    // General rules
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'prettier/prettier': 'error'
  },
  env: {
    node: true,
    es6: true
  }
};
```

### Frontend (.eslintrc.js)
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import',
    'tailwindcss',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:tailwindcss/recommended',
    'prettier'
  ],
  rules: {
    // React rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/no-array-index-key': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react/react-in-jsx-scope': 'off',
    
    // Import organization
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    'import/no-unresolved': 'error',
    'import/no-duplicates': 'error',
    
    // TypeScript rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    
    // TailwindCSS rules
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'warn',
    'tailwindcss/no-contradicting-classname': 'error',
    
    // General rules
    'prefer-const': 'error',
    'no-var': 'error',
    'prettier/prettier': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    es6: true,
    node: true
  }
};
```

## Prettier Configuration

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### .prettierignore
```
node_modules/
dist/
build/
.next/
.env*
*.log
```

## Integration with AgentOS

Este guia ESLint integra perfeitamente com:
- **Code Style Standards**: Aplica as convenções de nomenclatura definidas
- **Best Practices**: Garante qualidade e consistência do código
- **Project-Specific Rules**: Adapta regras para o stack tecnológico do projeto
- **Quality Assurance**: Mantém padrões de qualidade em todo o desenvolvimento

## Usage Instructions

1. **Install Dependencies**: Adicione os pacotes ESLint necessários
2. **Copy Configurations**: Use as configurações específicas para backend/frontend
3. **IDE Integration**: Configure seu editor para usar ESLint automaticamente
4. **Pre-commit Hooks**: Use husky para verificar código antes dos commits
5. **CI/CD Integration**: Execute ESLint em todos os builds

## Quality Metrics

- **Zero ESLint Errors**: Código deve passar sem erros
- **Minimal Warnings**: Reduzir warnings ao mínimo possível
- **Consistent Formatting**: Prettier garante formatação consistente
- **Type Safety**: TypeScript com regras estritas
- **Import Organization**: Imports organizados e sem duplicatas
