# Configuration Files Specification

This document specifies all configuration files needed for the Booklite project.

## Table of Contents

1. [Package Configuration](#package-configuration)
2. [TypeScript Configuration](#typescript-configuration)
3. [Linter Configuration](#linter-configuration)
4. [Formatter Configuration](#formatter-configuration)
5. [Build Tools Configuration](#build-tools-configuration)
6. [Git Configuration](#git-configuration)

---

## Package Configuration

### Root package.json (Monorepo)

```json
{
  "name": "booklite",
  "version": "1.0.0",
  "private": true,
  "description": "Lightweight bookkeeping for independent consultants",
  "workspaces": [
    "frontend",
    "backend",
    "shared"
  ],
  "scripts": {
    "dev": "concurrently &quot;npm run dev:frontend&quot; &quot;npm run dev:backend&quot;",
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend",
    "build": "npm run build --workspaces",
    "build:frontend": "npm run build --workspace=frontend",
    "build:backend": "npm run build --workspace=backend",
    "test": "npm run test --workspaces",
    "test:unit": "npm run test:unit --workspaces",
    "test:integration": "npm run test:integration --workspaces",
    "test:e2e": "playwright test",
    "lint": "npm run lint --workspaces",
    "lint:fix": "npm run lint:fix --workspaces",
    "format": "prettier --write &quot;**/*.{ts,tsx,js,jsx,json,md,astro,svelte}&quot;",
    "format:check": "prettier --check &quot;**/*.{ts,tsx,js,jsx,json,md,astro,svelte}&quot;",
    "type-check": "npm run type-check --workspaces",
    "clean": "npm run clean --workspaces && rm -rf node_modules",
    "prepare": "husky install",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:build": "docker-compose build"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.4.3",
    "@commitlint/config-conventional": "^18.4.3",
    "@playwright/test": "^1.40.1",
    "concurrently": "^8.2.2",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.1.1",
    "prettier-plugin-astro": "^0.12.2",
    "prettier-plugin-svelte": "^3.1.2",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,astro,svelte}": [
      "prettier --write"
    ]
  }
}
```

### Frontend package.json

```json
{
  "name": "@booklite/frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest",
    "test:unit": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext .ts,.astro,.svelte",
    "lint:fix": "eslint . --ext .ts,.astro,.svelte --fix",
    "type-check": "astro check && tsc --noEmit",
    "clean": "rm -rf dist .astro node_modules"
  },
  "dependencies": {
    "@astrojs/svelte": "^5.0.3",
    "@astrojs/tailwind": "^5.0.3",
    "@supabase/supabase-js": "^2.39.0",
    "astro": "^4.0.6",
    "svelte": "^4.2.8",
    "tailwindcss": "^3.4.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@astrojs/check": "^0.3.4",
    "@sveltejs/vite-plugin-svelte": "^3.0.1",
    "@testing-library/svelte": "^4.0.5",
    "@types/node": "^20.10.6",
    "@typescript-eslint/eslint-plugin": "^6.16.0",
    "@typescript-eslint/parser": "^6.16.0",
    "@vitest/ui": "^1.1.0",
    "eslint": "^8.56.0",
    "eslint-plugin-astro": "^0.31.0",
    "eslint-plugin-svelte": "^2.35.1",
    "jsdom": "^23.0.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "vitest": "^1.1.0"
  }
}
```

### Backend package.json

```json
{
  "name": "@booklite/backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "@fastify/cors": "^8.5.0",
    "@fastify/helmet": "^11.1.1",
    "@fastify/jwt": "^7.2.3",
    "@fastify/rate-limit": "^9.1.0",
    "@fastify/static": "^6.12.0",
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.3.1",
    "fastify": "^4.25.2",
    "pino": "^8.17.2",
    "pino-pretty": "^10.3.1",
    "puppeteer": "^21.7.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.6",
    "@typescript-eslint/eslint-plugin": "^6.16.0",
    "@typescript-eslint/parser": "^6.16.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

### Shared package.json

```json
{
  "name": "@booklite/shared",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "test:unit": "vitest run",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@typescript-eslint/eslint-plugin": "^6.16.0",
    "@typescript-eslint/parser": "^6.16.0",
    "eslint": "^8.56.0",
    "typescript": "^5.3.3",
    "vitest": "^1.1.0"
  }
}
```

---

## TypeScript Configuration

### Root tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "incremental": true,
    "paths": {
      "@shared/*": ["./shared/src/*"]
    }
  },
  "exclude": ["node_modules", "dist", "build", ".astro"]
}
```

### Frontend tsconfig.json

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "jsxImportSource": "svelte",
    "moduleResolution": "bundler",
    "types": ["astro/client", "vite/client"],
    "baseUrl": ".",
    "paths": {
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "**/*.astro"],
  "exclude": ["node_modules", "dist", ".astro"]
}
```

### Backend tsconfig.json

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node", "jest"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": ".",
    "paths": {
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Shared tsconfig.json

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Linter Configuration

### .eslintrc.json

```json
{
  "root": true,
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:astro/recommended",
    "plugin:svelte/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "overrides": [
    {
      "files": ["*.astro"],
      "parser": "astro-eslint-parser",
      "parserOptions": {
        "parser": "@typescript-eslint/parser",
        "extraFileExtensions": [".astro"]
      }
    },
    {
      "files": ["*.svelte"],
      "parser": "svelte-eslint-parser",
      "parserOptions": {
        "parser": "@typescript-eslint/parser"
      }
    }
  ]
}
```

### biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/1.4.1/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExtraBooleanCast": "error",
        "noMultipleSpacesInRegularExpressionLiterals": "error",
        "noUselessCatch": "error",
        "noWith": "error"
      },
      "correctness": {
        "noConstAssign": "error",
        "noConstantCondition": "error",
        "noEmptyPattern": "error",
        "noGlobalObjectCalls": "error",
        "noInvalidConstructorSuper": "error",
        "noNewSymbol": "error",
        "noSetterReturn": "error",
        "noUndeclaredVariables": "error",
        "noUnreachable": "error",
        "noUnreachableSuper": "error"
      },
      "style": {
        "noArguments": "error",
        "noVar": "error",
        "useConst": "error"
      },
      "suspicious": {
        "noAsyncPromiseExecutor": "error",
        "noCatchAssign": "error",
        "noClassAssign": "error",
        "noCompareNegZero": "error",
        "noControlCharactersInRegex": "error",
        "noDebugger": "error",
        "noDuplicateCase": "error",
        "noDuplicateClassMembers": "error",
        "noDuplicateObjectKeys": "error",
        "noDuplicateParameters": "error",
        "noEmptyBlockStatements": "error",
        "noFallthroughSwitchClause": "error",
        "noFunctionAssign": "error",
        "noGlobalAssign": "error",
        "noImportAssign": "error",
        "noMisleadingCharacterClass": "error",
        "noPrototypeBuiltins": "error",
        "noRedeclare": "error",
        "noShadowRestrictedNames": "error",
        "noUnsafeNegation": "error",
        "useValidTypeof": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

---

## Formatter Configuration

### .prettierrc

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-astro", "prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    },
    {
      "files": "*.svelte",
      "options": {
        "parser": "svelte"
      }
    }
  ]
}
```

### .prettierignore

```
node_modules
dist
build
.astro
coverage
*.log
.env
.env.*
!.env.example
```

---

## Build Tools Configuration

### Astro Configuration (astro.config.mjs)

```javascript
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [svelte(), tailwind()],
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    resolve: {
      alias: {
        '@features': '/src/features',
        '@shared': '/src/shared',
        '@': '/src',
      },
    },
  },
});
```

### Tailwind Configuration (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
};
```

### Vite Configuration (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

---

## Git Configuration

### .gitignore

```
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
.astro/
.output/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.*.local
!.env.example

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/
*.lcov

# Temporary files
tmp/
temp/
*.tmp
*.temp

# Database
*.db
*.sqlite
*.sqlite3

# Secrets
*.pem
*.key
secrets/

# Docker
.dockerignore

# Misc
.cache/
.parcel-cache/
```

### .gitattributes

```
* text=auto eol=lf
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf
```

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Specification - Ready for Implementation