import React from 'react';

// Tipos para desafios
export interface Challenge {
  number: string;
  title: string;
  description: string;
  tags: ChallengeTag[];
  imageIndex: number;
}

export interface ChallengeTag {
  icon: React.ReactNode;
  label: string;
}

export type ChallengeLevel = "Iniciante" | "Intermediário" | "Avançado";

// Dados mockados dos desafios
// Os icones sao injetados no componente para evitar problemas na serializacao
export const CHALLENGES_DATA = [
  {
    number: "#01",
    title: "Desafio de Desenvolvimento Web",
    description: "Crie uma aplicação responsiva utilizando as últimas tecnologias front-end e back-end.",
    tags: [
      { iconName: "Monitor", label: "Avançado" },
      { iconName: "Layers", label: "Next.js" }
    ],
    imageIndex: 1
  },
  {
    number: "#02",
    title: "Melhoria de UX/UI",
    description: "Aprimore a experiência de usuário de um projeto existente, considerando boas práticas.",
    tags: [
      { iconName: "Monitor", label: "Iniciante" }
    ],
    imageIndex: 2
  },
  {
    number: "#03",
    title: "Automatização de Testes",
    description: "Construa uma suíte de testes automatizados para garantir a qualidade de software.",
    tags: [
      { iconName: "Monitor", label: "Iniciante" }
    ],
    imageIndex: 3
  },
  {
    number: "#04",
    title: "Desenvolvimento de API",
    description: "Implemente e documente uma API RESTful para uso em aplicações modernas.",
    tags: [
      { iconName: "Monitor", label: "Intermediário" }
    ],
    imageIndex: 4
  }
];
