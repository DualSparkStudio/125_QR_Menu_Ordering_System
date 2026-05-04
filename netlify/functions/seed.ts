import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'the-fork-cafe' },
    update: {},
    create: {
      name: 'The Fork Café',
      slug: 'the-fork-cafe',
      description: 'A modern dining experience with QR ordering',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400001',
      phone: '+91 22 1234 5678',
      email: 'contact@theforkcafe.com',
      currency: 'INR',
      taxPercentage: 5,
      serviceChargePercentage: 10,
      isOpen: true,
    },
  });

  console.log('✅ Restaurant created:', restaurant.name);

  // Create admin staff
  const passwordHash = await bcrypt.hash('admin123', 10);
  const staff = await prisma.staff.upsert({
    where: { 
      restaurantId_email: {
        restaurantId: restaurant.id,
        email: 'admin@thefork.com'
      }
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: 'Admin User',
      email: 'admin@thefork.com',
      phone: '+91 98765 43210',
      role: 'owner',
      passwordHash,
      isActive: true,
    },
  });

  console.log('✅ Admin staff created:', staff.email);

  // Create menu categories
  const appetizers = await prisma.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId: restaurant.id,
        name: 'Appetizers'
      }
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: 'Appetizers',
      description: 'Start your meal right',
      displayOrder: 1,
      isActive: true,
    },
  });

  const mains = await prisma.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId: restaurant.id,
        name: 'Main Course'
      }
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: 'Main Course',
      description: 'Hearty and delicious',
      displayOrder: 2,
      isActive: true,
    },
  });

  const desserts = await prisma.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId: restaurant.id,
        name: 'Desserts'
      }
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: 'Desserts',
      description: 'Sweet endings',
      displayOrder: 3,
      isActive: true,
    },
  });

  console.log('✅ Categories created');

  // Create sample menu items
  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        categoryId: appetizers.id,
        name: 'Spring Rolls',
        description: 'Crispy vegetable spring rolls with sweet chili sauce',
        basePrice: 150,
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 10,
      },
      {
        restaurantId: restaurant.id,
        categoryId: appetizers.id,
        name: 'Chicken Wings',
        description: 'Spicy buffalo wings with ranch dip',
        basePrice: 250,
        isVegetarian: false,
        spiceLevel: 2,
        isAvailable: true,
        preparationTime: 15,
      },
      {
        restaurantId: restaurant.id,
        categoryId: mains.id,
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh mozzarella and basil',
        basePrice: 350,
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 20,
      },
      {
        restaurantId: restaurant.id,
        categoryId: mains.id,
        name: 'Grilled Chicken',
        description: 'Herb-marinated grilled chicken with vegetables',
        basePrice: 450,
        isVegetarian: false,
        isAvailable: true,
        preparationTime: 25,
      },
      {
        restaurantId: restaurant.id,
        categoryId: desserts.id,
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center',
        basePrice: 180,
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 12,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Menu items created');

  // Create sample tables
  await prisma.table.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        tableNumber: 'T1',
        section: 'main',
        capacity: 4,
        qrCode: `QR-${restaurant.id}-T1`,
        status: 'available',
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        tableNumber: 'T2',
        section: 'main',
        capacity: 2,
        qrCode: `QR-${restaurant.id}-T2`,
        status: 'available',
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        tableNumber: 'T3',
        section: 'outdoor',
        capacity: 6,
        qrCode: `QR-${restaurant.id}-T3`,
        status: 'available',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Tables created');

  console.log('\n🎉 Seeding complete!');
  console.log('\n📝 Login credentials:');
  console.log('   Email: admin@thefork.com');
  console.log('   Password: admin123');
  console.log(`\n🏪 Restaurant: ${restaurant.name}`);
  console.log(`   ID: ${restaurant.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
