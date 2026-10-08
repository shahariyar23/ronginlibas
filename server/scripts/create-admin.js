import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'node:readline';

const prisma = new PrismaClient();

async function prompt(questionText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(questionText, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  let email = args[0];
  let password = args[1];
  let firstName = args[2] || 'Admin';
  let lastName = args[3] || 'User';
  let roleInput = args[4] || 'SUPER_ADMIN';

  if (!email) {
    email = await prompt('Enter Admin Email: ');
  }
  if (!password) {
    password = await prompt('Enter Admin Password: ');
  }

  if (!email || !password) {
    console.error('Error: Email and password are required.');
    process.exit(1);
  }

  const role = roleInput.toUpperCase() === 'ADMIN' ? Role.ADMIN : Role.SUPER_ADMIN;
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        passwordHash,
        firstName: firstName || existing.firstName,
        lastName: lastName || existing.lastName,
        role,
        isActive: true,
      },
    });
    console.log(`\n✓ Admin user "${updated.email}" updated successfully with the new password!`);
    console.log(`  Role: ${updated.role}`);
    console.log(`  Name: ${updated.firstName} ${updated.lastName}`);
  } else {
    const created = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role,
        isActive: true,
      },
    });
    console.log(`\n✓ New Admin user created successfully!`);
    console.log(`  Email: ${created.email}`);
    console.log(`  Role: ${created.role}`);
    console.log(`  Name: ${created.firstName} ${created.lastName}`);
  }

  console.log(`\nYou can now log in at: http://localhost:3001/login`);
}

main()
  .catch((err) => {
    console.error('Failed to create/update admin user:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
