/**
 * ICCT HUB — Database Seeder
 * 
 * Seeds the MongoDB database with initial data for all models.
 * 
 * Usage:
 *   node seed.js          — Seeds the database
 *   node seed.js --clear  — Clears all data then seeds
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Event = require('./models/Event');
const FAQ = require('./models/FAQ');
const LostItem = require('./models/LostItem');
const FoundItem = require('./models/FoundItem');
const Message = require('./models/Message');

// ---------- Seed Data ----------

const usersData = [
    {
        name: 'Admin ICCT',
        studentId: 'ADMIN-001',
        email: 'admin@iccthub.edu.ph',
        password: 'admin123',
        role: 'admin',
    },
    {
        name: 'Nacionales, Sairon Akir',
        studentId: '2024-00101',
        email: 'sairon.nacionales@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'BS in Information Technology',
        yearLevel: '3rd Year',
        section: 'A',
    },
    {
        name: 'Balindan, James Willy',
        studentId: '2024-00102',
        email: 'james.balindan@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'BS in Information Technology',
        yearLevel: '3rd Year',
        section: 'A',
    },
    {
        name: 'Baluyot, Rafael',
        studentId: '2024-00103',
        email: 'rafael.baluyot@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'BS in Computer Science',
        yearLevel: '2nd Year',
        section: 'B',
    },
    {
        name: 'Capaque, Alejandra',
        studentId: '2024-00104',
        email: 'alejandra.capaque@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'BS in Business Administration',
        yearLevel: '4th Year',
        section: 'A',
    },
    {
        name: 'Gallo, Ma. Edelyn',
        studentId: '2024-00105',
        email: 'edelyn.gallo@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'BS in Accountancy',
        yearLevel: '2nd Year',
        section: 'A',
    },
    {
        name: 'Ganancios, Leonce',
        studentId: '2024-00106',
        email: 'leonce.ganancios@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'BS in Criminology',
        yearLevel: '4th Year',
        section: 'B',
    },
    {
        name: 'Gonzaga, Avril Jean',
        studentId: '2024-00107',
        email: 'avril.gonzaga@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'BS in Computer Engineering',
        yearLevel: '3rd Year',
        section: 'C',
    },
    {
        name: 'Hizon, Jennyvieve',
        studentId: '2024-00108',
        email: 'jennyvieve.hizon@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'BS in Hotel and Restaurant Management',
        yearLevel: '1st Year',
        section: 'A',
    },
    {
        name: 'Magana, Gio',
        studentId: '2024-00109',
        email: 'gio.magana@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'BS in Information Technology',
        yearLevel: '4th Year',
        section: 'B',
    },
    {
        name: 'Ronatay, John Hazel',
        studentId: '2024-00110',
        email: 'john.ronatay@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'BS in Psychology',
        yearLevel: '1st Year',
        section: 'C',
    },
    {
        name: 'Sambajon, Alexis Andrei',
        studentId: '2024-00111',
        email: 'alexis.sambajon@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'BS in Tourism',
        yearLevel: '2nd Year',
        section: 'A',
    },
    {
        name: 'Sarte, Jessie Luis',
        studentId: '2024-00112',
        email: 'jessie.sarte@iccthub.edu.ph',
        password: 'student123',
        role: 'student',
        course: 'Bachelor of Secondary Education',
        yearLevel: '3rd Year',
        section: 'B',
    },
];

const eventsData = [
    {
        title: 'Enrollment Period Opens',
        content: 'Second Semester 2026 enrollment begins for all students. Please prepare your requirements and visit the Registrar Office during office hours. Bring your previous semester grades and updated ID.',
        targetAudience: 'All',
        targetCourses: [],
        targetYears: [],
        targetSections: [],
        eventDate: new Date('2026-02-15'),
        location: 'Registrar Office',
        status: 'Upcoming',
    },
    {
        title: 'Foundation Day Celebration',
        content: 'Join us for the annual ICCT Foundation Day activities and programs. There will be performances, booths, and competitions. All students are encouraged to participate.',
        targetAudience: 'All',
        targetCourses: [],
        targetYears: [],
        targetSections: [],
        eventDate: new Date('2026-02-20'),
        location: 'Main Campus Grounds',
        status: 'Upcoming',
    },
    {
        title: 'Career Fair 2026',
        content: 'Meet potential employers and explore career opportunities. Companies from various industries will be present for recruitment. Bring copies of your resume.',
        targetAudience: 'Specific',
        targetCourses: [],
        targetYears: ['4th Year'],
        targetSections: [],
        eventDate: new Date('2026-02-28'),
        location: 'Student Activity Center',
        status: 'Upcoming',
    },
    {
        title: 'IT Department Seminar',
        content: 'A seminar on emerging technologies including AI, Cloud Computing, and Cybersecurity. Guest speakers from the tech industry will share insights and career advice.',
        targetAudience: 'Specific',
        targetCourses: ['BS in Information Technology', 'BS in Computer Science', 'BS in Computer Engineering'],
        targetYears: ['3rd Year', '4th Year'],
        targetSections: [],
        eventDate: new Date('2026-03-05'),
        location: 'Audio Visual Room',
        status: 'Upcoming',
    },
    {
        title: 'Intramurals 2026',
        content: 'Annual intramural sports competition. Events include basketball, volleyball, badminton, and chess. Sign up through your section representative.',
        targetAudience: 'All',
        targetCourses: [],
        targetYears: [],
        targetSections: [],
        eventDate: new Date('2026-03-10'),
        location: 'ICCT Gymnasium',
        status: 'Upcoming',
    },
    {
        title: 'BSIT Thesis Defense Schedule',
        content: 'Thesis defense for BS in Information Technology students. Please check your designated schedule and prepare your presentations.',
        targetAudience: 'Specific',
        targetCourses: ['BS in Information Technology'],
        targetYears: ['4th Year'],
        targetSections: ['A', 'B', 'C'],
        eventDate: new Date('2026-03-15'),
        location: 'Room 301-303',
        status: 'Upcoming',
    },
    {
        title: 'Criminology Board Exam Review',
        content: 'Special review sessions for upcoming board examinees. Attendance is mandatory for all graduating Criminology students.',
        targetAudience: 'Specific',
        targetCourses: ['BS in Criminology'],
        targetYears: ['4th Year'],
        targetSections: [],
        eventDate: new Date('2026-03-20'),
        location: 'Lecture Hall A',
        status: 'Upcoming',
    },
    {
        title: 'Freshmen Orientation',
        content: 'Welcome orientation for all incoming freshmen. Learn about campus facilities, rules, and student services.',
        targetAudience: 'Specific',
        targetCourses: [],
        targetYears: ['1st Year'],
        targetSections: [],
        eventDate: new Date('2026-02-10'),
        location: 'Main Auditorium',
        status: 'Ongoing',
    },
];

const faqsData = [
    {
        question: 'How do I reset my password?',
        answer: 'Go to the login page and click "Forgot password?" to receive a password reset link via your registered email address.',
        order: 1,
    },
    {
        question: 'How can I report a lost item?',
        answer: 'Navigate to the Lost and Found section from the sidebar, click the "+" button, and fill in the details about your lost item including description, date, and location.',
        order: 2,
    },
    {
        question: 'How do I contact a teacher through the portal?',
        answer: 'Use the Inbox feature to compose a new message. You can search for faculty members by name and send them a direct message.',
        order: 3,
    },
    {
        question: 'Where can I view upcoming school events?',
        answer: 'Check the Events section on your dashboard or the landing page. Events are sorted by date with details about location and time.',
        order: 4,
    },
    {
        question: 'How do I update my profile information?',
        answer: 'Click on your profile icon in the top bar, then select "Settings" to update your name, profile picture, and other account details.',
        order: 5,
    },
    {
        question: 'Who do I contact for enrollment concerns?',
        answer: 'For enrollment-related questions, please visit the Registrar Office at the Antipolo Campus or send a message to the Admin through the portal Inbox.',
        order: 6,
    },
];

const lostItemsData = [
    {
        description: 'Black Samsung Galaxy A54 with a blue case. Last seen near the canteen area during lunch break.',
        dateLost: new Date('2026-02-05'),
        locationLost: 'Canteen Area',
        category: 'Electronics',
        ownerName: 'Nacionales, Sairon Akir',
        ownerContact: 'sairon.nacionales@iccthub.edu.ph',
        status: 'Lost',
        images: ['Assets/Image1.png'],
    },
    {
        description: 'ICCT Student ID Card for Student ID 2024-00104. May have been dropped near the parking area.',
        dateLost: new Date('2026-02-08'),
        locationLost: 'Parking Area',
        category: 'ID',
        ownerName: 'Capaque, Alejandra',
        ownerContact: 'alejandra.capaque@iccthub.edu.ph',
        status: 'Lost',
        images: ['Assets/Image2.png'],
    },
    {
        description: 'Silver wristwatch with leather strap. Left in the restroom on the 2nd floor of the main building.',
        dateLost: new Date('2026-02-03'),
        locationLost: '2nd Floor Restroom, Main Building',
        category: 'Accessories',
        ownerName: 'Baluyot, Rafael',
        ownerContact: 'rafael.baluyot@iccthub.edu.ph',
        status: 'Found',
        images: ['Assets/Image3.png'],
    },
    {
        description: 'Programming Logic and Design textbook (blue cover, 5th edition). Left in Room 205 after afternoon class.',
        dateLost: new Date('2026-02-09'),
        locationLost: 'Room 205',
        category: 'Books',
        ownerName: 'Balindan, James Willy',
        ownerContact: 'james.balindan@iccthub.edu.ph',
        status: 'Lost',
        images: ['Assets/Image1.png', 'Assets/Image2.png'],
    },
    {
        description: 'Black Jansport backpack with red zipper pulls. Contains notebooks and calculator.',
        dateLost: new Date('2026-02-10'),
        locationLost: 'Library 2nd Floor',
        category: 'Bags',
        ownerName: 'Gallo, Ma. Edelyn',
        ownerContact: 'edelyn.gallo@iccthub.edu.ph',
        status: 'Lost',
        images: ['Assets/Image2.png'],
    },
    {
        description: 'Set of keys with Toyota car key and 3 house keys on a black lanyard.',
        dateLost: new Date('2026-02-07'),
        locationLost: 'Student Lounge',
        category: 'Keys',
        ownerName: 'Ganancios, Leonce',
        ownerContact: 'leonce.ganancios@iccthub.edu.ph',
        status: 'Lost',
        images: ['Assets/Image3.png'],
    },
    {
        description: 'Brown leather wallet with initials "RB" embossed. Contains IDs and some cash.',
        dateLost: new Date('2026-02-06'),
        locationLost: 'Cafeteria',
        category: 'Wallets',
        ownerName: 'Gonzaga, Avril Jean',
        ownerContact: 'avril.gonzaga@iccthub.edu.ph',
        status: 'Lost',
        images: ['Assets/Image1.png'],
    },
    {
        description: 'Badminton racket (Yonex brand, neon green) in a black carrying case.',
        dateLost: new Date('2026-02-04'),
        locationLost: 'Gymnasium',
        category: 'Sports Equipment',
        ownerName: 'Hizon, Jennyvieve',
        ownerContact: 'jennyvieve.hizon@iccthub.edu.ph',
        status: 'Lost',
        images: ['Assets/Image2.png', 'Assets/Image3.png'],
    },
    {
        description: 'Medical certificate and enrollment documents in a clear folder.',
        dateLost: new Date('2026-02-11'),
        locationLost: 'Registrar Office Waiting Area',
        category: 'Documents',
        ownerName: 'Magana, Gio',
        ownerContact: 'gio.magana@iccthub.edu.ph',
        status: 'Lost',
        images: ['Assets/Image3.png'],
    },
    {
        description: 'White Nike Air Force 1 sneakers, size 9. Left in the gym locker room.',
        dateLost: new Date('2026-02-02'),
        locationLost: 'Gym Locker Room',
        category: 'Clothing',
        ownerName: 'Ronatay, John Hazel',
        ownerContact: 'john.ronatay@iccthub.edu.ph',
        status: 'Found',
        images: ['Assets/Image1.png', 'Assets/Image2.png', 'Assets/Image3.png'],
    },
];

const foundItemsData = [
    {
        description: 'Found a student ID card near the school gate. Name on the ID is partially visible. Please claim at the guard house.',
        dateFound: new Date('2026-02-07'),
        locationFound: 'School Gate',
        category: 'ID',
        finderName: 'Sambajon, Alexis Andrei',
        finderContact: 'alexis.sambajon@iccthub.edu.ph',
        status: 'Found',
        images: ['Assets/Image1.png'],
    },
    {
        description: 'Blue umbrella left in Room 301 after the afternoon class. It has a wooden handle.',
        dateFound: new Date('2026-02-09'),
        locationFound: 'Room 301',
        category: 'Accessories',
        finderName: 'Sarte, Jessie Luis',
        finderContact: 'jessie.sarte@iccthub.edu.ph',
        status: 'Found',
        images: ['Assets/Image2.png'],
    },
    {
        description: 'USB flash drive (16GB SanDisk) found at the Computer Lab 2 workstation. Contains school files.',
        dateFound: new Date('2026-02-06'),
        locationFound: 'Computer Lab 2',
        category: 'Electronics',
        finderName: 'Nacionales, Sairon Akir',
        finderContact: 'sairon.nacionales@iccthub.edu.ph',
        status: 'Returned',
        images: ['Assets/Image3.png'],
    },
    {
        description: 'Calculus textbook found on a bench near the main entrance. Has name "M. Santos" written inside.',
        dateFound: new Date('2026-02-10'),
        locationFound: 'Main Entrance Bench',
        category: 'Books',
        finderName: 'Balindan, James Willy',
        finderContact: 'james.balindan@iccthub.edu.ph',
        status: 'Found',
        images: ['Assets/Image1.png', 'Assets/Image3.png'],
    },
    {
        description: 'Gray Herschel backpack found in the cafeteria. Contains some notebooks.',
        dateFound: new Date('2026-02-08'),
        locationFound: 'Cafeteria',
        category: 'Bags',
        finderName: 'Baluyot, Rafael',
        finderContact: 'rafael.baluyot@iccthub.edu.ph',
        status: 'Found',
        images: ['Assets/Image2.png'],
    },
    {
        description: 'Set of keys with Honda key and keychain found near the parking lot.',
        dateFound: new Date('2026-02-05'),
        locationFound: 'Parking Lot B',
        category: 'Keys',
        finderName: 'Capaque, Alejandra',
        finderContact: 'alejandra.capaque@iccthub.edu.ph',
        status: 'Returned',
        images: ['Assets/Image1.png'],
    },
    {
        description: 'Black leather wallet found in Room 102. No ID inside, has some cash.',
        dateFound: new Date('2026-02-11'),
        locationFound: 'Room 102',
        category: 'Wallets',
        finderName: 'Gallo, Ma. Edelyn',
        finderContact: 'edelyn.gallo@iccthub.edu.ph',
        status: 'Found',
        images: ['Assets/Image3.png', 'Assets/Image2.png'],
    },
    {
        description: 'Basketball found at the outdoor court. Wilson brand, slightly worn.',
        dateFound: new Date('2026-02-04'),
        locationFound: 'Outdoor Basketball Court',
        category: 'Sports Equipment',
        finderName: 'Ganancios, Leonce',
        finderContact: 'leonce.ganancios@iccthub.edu.ph',
        status: 'Found',
        images: ['Assets/Image1.png'],
    },
    {
        description: 'Birth certificate copy and TOR in a manila envelope. Found at the registrar waiting area.',
        dateFound: new Date('2026-02-09'),
        locationFound: 'Registrar Office',
        category: 'Documents',
        finderName: 'Gonzaga, Avril Jean',
        finderContact: 'avril.gonzaga@iccthub.edu.ph',
        status: 'Found',
        images: ['Assets/Image2.png'],
    },
    {
        description: 'ICCT PE uniform (medium size) left in the gym. Has "Hizon" written on tag.',
        dateFound: new Date('2026-02-03'),
        locationFound: 'Gymnasium',
        category: 'Clothing',
        finderName: 'Magana, Gio',
        finderContact: 'gio.magana@iccthub.edu.ph',
        status: 'Returned',
        images: ['Assets/Image3.png', 'Assets/Image1.png', 'Assets/Image2.png'],
    },
];

// Messages will reference created user IDs
const messagesTemplate = [
    {
        fromIndex: 2, // James Willy
        toIndex: 1,   // Sairon
        subject: 'About your lost phone',
        body: 'Hi Sairon, I saw your post about the lost Samsung phone. I think I may have seen something similar near the canteen yesterday. Could you describe the case in more detail? I want to make sure before I check with the guard.',
        read: false,
    },
    {
        fromIndex: 0, // Admin
        toIndex: 1,   // Sairon
        subject: 'Welcome to ICCT HUB',
        body: 'Welcome to ICCT HUB, Sairon! We are glad to have you on the platform. Feel free to explore all the features available to you — check announcements, report lost items, and stay updated with campus events. If you have any questions, do not hesitate to reach out.',
        labels: ['Important'],
        read: true,
    },
    {
        fromIndex: 3, // Rafael
        toIndex: 2,   // James Willy
        subject: 'Group project meeting',
        body: 'Hi James, just a reminder about our group project meeting tomorrow at 2PM in the library. Please bring your laptop and the research materials we discussed. See you there!',
        labels: ['Academic'],
        read: false,
    },
    {
        fromIndex: 0, // Admin
        toIndex: 4,   // Alejandra
        subject: 'ID Card Found',
        body: 'Hi Alejandra, we received a report that a student ID matching your details was found near the school gate. Please visit the guard house to verify and claim it. Bring a valid secondary ID for verification.',
        labels: ['Important'],
        read: false,
    },
    {
        fromIndex: 1, // Sairon
        toIndex: 3,   // Rafael
        subject: 'Found your watch!',
        body: 'Hi Rafael! I think I found your silver wristwatch. It was at the lost and found office when I went there to report my own lost item. You should check if it\'s yours!',
        read: true,
    },
    {
        fromIndex: 4, // Alejandra
        toIndex: 0,   // Admin
        subject: 'Question about enrollment',
        body: 'Good day Admin, I have a question regarding the enrollment process for the second semester. Do I need to submit new documents if I already submitted everything last semester? Thank you.',
        labels: ['Academic'],
        read: true,
    },
    {
        fromIndex: 0, // Admin
        toIndex: 2,   // James Willy
        subject: 'Welcome to ICCT HUB',
        body: 'Welcome to ICCT HUB, James! We are glad to have you on the platform. Feel free to explore all the features available to you — check announcements, report lost items, and stay updated with campus events.',
        labels: ['Important'],
        read: true,
    },
    {
        fromIndex: 5, // Edelyn
        toIndex: 6,   // Leonce
        subject: 'Basketball game this weekend',
        body: 'Hey Leonce! Are you joining the basketball game this weekend? We need players for our team. Let me know if you can make it!',
        labels: ['Personal'],
        read: false,
    },
    {
        fromIndex: 7, // Avril Jean
        toIndex: 8,   // Jennyvieve
        subject: 'Study group for finals',
        body: 'Hi Jennyvieve! Want to join our study group for the upcoming finals? We are meeting every Saturday at the library. Let me know!',
        labels: ['Academic'],
        read: false,
    },
    {
        fromIndex: 9, // Gio
        toIndex: 10,  // John Hazel
        subject: 'Thanks for finding my documents!',
        body: 'Hi John Hazel, thank you so much for finding my enrollment documents! I really appreciate your help. See you around campus!',
        labels: ['Personal'],
        read: true,
    },
];

// ---------- Seeder Functions ----------

async function clearDB() {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Event.deleteMany({});
    await FAQ.deleteMany({});
    await LostItem.deleteMany({});
    await FoundItem.deleteMany({});
    await Message.deleteMany({});
    console.log('✅ All collections cleared.');
}

async function seedUsers() {
    console.log('👤 Seeding users...');
    const users = await User.create(usersData);
    console.log(`   ✅ ${users.length} users created.`);
    return users;
}

async function seedEvents(adminUser) {
    console.log('📅 Seeding events...');
    const events = eventsData.map(e => ({ ...e, author: adminUser._id }));
    const created = await Event.create(events);
    console.log(`   ✅ ${created.length} events created.`);
    return created;
}

async function seedFAQs() {
    console.log('❓ Seeding FAQs...');
    const created = await FAQ.create(faqsData);
    console.log(`   ✅ ${created.length} FAQs created.`);
    return created;
}

async function seedLostItems(users) {
    console.log('🔍 Seeding lost items...');
    // Assign postedBy to matching student users
    const lostItems = lostItemsData.map((item, i) => ({
        ...item,
        postedBy: users[1 + (i % (users.length - 1))]._id, // skip admin
    }));
    const created = await LostItem.create(lostItems);
    console.log(`   ✅ ${created.length} lost items created.`);
    return created;
}

async function seedFoundItems(users) {
    console.log('📦 Seeding found items...');
    const foundItems = foundItemsData.map((item, i) => ({
        ...item,
        postedBy: users[2 + (i % (users.length - 2))]._id, // skip admin and first student
    }));
    const created = await FoundItem.create(foundItems);
    console.log(`   ✅ ${created.length} found items created.`);
    return created;
}

async function seedMessages(users) {
    console.log('💬 Seeding messages...');
    const messages = messagesTemplate.map(msg => ({
        from: users[msg.fromIndex]._id,
        to: users[msg.toIndex]._id,
        subject: msg.subject,
        body: msg.body,
        labels: msg.labels || [],
        read: msg.read,
    }));
    const created = await Message.create(messages);
    console.log(`   ✅ ${created.length} messages created.`);
    return created;
}

// ---------- Main ----------

async function seed() {
    try {
        console.log('\n🌱 ICCT HUB Database Seeder\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📡 Connected to MongoDB.\n');

        const shouldClear = process.argv.includes('--clear');
        if (shouldClear) {
            await clearDB();
            console.log('');
        }

        // Seed in order (users first, then items that reference users)
        const users = await seedUsers();
        const adminUser = users.find(u => u.role === 'admin');

        await seedEvents(adminUser);
        await seedFAQs();
        await seedLostItems(users);
        await seedFoundItems(users);
        await seedMessages(users);

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('📋 Summary:');
        console.log(`   Users:       ${usersData.length}`);
        console.log(`   Events:      ${eventsData.length}`);
        console.log(`   FAQs:        ${faqsData.length}`);
        console.log(`   Lost Items:  ${lostItemsData.length}`);
        console.log(`   Found Items: ${foundItemsData.length}`);
        console.log(`   Messages:    ${messagesTemplate.length}`);
        console.log('');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('📡 MongoDB connection closed.');
        process.exit(0);
    }
}

seed();
