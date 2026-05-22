// Tipos para projetos
export interface Project {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  image: string;
  description: string;
  tags: string[];
  category: ProjectCategory;
  demoUrl: string;
  repoUrl: string;
}

export type ProjectCategory = "Todos" | "Front-end" | "Back-end" | "Mobile" | "Fullstack";

// Categorias disponiveis
export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "Todos",
  "Front-end",
  "Back-end",
  "Mobile",
  "Fullstack"
];

// Dados mockados dos projetos
export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "E-commerce Dashboard",
    author: "Ana Silva",
    authorAvatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    image: "https://picsum.photos/seed/dash/600/350",
    description: "Dashboard analítico completo com gráficos em tempo real e gestão de inventário.",
    tags: ["React", "TypeScript", "Tailwind", "Recharts"],
    category: "Front-end",
    demoUrl: "#",
    repoUrl: "#"
  },
  {
    id: 2,
    title: "Delivery API Microservices",
    author: "Carlos Souza",
    authorAvatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    image: "https://picsum.photos/seed/api/600/350",
    description: "Arquitetura de microsserviços para app de delivery escalável e resiliente.",
    tags: ["Node.js", "Docker", "Kubernetes", "PostgreSQL"],
    category: "Back-end",
    demoUrl: "#",
    repoUrl: "#"
  },
  {
    id: 3,
    title: "Finanças Pessoais App",
    author: "Beatriz Oliveira",
    authorAvatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    image: "https://picsum.photos/seed/finance/600/350",
    description: "Aplicativo mobile para controle financeiro com sincronização bancária via Open Finance.",
    tags: ["Flutter", "Dart", "Firebase"],
    category: "Mobile",
    demoUrl: "#",
    repoUrl: "#"
  },
];
