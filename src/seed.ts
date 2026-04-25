import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import { SettingsService } from './settings/settings.service';
import { ConflictException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UserService);
  const settingsService = app.get(SettingsService);

  console.log('Seeding admin user...');
  try {
    const existingUser = await userService.findOneByEmail('care@santaan.com');
    if (!existingUser) {
      await userService.create({
        name: 'Admin User',
        email: 'care@santaan.com',
        password: 'admin',
      });
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    if (error instanceof ConflictException) {
      console.log('Admin user already exists (Conflict).');
    } else {
      console.error('Failed to create admin user:', error);
    }
  }

  console.log('Seeding website contents...');
  try {
    await settingsService.upsert({
      general: {
        phone: '+91 1234567890',
        email: 'care@santaan.com',
        hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
        address: 'Santaan Clinic, Medical Center',
        logoPath: '',
        footerDescription: 'Santaan is dedicated to providing the best fertility care with compassion and excellence.',
        workingHours: 'Mon - Sat: 9:00 AM - 6:00 PM',
      },
      about: {
        headline: 'About Santaan',
        body: 'Welcome to Santaan, your trusted partner in fertility care.',
        heroImage: '',
        mainImage: '',
        cardTitle: 'Our Mission',
        cardBody: 'To provide the best fertility treatments.',
      },
      homePage: {
        treatmentSection: {
          title: 'Our Treatments',
          description: 'Explore the variety of treatments we offer.',
        },
        aboutSection: {
          heading: 'Who We Are',
          description: 'A leading fertility clinic dedicated to you.',
        },
        teamSection: {
          heading: 'Our Team',
          description: 'Meet our dedicated team of professionals.',
        },
        questionsSection: {
          heading: 'Frequently Asked Questions',
          description: 'Answers to your common queries.',
        },
      },
      heroSlides: [
        {
          id: 'slide-1',
          image: '',
          title: 'Welcome to Santaan',
          subtitle: 'Your journey starts here',
          description: 'Compassionate care for your family.',
          buttonText: 'Learn More',
          buttonLink: '/about',
        },
      ],
      experts: [],
    });
    console.log('Website contents seeded successfully.');
  } catch (error) {
    console.error('Failed to seed website contents:', error);
  }

  await app.close();
  console.log('Seeding completed.');
}

bootstrap().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
