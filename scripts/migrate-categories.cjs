const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs, writeBatch } = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, 'ai-studio-naarirshopno-e3a139e5-9e7f-49ff-9772-69077a26700b');

const ALL_16_CATEGORIES = [
  {
    id: 'রেডিমেড থ্রিপিস.টু পিস',
    title: 'রেডিমেড থ্রিপিস.টু পিস',
    subtitle: '💥আধুনিক ডিজাইনে আপনার সৌন্দর্যের প্রকাশ',
    image: 'https://i.postimg.cc/cCV8zJp0/screenshot-1791019217004.png',
  },
  {
    id: 'আনস্টিজ থ্রিপিস',
    title: 'আনস্টিজ থ্রিপিস',
    subtitle: '🌟নিজের পছন্দে সাজুন, নিজের মতো করে',
    image: 'https://i.postimg.cc/nzMsmYt6/file-0000000003e482118159592126429a07.png',
  },
  {
    id: 'গাউন & কুর্তি',
    title: 'গাউন & কুর্তি',
    subtitle: '🌸 প্রতিটি সাজে ফুটে উঠুক আপনার নিজস্ব স্টাইল',
    image: 'https://i.postimg.cc/Prp7vFKw/young-beautiful-stylish-woman-wedding-dress.jpg',
  },
  {
    id: 'লেহেঙ্গা & পার্টি',
    title: 'লেহেঙ্গা & পার্টি',
    subtitle: '💖 গর্জিয়াস লুকে ফুটে উঠুক আপনার সৌন্দর্য',
    image: 'https://i.postimg.cc/ZKq6dK2f/Glamorous-Maroon-Lehenga-Portrait.png',
  },
  {
    id: 'ওয়েস্টার্ন ড্রেস',
    title: 'ওয়েস্টার্ন ড্রেস',
    subtitle: '👗 স্মার্ট লুক, স্টাইলিশ উপস্থিতি',
    image: 'https://i.postimg.cc/TYWYSzD3/fashion-portrait-young-hippie-woman-model-summer-sunny-day-bright-colorful-hipster-clothes-hat.jpg',
  },
  {
    id: 'টিশার্ট & স্কার্ট',
    title: 'টিশার্ট & স্কার্ট',
    subtitle: '🌸 ক্যাজুয়াল লুকে স্টাইলিশ ফ্যাশনের ছোঁয়া',
    image: 'https://i.postimg.cc/QMPj0SxR/Featured-Image-of-summer-outfit-Ideas-for-women-576x1024.jpg',
  },
  {
    id: 'ইনার & নাইটি',
    title: 'ইনার & নাইটি',
    subtitle: '💖 আরাম ও স্বাচ্ছন্দ্যে প্রতিদিনের সঙ্গী',
    image: 'https://i.postimg.cc/SN5VQMRN/371ef556ad81f7e6d1ca19e51f3f5401e044aff3-original.jpg',
  },
  {
    id: 'শাড়ি',
    title: 'শাড়ি',
    subtitle: '🌷 বাঙালিয়ানার ছোঁয়ায় ফুটে উঠুক আপনার সৌন্দর্য',
    image: 'https://i.postimg.cc/NFv9PQjs/indian-ethnic-wear-saree-photoshoot-traditional-saree-catalogue-photoshoot-17-orig.jpg',
  },
  {
    id: 'হ্যান্ডপ্রিন্ট শাড়ি',
    title: 'হ্যান্ডপ্রিন্ট শাড়ি',
    subtitle: '🌸 ঐতিহ্যবাহী নকশায় আধুনিকতার মেলবন্ধন',
    image: 'https://i.postimg.cc/brZCLHdJ/Hand-Painted-Red-Organza-Saree2.jpg',
  },
  {
    id: 'ইন্ডিয়ান শাড়ী',
    title: 'ইন্ডিয়ান শাড়ী',
    subtitle: '🌸 ইন্ডিয়ান ডিজাইনে রাজকীয় সাজের ছোঁয়া',
    image: 'https://i.postimg.cc/0j7tL5Gh/ac2592-b-2.webp',
  },
  {
    id: 'তাঁতের শাড়ী',
    title: 'তাঁতের শাড়ী',
    subtitle: '🌷 ঐতিহ্যের বুননে ফুটে উঠুক বাঙালিয়ানার সৌন্দর্য',
    image: 'https://i.postimg.cc/PrRLBbx4/handloom-cotton-tant-saree-in-red-v1-suua102-1.jpg',
  },
  {
    id: 'হিজাব & নিকাব',
    title: 'হিজাব & নিকাব',
    subtitle: '🌸 পর্দার সৌন্দর্যে নিজেকে সাজান রুচিশীলভাব',
    image: 'https://i.postimg.cc/fb0gxvtw/07f735262f8db36b39c1626aa2a00f4c-jpg-720x720q80.jpg',
  },
  {
    id: 'সুন্নাতি ড্রেস',
    title: 'সুন্নাতি ড্রেস',
    subtitle: '🕌 সুন্নাহসম্মত পোশাকে থাকুক পরিমিত সৌন্দর্য',
    image: 'https://i.postimg.cc/43BbH7wf/modefa-abaya-modest-muslim-woman-abaya-with-niqab-khimar-ecru-1236735249-1800x1800.jpg',
  },
  {
    id: 'Bed.Sheet & Curtain',
    title: 'Bed.Sheet & Curtain',
    subtitle: 'ঘরের আবহে আভিজাত্যের পরশ—আপনার পছন্দের রঙ ও ডিজাইনে।',
    image: 'https://image.made-in-china.com/2f0j00GOaVbwMKhgpQ/Wholesale-Cheap-3D-Digital-Printed-Bedroom-Curtains-Bed-Sheets-Bedding-Set-with-Curtain.jpg',
  },
  {
    id: 'লেডিস উইন্টার',
    title: 'লেডিস উইন্টার',
    subtitle: '❄️ শীতের ফ্যাশনে আরামদায়ক ও ট্রেন্ডি পোশাক',
    image: 'https://downloadscdn6.magnific.com/1157/5/4304.jpg?filename=girls-winter.jpg&token=exp=1793975211~hmac=bf324ac8ea8b5b0480553a2e59517ef5&filename=4304.jpg',
  },
  {
    id: 'জুয়েলারি ও ব্যাগ',
    title: 'জুয়েলারি ও ব্যাগ',
    subtitle: '✨ আভিজাত্য ও সৌন্দর্যের অপূর্ব মেলবন্ধন',
    image: 'https://cp14.nevsepic.com.ua/214/21329/1385301985-sandrah-hellberg-for-guess-accessories-ad-campaign-fall-2011-photo-shoot-by-yu-tsai-004.jpg',
  },
];

