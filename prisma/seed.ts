import {
  PrismaClient,
  EventType,
  ProjectCategoryDb,
  Visibility,
} from '@prisma/client'

const prisma = new PrismaClient()

const EVENTS = [
  {
    number: '#01',
    title: 'Evento 1',
    description:
      'Um encontro exclusivo para networking, troca de ideias e colaboração em projetos da comunidade.',
    dateFull: 'Sábado, 30 de Fevereiro às 8h',
    dateShort: '01 de Fevereiro',
    type: EventType.REMOTO,
    imageIndex: 201,
  },
  {
    number: '#02',
    title: 'Evento 2',
    description:
      'Explore as últimas tendências em desenvolvimento com palestrantes convidados e hands-on workshops.',
    dateFull: 'Sábado, 30 de Fevereiro às 8h',
    dateShort: '01 de Fevereiro',
    type: EventType.REMOTO,
    imageIndex: 202,
  },
  {
    number: '#03',
    title: 'Evento 3',
    description:
      'Aprenda com especialistas da indústria sobre novas tecnologias e melhores práticas para desenvolvimento.',
    dateFull: 'Sábado, 30 de Fevereiro às 8h',
    dateShort: '01 de Fevereiro',
    type: EventType.REMOTO,
    imageIndex: 203,
  },
  {
    number: '#04',
    title: 'Evento 4',
    description:
      'Descubra como criar um portfólio que chame a atenção de recrutadores e empresas de tecnologia.',
    dateFull: 'Sábado, 30 de Fevereiro às 8h',
    dateShort: '01 de Fevereiro',
    type: EventType.PRESENCIAL,
    imageIndex: 204,
  },
]

const CHALLENGES = [
  {
    number: '#01',
    title: 'Desafio de Desenvolvimento Web',
    description:
      'Crie uma aplicação responsiva utilizando as últimas tecnologias front-end e back-end.',
    imageIndex: 1,
    tags: [
      { iconName: 'Monitor', label: 'Avançado' },
      { iconName: 'Layers', label: 'Next.js' },
    ],
  },
  {
    number: '#02',
    title: 'Melhoria de UX/UI',
    description:
      'Aprimore a experiência de usuário de um projeto existente, considerando boas práticas.',
    imageIndex: 2,
    tags: [{ iconName: 'Monitor', label: 'Iniciante' }],
  },
  {
    number: '#03',
    title: 'Automatização de Testes',
    description:
      'Construa uma suíte de testes automatizados para garantir a qualidade de software.',
    imageIndex: 3,
    tags: [{ iconName: 'Monitor', label: 'Iniciante' }],
  },
  {
    number: '#04',
    title: 'Desenvolvimento de API',
    description:
      'Implemente e documente uma API RESTful para uso em aplicações modernas.',
    imageIndex: 4,
    tags: [{ iconName: 'Monitor', label: 'Intermediário' }],
  },
]

const TAGS = [
  { slug: 'react', label: 'React' },
  { slug: 'typescript', label: 'TypeScript' },
  { slug: 'tailwind', label: 'Tailwind' },
  { slug: 'recharts', label: 'Recharts' },
  { slug: 'node', label: 'Node.js' },
  { slug: 'docker', label: 'Docker' },
  { slug: 'kubernetes', label: 'Kubernetes' },
  { slug: 'postgres', label: 'PostgreSQL' },
  { slug: 'flutter', label: 'Flutter' },
  { slug: 'dart', label: 'Dart' },
  { slug: 'firebase', label: 'Firebase' },
]

const SEED_USERS = [
  {
    githubId: 'seed-ana-silva',
    githubUsername: 'ana-silva',
    displayName: 'Ana Silva',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    project: {
      title: 'E-commerce Dashboard',
      description:
        'Dashboard analítico completo com gráficos em tempo real e gestão de inventário.',
      image: 'https://picsum.photos/seed/dash/600/350',
      category: ProjectCategoryDb.FRONTEND,
      tagSlugs: ['react', 'typescript', 'tailwind', 'recharts'],
    },
  },
  {
    githubId: 'seed-carlos-souza',
    githubUsername: 'carlos-souza',
    displayName: 'Carlos Souza',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    project: {
      title: 'Delivery API Microservices',
      description:
        'Arquitetura de microsserviços para app de delivery escalável e resiliente.',
      image: 'https://picsum.photos/seed/api/600/350',
      category: ProjectCategoryDb.BACKEND,
      tagSlugs: ['node', 'docker', 'kubernetes', 'postgres'],
    },
  },
  {
    githubId: 'seed-beatriz-oliveira',
    githubUsername: 'beatriz-oliveira',
    displayName: 'Beatriz Oliveira',
    avatarUrl: 'https://i.pravatar.cc/150?u=a04258114e29026302d',
    project: {
      title: 'Finanças Pessoais App',
      description:
        'Aplicativo mobile para controle financeiro com sincronização bancária via Open Finance.',
      image: 'https://picsum.photos/seed/finance/600/350',
      category: ProjectCategoryDb.MOBILE,
      tagSlugs: ['flutter', 'dart', 'firebase'],
    },
  },
]

async function main() {
  console.log('▶ Seeding events...')
  for (const data of EVENTS) {
    await prisma.event.upsert({
      where: { number: data.number },
      update: data,
      create: { ...data, visibility: Visibility.PUBLIC },
    })
  }

  console.log('▶ Seeding challenges...')
  for (const { tags, ...data } of CHALLENGES) {
    const challenge = await prisma.challenge.upsert({
      where: { number: data.number },
      update: data,
      create: { ...data, visibility: Visibility.PUBLIC },
    })
    await prisma.challengeTag.deleteMany({ where: { challengeId: challenge.id } })
    await prisma.challengeTag.createMany({
      data: tags.map((t) => ({ ...t, challengeId: challenge.id })),
    })
  }

  console.log('▶ Seeding tags...')
  for (const t of TAGS) {
    await prisma.tag.upsert({
      where: { slug: t.slug },
      update: { label: t.label },
      create: t,
    })
  }

  console.log('▶ Seeding users + profiles + projects...')
  for (const seed of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { githubId: seed.githubId },
      update: {
        githubUsername: seed.githubUsername,
        avatarUrl: seed.avatarUrl,
      },
      create: {
        githubId: seed.githubId,
        githubUsername: seed.githubUsername,
        avatarUrl: seed.avatarUrl,
      },
    })

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { displayName: seed.displayName },
      create: {
        userId: user.id,
        displayName: seed.displayName,
      },
    })

    const existingProject = await prisma.userProject.findFirst({
      where: { userId: user.id, title: seed.project.title },
    })

    const projectData = {
      title: seed.project.title,
      description: seed.project.description,
      image: seed.project.image,
      authorAvatar: seed.avatarUrl,
      category: seed.project.category,
      demoUrl: '#',
      repoUrl: '#',
      visibility: Visibility.PUBLIC,
    }

    const project = existingProject
      ? await prisma.userProject.update({
          where: { id: existingProject.id },
          data: projectData,
        })
      : await prisma.userProject.create({
          data: { ...projectData, userId: user.id },
        })

    await prisma.userProjectTag.deleteMany({ where: { projectId: project.id } })
    for (const slug of seed.project.tagSlugs) {
      const tag = await prisma.tag.findUnique({ where: { slug } })
      if (tag) {
        await prisma.userProjectTag.create({
          data: { projectId: project.id, tagId: tag.id },
        })
      }
    }
  }

  console.log('✔ Seed concluído.')
}

main()
  .catch((e) => {
    console.error('✘ Seed falhou:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
