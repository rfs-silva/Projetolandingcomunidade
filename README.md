# RR Fullstack Developers

Landing page oficial da comunidade RR Fullstack Developers de Roraima.

## Sobre

Plataforma web desenvolvida para conectar desenvolvedores fullstack em Roraima, oferecendo recursos de mentoria, eventos, desafios e networking.

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

## Instalação

```bash
npm install
```

## Executar localmente

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## Build para produção

```bash
npm run build
```

## Preview da build

```bash
npm run preview
```

## Estrutura do Projeto

```
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI reutilizáveis
│   ├── Header.tsx      # Cabeçalho/Navbar
│   ├── Hero.tsx        # Seção hero
│   ├── Footer.tsx      # Rodapé
│   └── ...
├── public/             # Arquivos estáticos
├── App.tsx             # Componente principal
└── index.tsx           # Ponto de entrada
```

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença

© 2026 RR Fullstack Developers. Todos os direitos reservados.

# Implement Figma Design

This is a code bundle for Implement Figma Design. The original project is available at https://www.figma.com/design/8QXfA4dKwyg63LGrRWHEIW/Implement-Figma-Design.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Gitflow

Este projeto segue a estratégia de Gitflow. Para mais informações sobre o fluxo de trabalho, branches e convenções, consulte [GITFLOW.md](./GITFLOW.md).

### Branches Principais

- **`main`** - Produção (código estável em produção)
- **`develop`** - Desenvolvimento (integração de novas features)
- **`homol`** - Homologação (testes antes da produção)

### Fluxo Rápido

```bash
# Criar feature
git checkout develop
git checkout -b feature/minha-feature

# Desenvolver...

# Pull Request: feature → develop → homol → main
```

Para detalhes completos, veja [GITFLOW.md](./GITFLOW.md).
