import {
  PrismaClient,
  EventType,
  ProfileType,
  ProjectCategoryDb,
  TagCategory,
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

const TAGS: { slug: string; label: string; category: TagCategory }[] = [
  // Frontend
  { slug: 'react', label: 'React', category: TagCategory.STACK },
  { slug: 'next-js', label: 'Next.js', category: TagCategory.STACK },
  { slug: 'vue', label: 'Vue', category: TagCategory.STACK },
  { slug: 'angular', label: 'Angular', category: TagCategory.STACK },
  { slug: 'svelte', label: 'Svelte', category: TagCategory.STACK },
  { slug: 'astro', label: 'Astro', category: TagCategory.STACK },
  { slug: 'typescript', label: 'TypeScript', category: TagCategory.STACK },
  { slug: 'javascript', label: 'JavaScript', category: TagCategory.STACK },
  { slug: 'tailwind', label: 'Tailwind', category: TagCategory.STACK },
  { slug: 'css', label: 'CSS', category: TagCategory.STACK },
  { slug: 'html', label: 'HTML', category: TagCategory.STACK },
  { slug: 'recharts', label: 'Recharts', category: TagCategory.STACK },

  // Backend
  { slug: 'node', label: 'Node.js', category: TagCategory.STACK },
  { slug: 'python', label: 'Python', category: TagCategory.STACK },
  { slug: 'django', label: 'Django', category: TagCategory.STACK },
  { slug: 'fastapi', label: 'FastAPI', category: TagCategory.STACK },
  { slug: 'go', label: 'Go', category: TagCategory.STACK },
  { slug: 'rust', label: 'Rust', category: TagCategory.STACK },
  { slug: 'java', label: 'Java', category: TagCategory.STACK },
  { slug: 'spring', label: 'Spring Boot', category: TagCategory.STACK },
  { slug: 'kotlin', label: 'Kotlin', category: TagCategory.STACK },
  { slug: 'ruby', label: 'Ruby', category: TagCategory.STACK },
  { slug: 'rails', label: 'Rails', category: TagCategory.STACK },
  { slug: 'php', label: 'PHP', category: TagCategory.STACK },
  { slug: 'laravel', label: 'Laravel', category: TagCategory.STACK },
  { slug: 'csharp', label: 'C#', category: TagCategory.STACK },
  { slug: 'dotnet', label: '.NET', category: TagCategory.STACK },

  // Mobile
  { slug: 'react-native', label: 'React Native', category: TagCategory.STACK },
  { slug: 'flutter', label: 'Flutter', category: TagCategory.STACK },
  { slug: 'dart', label: 'Dart', category: TagCategory.STACK },
  { slug: 'swift', label: 'Swift', category: TagCategory.STACK },

  // Databases & dados
  { slug: 'postgres', label: 'PostgreSQL', category: TagCategory.STACK },
  { slug: 'mysql', label: 'MySQL', category: TagCategory.STACK },
  { slug: 'mongodb', label: 'MongoDB', category: TagCategory.STACK },
  { slug: 'redis', label: 'Redis', category: TagCategory.STACK },
  { slug: 'prisma', label: 'Prisma', category: TagCategory.STACK },

  // DevOps & cloud
  { slug: 'docker', label: 'Docker', category: TagCategory.STACK },
  { slug: 'kubernetes', label: 'Kubernetes', category: TagCategory.STACK },
  { slug: 'aws', label: 'AWS', category: TagCategory.STACK },
  { slug: 'gcp', label: 'GCP', category: TagCategory.STACK },
  { slug: 'azure', label: 'Azure', category: TagCategory.STACK },
  { slug: 'firebase', label: 'Firebase', category: TagCategory.STACK },
  { slug: 'linux', label: 'Linux', category: TagCategory.STACK },
  { slug: 'git', label: 'Git', category: TagCategory.STACK },

  // APIs
  { slug: 'graphql', label: 'GraphQL', category: TagCategory.STACK },
  { slug: 'rest', label: 'REST', category: TagCategory.STACK },

  // Tópicos de interesse (não-stack)
  { slug: 'open-source', label: 'Open Source', category: TagCategory.TOPIC },
  { slug: 'carreira', label: 'Carreira', category: TagCategory.TOPIC },
  { slug: 'mentoria', label: 'Mentoria', category: TagCategory.TOPIC },
  { slug: 'lideranca', label: 'Liderança', category: TagCategory.TOPIC },
  { slug: 'iniciante', label: 'Iniciante', category: TagCategory.TOPIC },
  { slug: 'comunidade', label: 'Comunidade', category: TagCategory.TOPIC },
]

type SeedProject = {
  title: string
  description: string
  image: string
  category: ProjectCategoryDb
  tagSlugs: string[]
}

type SeedUser = {
  githubId: string
  githubUsername: string
  displayName: string
  avatarUrl: string
  profile: {
    type: ProfileType
    bio: string
    linkedinUrl: string | null
    location: string
    tagSlugs: string[]
  }
  project?: SeedProject
}

const SEED_USERS: SeedUser[] = [
  {
    githubId: 'seed-ana-silva',
    githubUsername: 'ana-silva',
    displayName: 'Ana Silva',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    profile: {
      type: ProfileType.MEMBER,
      bio: 'Frontend developer focada em produtos analíticos e visualização de dados.',
      linkedinUrl: 'https://www.linkedin.com/in/ana-silva-demo',
      location: 'Boa Vista, RR',
      tagSlugs: ['react', 'typescript', 'tailwind', 'recharts', 'carreira'],
    },
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
    profile: {
      type: ProfileType.MEMBER,
      bio: 'Backend engineer especializado em microsserviços e infra cloud.',
      linkedinUrl: 'https://www.linkedin.com/in/carlos-souza-demo',
      location: 'Boa Vista, RR',
      tagSlugs: ['node', 'docker', 'kubernetes', 'postgres', 'aws'],
    },
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
    profile: {
      type: ProfileType.MEMBER,
      bio: 'Mobile developer apaixonada por aplicativos financeiros.',
      linkedinUrl: null,
      location: 'Boa Vista, RR',
      tagSlugs: ['flutter', 'dart', 'firebase'],
    },
    project: {
      title: 'Finanças Pessoais App',
      description:
        'Aplicativo mobile para controle financeiro com sincronização bancária via Open Finance.',
      image: 'https://picsum.photos/seed/finance/600/350',
      category: ProjectCategoryDb.MOBILE,
      tagSlugs: ['flutter', 'dart', 'firebase'],
    },
  },
  {
    githubId: 'seed-pedro-mendes',
    githubUsername: 'pedro-mendes',
    displayName: 'Pedro Mendes',
    avatarUrl: 'https://i.pravatar.cc/150?u=pedro-mendes',
    profile: {
      type: ProfileType.LEADER,
      bio: 'Fullstack dev e liderança técnica. Cuida da agenda de eventos.',
      linkedinUrl: 'https://www.linkedin.com/in/pedro-mendes-demo',
      location: 'Boa Vista, RR',
      tagSlugs: ['react', 'next-js', 'node', 'typescript', 'lideranca', 'mentoria'],
    },
  },
  {
    githubId: 'seed-mariana-costa',
    githubUsername: 'mariana-costa',
    displayName: 'Mariana Costa',
    avatarUrl: 'https://i.pravatar.cc/150?u=mariana-costa',
    profile: {
      type: ProfileType.MEMBER,
      bio: 'Pythonista, gosta de APIs limpas e bem documentadas.',
      linkedinUrl: 'https://www.linkedin.com/in/mariana-costa-demo',
      location: 'Boa Vista, RR',
      tagSlugs: ['python', 'fastapi', 'django', 'postgres', 'docker'],
    },
  },
  {
    githubId: 'seed-lucas-andrade',
    githubUsername: 'lucas-andrade',
    displayName: 'Lucas Andrade',
    avatarUrl: 'https://i.pravatar.cc/150?u=lucas-andrade',
    profile: {
      type: ProfileType.MEMBER,
      bio: 'Aprendendo desenvolvimento web e curtindo o caminho.',
      linkedinUrl: null,
      location: 'Pacaraima, RR',
      tagSlugs: ['javascript', 'css', 'html', 'vue', 'iniciante'],
    },
  },
  {
    githubId: 'seed-techrr',
    githubUsername: 'techrr',
    displayName: 'TechRR Soluções',
    avatarUrl: 'https://i.pravatar.cc/150?u=techrr',
    profile: {
      type: ProfileType.COMPANY,
      bio: 'Empresa parceira da comunidade. Oferece estágio e mentoria.',
      linkedinUrl: 'https://www.linkedin.com/company/techrr-demo',
      location: 'Boa Vista, RR',
      tagSlugs: ['comunidade', 'mentoria', 'carreira'],
    },
  },
  {
    githubId: 'seed-renato-alves',
    githubUsername: 'renato-alves',
    displayName: 'Renato Alves',
    avatarUrl: 'https://i.pravatar.cc/150?u=renato-alves',
    profile: {
      type: ProfileType.MEMBER,
      bio: 'Mobile developer cross-plataforma. Curte open source.',
      linkedinUrl: null,
      location: 'Boa Vista, RR',
      tagSlugs: ['react-native', 'swift', 'kotlin', 'open-source'],
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
      update: { label: t.label, category: t.category },
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
        acceptedTermsAt: new Date(),
      },
      create: {
        githubId: seed.githubId,
        githubUsername: seed.githubUsername,
        avatarUrl: seed.avatarUrl,
        acceptedTermsAt: new Date(),
      },
    })

    const profileData = {
      displayName: seed.displayName,
      type: seed.profile.type,
      bio: seed.profile.bio,
      linkedinUrl: seed.profile.linkedinUrl,
      location: seed.profile.location,
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: { userId: user.id, ...profileData },
    })

    await prisma.profileTag.deleteMany({ where: { profileId: profile.id } })
    for (const slug of seed.profile.tagSlugs) {
      const tag = await prisma.tag.findUnique({ where: { slug } })
      if (tag) {
        await prisma.profileTag.create({
          data: { profileId: profile.id, tagId: tag.id },
        })
      }
    }

    if (!seed.project) continue

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