const CATEGORY_ID_MAP = {
  'Salwar-Kameez': 'রেডিমেড থ্রিপিস.টু পিস',
  'সালোয়ার-কামিজ': 'রেডিমেড থ্রিপিস.টু পিস',
  'cat_1791040993494': 'গাউন & কুর্তি',
  'cat_1791041020279': 'লেহেঙ্গা & পার্টি',
  'cat_1791041045533': 'ওয়েস্টার্ন ড্রেস',
  'cat_1791041069272': 'টিশার্ট & স্কার্ট',
  'cat_1791041103747': 'ইনার & নাইটি',
  'Sharee': 'শাড়ি',
  'saree': 'শাড়ি',
  'cat_1791041224436': 'সুন্নাতি ড্রেস',
  'Bed Sheet & Curtain': 'Bed.Sheet & Curtain',
  'বেডশিট ও পর্দা': 'Bed.Sheet & Curtain',
  'Ladis Winter': 'লেডিস উইন্টার',
  'jewellery_bags': 'জুয়েলারি ও ব্যাগ',
  'three_piece': 'রেডিমেড থ্রিপিস.টু পিস',
  'readymade_three_piece': 'রেডিমেড থ্রিপিস.টু পিস',
  'cat_1791038823348': 'রেডিমেড থ্রিপিস.টু পিস',
  'kurti': 'গাউন & কুর্তি',
  'gown': 'গাউন & কুর্তি',
  'lehenga': 'লেহেঙ্গা & পার্টি',
  'hijab_abaya': 'হিজাব & নিকাব',
};

async function runMigration() {
  console.log('--- 1. Updating settings/general in Firestore ---');
  const settingsDocRef = doc(db, 'settings', 'general');
  const settingsSnap = await getDoc(settingsDocRef);
  const currentSettings = settingsSnap.exists() ? settingsSnap.data() : {};

  // Build categoryImages map
  const categoryImages = { ...(currentSettings.categoryImages || {}) };
  ALL_16_CATEGORIES.forEach(cat => {
    categoryImages[cat.id] = cat.image;
  });

  const updatedSettings = {
    ...currentSettings,
    categories: ALL_16_CATEGORIES,
    categoryImages,
    emailSettings: {
      ...(currentSettings.emailSettings || {}),
      enabled: true,
      provider: 'gmail',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 465,
      smtpUser: 'NaarirShopno@Gmail.com',
      smtpPass: 'ahum uvbi less prtl',
      smtpSecure: true,
      senderEmail: 'NaarirShopno@Gmail.com',
      senderName: 'নারীর স্বপ্ন (Naarir Shopno)',
      supportEmail: 'NaarirShopno@Gmail.com',
      adminNotificationEmail: 'NaarirShopno@Gmail.com',
      bccAdminOnOrder: true,
      orderConfirmationSubject: 'নারীর স্বপ্ন - আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে (#{orderId})',
    },
  };

  const batch = writeBatch(db);
  batch.set(settingsDocRef, updatedSettings, { merge: true });
  console.log('Settings batch queued with 16 categories (id === title) and email settings.');

  console.log('--- 2. Updating products collection in Firestore ---');
  const productsSnap = await getDocs(collection(db, 'products'));
  let updatedProductsCount = 0;

  productsSnap.forEach(docSnap => {
    const prod = docSnap.data();
    let newCategory = prod.category;
    let newCategoryBengali = prod.categoryBengali || prod.category;

    // Check mapping table
    if (CATEGORY_ID_MAP[prod.category]) {
      newCategory = CATEGORY_ID_MAP[prod.category];
      newCategoryBengali = newCategory;
    } else if (CATEGORY_ID_MAP[prod.categoryBengali]) {
      newCategory = CATEGORY_ID_MAP[prod.categoryBengali];
      newCategoryBengali = newCategory;
    } else {
      // Find matching category by title
      const matched = ALL_16_CATEGORIES.find(c => c.title === prod.categoryBengali || c.title === prod.category);
      if (matched) {
        newCategory = matched.id;
        newCategoryBengali = matched.title;
      }
    }

    if (newCategory !== prod.category || newCategoryBengali !== prod.categoryBengali) {
      console.log(`Updating product ${docSnap.id} ("${prod.bengaliName || prod.name}"): [${prod.category}] -> [${newCategory}]`);
      batch.update(doc(db, 'products', docSnap.id), {
        category: newCategory,
        categoryBengali: newCategoryBengali,
      });
      updatedProductsCount++;
    }
  });

  await batch.commit();
  console.log(`--- Migration Complete! ---`);
  console.log(`Settings categories set to 16 categories.`);
  console.log(`Updated ${updatedProductsCount} products.`);
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
