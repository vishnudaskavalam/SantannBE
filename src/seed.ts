import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import { SettingsService } from './settings/settings.service';
import { TreatmentsService } from './treatments/treatments.service';
import { EnquiryService } from './enquiry/enquiry.service';
import { ContactService } from './contact/contact.service';
import { ConflictException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UserService);
  const settingsService = app.get(SettingsService);
  const treatmentsService = app.get(TreatmentsService);
  const enquiryService = app.get(EnquiryService);
  const contactService = app.get(ContactService);

  // 1. Seed Admin User
  console.log('Seeding admin user...');
  try {
    const existingUser = await userService.findOneByEmail('care@santaan.com');
    if (!existingUser) {
      await userService.create({
        name: 'Admin User',
        email: 'care@santaan.com',
        password: 'admin123',
      });
      console.log('Admin user created successfully (email: care@santaan.com).');
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

  // 2. Seed Treatments
  console.log('Seeding treatments...');
  try {
    const defaultTreatments = [
      {
        name: 'In Vitro Fertilization (IVF)',
        slug: 'in-vitro-fertilization',
        shortDescription:
          'Advanced assisted reproductive technology helping couples achieve pregnancy through specialized laboratory fertilization.',
        description:
          'In Vitro Fertilization (IVF) is the benchmark standard in assisted reproductive technology (ART). The journey involves monitoring and stimulating follicular development, retrieving mature oocytes, fertilizing them in our state-of-the-art embryology cleanroom, and transferring high-grade embryos back into the uterus. At Santaan, customized hormonal protocols and cutting-edge incubation maximize your clinical success.',
        status: 'active',
        iconType: 'ivf',
        keyBenefits: [
          'Personalized hormonal stimulation protocols',
          'Cleanroom Class 10,000 embryology laboratories',
          'High clinical pregnancy and live-birth rates',
          'Optional pre-implantation genetic testing (PGT-A)',
        ],
        process: [
          {
            step: 'Step 1: Ovarian Stimulation',
            detail:
              'Targeted medications stimulate ovaries to produce multiple healthy, mature follicles over 10-12 days.',
          },
          {
            step: 'Step 2: Egg & Sperm Retrieval',
            detail:
              'Gentle ultrasound-guided egg retrieval under short sedation while the sperm sample is prepared.',
          },
          {
            step: 'Step 3: Laboratory Fertilization',
            detail:
              'Eggs and sperm are combined in specialized culture media for optimal fertilization.',
          },
          {
            step: 'Step 4: Embryo Culture & Assessment',
            detail:
              'Embryos are monitored through day 3 to day 5 blastocyst stage using advanced incubators.',
          },
          {
            step: 'Step 5: Embryo Transfer',
            detail:
              'The highest graded embryo is placed into the uterus using gentle catheter guidance.',
          },
        ],
      },
      {
        name: 'Intrauterine Insemination (IUI)',
        slug: 'intrauterine-insemination',
        shortDescription:
          'A minimally invasive, gentle fertility procedure placing concentrated motile sperm directly into the uterus.',
        description:
          'Intrauterine Insemination (IUI) is a cost-effective, non-invasive first-line treatment for couples facing unexplained infertility, mild male subfertility, or cervical factors. Motile sperm are separated, washed, and placed directly into the uterine cavity around the time of ovulation, dramatically shortening the distance needed to fertilize the egg.',
        status: 'active',
        iconType: 'iui',
        keyBenefits: [
          'Non-invasive and virtually painless procedure',
          'Cost-effective initial fertility therapy',
          'Performed in a comfortable outpatient setting without anesthesia',
          'Precise ovulation timing with ultrasound follicle tracking',
        ],
        process: [
          {
            step: 'Step 1: Ovulation Tracking',
            detail:
              'Follicular growth is monitored with transvaginal ultrasound to identify the optimal ovulation window.',
          },
          {
            step: 'Step 2: Sperm Washing',
            detail:
              'The semen sample is processed to extract the most viable, motile sperm in nutrient media.',
          },
          {
            step: 'Step 3: Insemination',
            detail:
              'A sterile flexible catheter deposits concentrated sperm into the uterine cavity.',
          },
          {
            step: 'Step 4: Post-Procedure Care',
            detail:
              'A brief rest in the clinic followed by normal daily routine and luteal support.',
          },
        ],
      },
      {
        name: 'Intracytoplasmic Sperm Injection (ICSI)',
        slug: 'intracytoplasmic-sperm-injection',
        shortDescription:
          'A specialized micro-fertilization technique where a single chosen sperm is injected directly into an egg.',
        description:
          'ICSI is an advanced micromanipulation technique designed for severe male-factor infertility, previous fertilization failure, or low sperm count/motility. Under high magnification, our embryologist selects a single healthy sperm and micro-injects it directly into the cytoplasm of a mature egg, overcoming natural barriers to fertilization.',
        status: 'active',
        iconType: 'icsi',
        keyBenefits: [
          'Effective solution for low sperm count, motility, or morphology',
          'Maximizes fertilization rates for low egg yield cycles',
          'Suitable for surgically retrieved sperm (TESA/PESA)',
          'High fertilization consistency across complex cases',
        ],
        process: [
          {
            step: 'Step 1: Egg Denudation & Selection',
            detail:
              'Mature MII eggs are prepared and evaluated under inverted high-magnification microscopy.',
          },
          {
            step: 'Step 2: Single Sperm Immobilization',
            detail:
              'An individual morphologically normal sperm is captured with a micro-injection needle.',
          },
          {
            step: 'Step 3: Micro-Injection',
            detail:
              'The sperm is injected directly through the zona pellucida into the egg cytoplasm.',
          },
          {
            step: 'Step 4: Culture & Transfer',
            detail:
              'Fertilized oocytes are cultured to the blastocyst stage before scheduled transfer.',
          },
        ],
      },
      {
        name: 'Egg Freezing & Fertility Preservation',
        slug: 'egg-freezing-preservation',
        shortDescription:
          'Preserve your reproductive potential for the future with ultra-rapid flash-freezing vitrification.',
        description:
          'Oocyte cryopreservation (egg freezing) allows women to preserve their reproductive options at their peak biological age. Using state-of-the-art vitrification technology, eggs are flash-frozen to avoid ice crystallization, ensuring survival rates above 90% upon thawing when you are ready to build your family.',
        status: 'active',
        iconType: 'freezing',
        keyBenefits: [
          'Preserves egg quality at your current biological age',
          'Vitrification survival rates exceeding 90%',
          'Secure 24/7 temperature-monitored cryogenic nitrogen tanks',
          'Complete reproductive autonomy on your life timeline',
        ],
        process: [
          {
            step: 'Step 1: Ovarian Reserve Check',
            detail:
              'AMH blood tests and antral follicle scans evaluate your reproductive baseline.',
          },
          {
            step: 'Step 2: Gentle Stimulation',
            detail:
              'Hormone therapy encourages multiple follicles to develop over 10-12 days.',
          },
          {
            step: 'Step 3: Egg Retrieval',
            detail:
              'Quick 15-minute outpatient procedure under mild conscious sedation.',
          },
          {
            step: 'Step 4: Vitrification & Storage',
            detail:
              'Eggs are immediately flash-frozen and safely stored at -196°C in liquid nitrogen.',
          },
        ],
      },
      {
        name: 'Blastocyst Culture & Transfer',
        slug: 'blastocyst-culture',
        shortDescription:
          'Extended Day 5 embryo development enabling natural selection of the strongest embryos for transfer.',
        description:
          'Blastocyst culture extends laboratory embryo incubation to Day 5 or Day 6. This mimics the natural physiological journey through the fallopian tube to the uterus, allowing embryologists to select the highest-potential embryo for transfer, facilitating single-embryo transfer while maintaining peak pregnancy rates.',
        status: 'active',
        iconType: 'culture',
        keyBenefits: [
          'Significantly higher implantation rate per transfer',
          'Enables confident single-embryo transfer (eSET)',
          'Minimizes risks associated with multiple pregnancies',
          'Ideal timing for comprehensive genetic biopsy',
        ],
        process: [
          {
            step: 'Step 1: Continuous Incubation',
            detail:
              'Embryos are monitored in tri-gas incubators using stage-specific culture media.',
          },
          {
            step: 'Step 2: Blastocyst Differentiation',
            detail:
              'Embryos develop into distinct inner cell mass and trophectoderm layers by Day 5.',
          },
          {
            step: 'Step 3: High-Resolution Grading',
            detail:
              'Embryologists score blastocysts using standardized Gardner morphological criteria.',
          },
          {
            step: 'Step 4: Targeted Transfer',
            detail:
              'The selected blastocyst is placed in synchrony with endometrial receptivity.',
          },
        ],
      },
      {
        name: 'Reproductive Laparoscopy & Hysteroscopy',
        slug: 'laparoscopy-hysteroscopy',
        shortDescription:
          'Minimally invasive keyhole surgical diagnosis and correction of anatomical fertility obstacles.',
        description:
          'Diagnostic and operative laparoscopy and hysteroscopy provide high-definition direct visualization of reproductive organs. Our specialized endoscopic surgeons identify and treat uterine fibroids, endometrial polyps, endometriosis, and tubal blockages, restoring healthy pelvic anatomy and boosting natural and assisted fertility.',
        status: 'active',
        iconType: 'surgery',
        keyBenefits: [
          'Minimally invasive keyhole incisions with rapid recovery',
          'Simultaneous diagnosis and definitive corrective treatment',
          'Resolves endometriosis, uterine septa, polyps, and adhesions',
          'Restores pelvic anatomy to improve conception success',
        ],
        process: [
          {
            step: 'Step 1: Diagnostic Assessment',
            detail:
              'Pre-operative imaging and 3D pelvic ultrasound map targeted areas of concern.',
          },
          {
            step: 'Step 2: Endoscopic Procedure',
            detail:
              'High-definition miniature cameras inspect and surgically correct pelvic structures.',
          },
          {
            step: 'Step 3: Day-Care Discharge',
            detail:
              'Fast outpatient recovery with same-day discharge and minimal discomfort.',
          },
          {
            step: 'Step 4: Conception Strategy',
            detail:
              'Personalized post-operative roadmap for natural or assisted conception.',
          },
        ],
      },
    ];

    const existingTreatments = await treatmentsService.findAllAdmin();
    const existingSlugs = new Set(existingTreatments.map((t) => t.slug));

    for (const treatment of defaultTreatments) {
      if (!existingSlugs.has(treatment.slug)) {
        await treatmentsService.create(treatment);
        console.log(`Created treatment: ${treatment.name}`);
      } else {
        console.log(`Treatment already exists: ${treatment.name}`);
      }
    }
  } catch (error) {
    console.error('Failed to seed treatments:', error);
  }

  // 3. Seed Website Contents & Settings
  console.log('Seeding website contents...');
  try {
    await settingsService.upsert({
      general: {
        phone: '+91 9048959386',
        email: 'care@santaan.com',
        hours: 'Monday - Saturday: 8:00 AM - 7:00 PM',
        address:
          'Santaan Fertility & Research Institute, Plot No. 121, District Center, Chandrasekharpur, Bhubaneswar, Odisha 751024',
        logoPath: '/uploads/1776510335348-942227351.png',
        footerDescription:
          'Santaan is an internationally accredited institute of reproductive medicine and research dedicated to evidence-based fertility care, ethical practices, and exceptional success rates.',
        workingHours:
          'Monday - Saturday: 8:00 AM - 7:00 PM | Sunday: 9:00 AM - 1:00 PM',
      },
      about: {
        headline:
          'Pioneering Compassionate Fertility Care with Scientific Excellence',
        body: 'At Santaan, we believe every family dream deserves the highest standard of reproductive science, deep empathy, and individualized attention. Founded by leading reproductive specialists, our institute unites certified cleanroom embryology laboratories, research-backed protocols, and transparent clinical guidance to support you at every milestone of parenthood.',
        heroImage: '/uploads/1777212417158-85379918.png',
        mainImage: '/uploads/1777212427486-523704685.png',
        cardTitle: 'Our Clinical Commitment',
        cardBody:
          'Over 15,000 successful family journeys guided by clinical integrity, advanced genetic science, and transparent care.',
      },
      team: {
        headline: 'World-Class Fertility Specialists & Clinical Embryologists',
        body: 'Our multidisciplinary team brings together decades of specialized clinical experience in reproductive endocrinology, advanced laparoscopy, and high-complexity embryology to provide you with the highest chance of welcoming a healthy baby.',
      },
      homePage: {
        treatmentSection: {
          title: 'Comprehensive Fertility & Reproductive Treatments',
          description:
            'Evidence-based, technologically advanced reproductive solutions customized for your biological profile.',
        },
        aboutSection: {
          heading: 'Why Thousands of Couples Trust Santaan',
          description:
            'Combining global benchmarks, advanced embryology, and empathetic patient care to achieve exceptional pregnancy success.',
        },
        teamSection: {
          heading: 'Meet Our Medical Leadership',
          description:
            'Guided by internationally published fertility consultants, clinical embryologists, and compassionate care coordinators.',
        },
        questionsSection: {
          heading: 'Frequently Asked Questions',
          description:
            'Clear, transparent answers to empower your choices throughout your fertility journey.',
        },
      },
      heroSlides: [
        {
          id: 'slide-1',
          image: '/uploads/1776510343009-538166881.png',
          title: 'Your Dream of Parenthood Begins with Us',
          subtitle: 'Advanced Science, Gentle Care',
          description:
            'Empowering thousands of couples across the world towards the joy of a healthy baby with personalized fertility protocols.',
          buttonText: 'Explore Treatments',
          buttonLink: '/treatments',
        },
        {
          id: 'slide-2',
          image: '/uploads/1776510349410-426019798.png',
          title: 'State-of-the-Art Embryology & Cleanroom Labs',
          subtitle: 'Industry-Leading Success Rates',
          description:
            'Class-10,000 cleanroom laboratories, time-lapse embryo imaging, and pre-implantation genetics for optimal outcomes.',
          buttonText: 'Book a Consultation',
          buttonLink: '/contact',
        },
        {
          id: 'slide-3',
          image: '/uploads/1777212417158-85379918.png',
          title: 'Transparent, Ethical Fertility Guidance',
          subtitle: 'Every Step Together',
          description:
            'Clear treatment roadmaps, honest pricing with zero hidden costs, and devoted emotional support throughout your care.',
          buttonText: 'About Our Center',
          buttonLink: '/about',
        },
      ],
      experts: [
        {
          id: 'exp-1',
          name: 'Dr. Satish Prasad Rath',
          title: 'Founder & Chief Healthcare Innovator',
          image: '/uploads/1777212427486-523704685.png',
          description:
            'Physician-scientist with over 20 years of global experience in healthcare innovation and reproductive technologies.',
        },
        {
          id: 'exp-2',
          name: 'Dr. Deepika Kalo',
          title: 'Senior Consultant - Reproductive Medicine & IVF',
          image: '/uploads/1776510335348-942227351.png',
          description:
            'Specialist in recurrent implantation failure, individualized stimulation protocols, and complex fertility cases.',
        },
        {
          id: 'exp-3',
          name: 'Dr. Raghab Sahu',
          title: 'Director of Clinical Embryology & Cryobanking',
          image: '/uploads/1776510343009-538166881.png',
          description:
            'Master embryologist with deep expertise in ICSI, blastocyst biopsy, and advanced vitrification systems.',
        },
        {
          id: 'exp-4',
          name: 'Dr. Ananya Mohapatra',
          title: 'Consultant Gynecologist & Laparoscopic Surgeon',
          image: '/uploads/1776510349410-426019798.png',
          description:
            'Expert in fertility-enhancing minimally invasive endoscopy, endometriosis excision, and uterine septum repair.',
        },
      ],
    });
    console.log('Website contents seeded successfully.');
  } catch (error) {
    console.error('Failed to seed website contents:', error);
  }

  // 4. Seed Sample Enquiries
  console.log('Seeding sample enquiries...');
  try {
    const existingEnquiries = await enquiryService.findAll({ limit: 1 });
    if (existingEnquiries.total === 0) {
      await enquiryService.create({
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        mobileNumber: '+91 9876543210',
        type: 'IVF Consultation',
        message:
          'We have been trying to conceive for 3 years. We would like to schedule an initial consultation to explore IVF options.',
      });
      await enquiryService.create({
        name: 'Rajesh & Meera Verma',
        email: 'meera.verma@example.com',
        mobileNumber: '+91 9812345678',
        type: 'Fertility Assessment',
        message:
          'Interested in comprehensive fertility testing and follicular monitoring for both partners.',
      });
      console.log('Sample enquiries seeded successfully.');
    } else {
      console.log('Enquiries already present in database.');
    }
  } catch (error) {
    console.error('Failed to seed sample enquiries:', error);
  }

  // 5. Seed Sample Contact Messages
  console.log('Seeding sample contact messages...');
  try {
    const existingContacts = await contactService.findAll({ limit: 1 });
    if (existingContacts.total === 0) {
      await contactService.create({
        name: 'Sunita Patel',
        email: 'sunita.patel@example.com',
        subject: 'Second Opinion on Fertility Protocol',
        message:
          'Hello Santaan team, I have previous cycle reports and would like to consult your senior fertility specialist for a second opinion.',
      });
      await contactService.create({
        name: 'Amitabh Sen',
        email: 'amitabh.sen@example.com',
        subject: 'Inquiry regarding Egg Freezing and Storage',
        message:
          'Could you please share details and pricing schedules regarding your egg preservation and cryogenic storage facilities?',
      });
      console.log('Sample contact messages seeded successfully.');
    } else {
      console.log('Contact messages already present in database.');
    }
  } catch (error) {
    console.error('Failed to seed sample contact messages:', error);
  }

  await app.close();
  console.log('Seeding completed successfully.');
}

bootstrap().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
