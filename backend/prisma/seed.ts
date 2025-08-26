import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@agentsfood.com' },
    update: {},
    create: {
      email: 'admin@agentsfood.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create establishment
  const establishment = await prisma.establishment.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      name: 'Lanchonete da Dona Maria',
      description: 'Os melhores lanches da cidade!',
      phone: '+5511999999999',
      address: 'Rua das Flores, 123 - Centro',
      userId: adminUser.id,
    },
  });

  console.log('✅ Establishment created:', establishment.name);

  // Create agent config
  const agentConfig = await prisma.agentConfig.upsert({
    where: { establishmentId: establishment.id },
    update: {},
    create: {
      establishmentId: establishment.id,
      welcomeMessage: 'Olá! Bem-vindo à Lanchonete da Dona Maria! 🍔 Como posso ajudá-lo hoje?',
      tone: 'friendly',
      customPrompt: 'Você é um atendente virtual da Lanchonete da Dona Maria. Seja sempre cordial, prestativo e use emojis para tornar a conversa mais agradável.',
    },
  });

  console.log('✅ Agent config created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Lanches',
        description: 'Lanches tradicionais e especiais',
        displayOrder: 1,
        establishmentId: establishment.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bebidas',
        description: 'Refrigerantes, sucos e águas',
        displayOrder: 2,
        establishmentId: establishment.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Batata Recheada',
        description: 'Batatas assadas com diversos recheios',
        displayOrder: 3,
        establishmentId: establishment.id,
      },
    }),
  ]);

  console.log('✅ Categories created:', categories.length);

  // Create products
  const products = await Promise.all([
    // Lanches
    prisma.product.create({
      data: {
        name: 'X-Burger',
        description: 'Pão, hambúrguer, queijo, alface, tomate e maionese',
        price: 15.90,
        establishmentId: establishment.id,
        categoryId: categories[0].id,
        displayOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        name: 'X-Salada',
        description: 'Pão, hambúrguer, queijo, alface, tomate, cebola e maionese',
        price: 18.50,
        establishmentId: establishment.id,
        categoryId: categories[0].id,
        displayOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        name: 'X-Bacon',
        description: 'Pão, hambúrguer, queijo, bacon, alface, tomate e maionese',
        price: 21.90,
        establishmentId: establishment.id,
        categoryId: categories[0].id,
        displayOrder: 3,
      },
    }),
    
    // Bebidas
    prisma.product.create({
      data: {
        name: 'Coca-Cola 350ml',
        description: 'Refrigerante de cola gelado',
        price: 5.50,
        establishmentId: establishment.id,
        categoryId: categories[1].id,
        displayOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Suco de Laranja 300ml',
        description: 'Suco natural de laranja',
        price: 7.00,
        establishmentId: establishment.id,
        categoryId: categories[1].id,
        displayOrder: 2,
      },
    }),
    
    // Batata Recheada
    prisma.product.create({
      data: {
        name: 'Batata com Frango',
        description: 'Batata assada recheada com frango desfiado e queijo',
        price: 16.90,
        establishmentId: establishment.id,
        categoryId: categories[2].id,
        displayOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Batata com Carne Seca',
        description: 'Batata assada recheada com carne seca e queijo',
        price: 19.90,
        establishmentId: establishment.id,
        categoryId: categories[2].id,
        displayOrder: 2,
      },
    }),
  ]);

  console.log('✅ Products created:', products.length);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });