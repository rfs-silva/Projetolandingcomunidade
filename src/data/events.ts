// Tipos para eventos
export interface Event {
  number: string;
  title: string;
  description: string;
  dateFull: string;
  dateShort: string;
  type: EventType;
  imageIndex: number;
}

export type EventType = "Remoto" | "Presencial";

// Dados mockados dos eventos
export const EVENTS: Event[] = [
  {
    number: "#01",
    title: "Evento 1",
    description: "Um encontro exclusivo para networking, troca de ideias e colaboração em projetos da comunidade.",
    dateFull: "Sábado, 30 de Fevereiro às 8h",
    dateShort: "01 de Fevereiro",
    type: "Remoto",
    imageIndex: 201
  },
  {
    number: "#02",
    title: "Evento 2",
    description: "Explore as últimas tendências em desenvolvimento com palestrantes convidados e hands-on workshops.",
    dateFull: "Sábado, 30 de Fevereiro às 8h",
    dateShort: "01 de Fevereiro",
    type: "Remoto",
    imageIndex: 202
  },
  {
    number: "#03",
    title: "Evento 3",
    description: "Aprenda com especialistas da indústria sobre novas tecnologias e melhores práticas para desenvolvimento.",
    dateFull: "Sábado, 30 de Fevereiro às 8h",
    dateShort: "01 de Fevereiro",
    type: "Remoto",
    imageIndex: 203
  },
  {
    number: "#04",
    title: "Evento 4",
    description: "Descubra como criar um portfólio que chame a atenção de recrutadores e empresas de tecnologia.",
    dateFull: "Sábado, 30 de Fevereiro às 8h",
    dateShort: "01 de Fevereiro",
    type: "Presencial",
    imageIndex: 204
  }
];
