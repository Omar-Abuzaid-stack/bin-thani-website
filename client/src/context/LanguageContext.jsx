import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navbar
    home: 'Home',
    properties: 'Properties',
    services: 'Services',
    about: 'About',
    contact: 'Contact',
    
    // Home
    featuredProperties: 'Featured Properties',
    exploreLuxury: 'Explore our handpicked luxury properties across UAE.',
    viewAllProperties: 'View All Properties',
    readyToFind: 'Ready to Find Your Dream Home?',
    browseProperties: 'Browse Properties',
    
    // Properties
    findDreamProperty: 'Find Your Dream Property',
    browseExclusive: "Browse our exclusive collection of luxury properties across UAE",
    searchPlaceholder: 'Search by location, property name...',
    allTypes: 'All Types',
    allAreas: 'All Areas',
    anyBedrooms: 'Any',
    minPrice: 'Min',
    maxPrice: 'Max',
    allStatus: 'All Status',
    available: 'Available',
    offPlan: 'Off-Plan',
    sold: 'Sold',
    clearAll: 'Clear All',
    propertiesFound: 'Properties Found',
    noPropertiesFound: 'No properties found',
    tryAdjustingFilters: 'Try adjusting your filters to see more results',
    beds: 'Beds',
    baths: 'Baths',
    
    // Property Detail
    backToProperties: 'Back to Properties',
    description: 'Description',
    amenities: 'Amenities',
    location: 'Location',
    mortgageCalculator: 'Mortgage Calculator',
    propertyPrice: 'Property Price (AED)',
    downPayment: 'Down Payment (%)',
    interestRate: 'Interest Rate (%)',
    loanTerm: 'Loan Term (Years)',
    monthlyPayment: 'Estimated Monthly Payment',
    loanAmount: 'Loan Amount',
    interestedProperty: 'Interested in this property?',
    getInTouch: 'Get in touch with our team',
    requestDetails: 'Request Details',
    yourName: 'Your Name',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    yourMessage: 'Your Message',
    sendEnquiry: 'Send Enquiry',
    developer: 'Developer',
    contactUs: 'Contact Us',
    
    // Chatbot
    welcomeMessage: 'Welcome to Bin Thani Real Estate! How can I help you today? 🏠',
    typeMessage: 'Type your message...',
    poweredBy: 'Powered by Bin Thani AI',
    
    // Footer
    luxuryRealEstate: 'Luxury Real Estate Experts in Sharjah & UAE. Providing premium property solutions for over 15 years.',
    quickLinks: 'Quick Links',
    newsletter: 'Newsletter',
    yourEmail: 'Your Email',
    join: 'Join',
    copyright: 'All rights reserved.',
    
    // Announcement
    announcement: '🏆 Bin Thani Real Estate — Sharjah\'s Most Trusted Agency',
    
    // Developers
    ourDevelopers: 'Our Trusted Developers',
    partneringBest: 'Partnering with the best in the industry',
  },
  ar: {
    // Navbar
    home: 'الرئيسية',
    properties: 'العقارات',
    services: 'الخدمات',
    about: 'من نحن',
    contact: 'اتصل بنا',
    
    // Home
    featuredProperties: 'العقارات المميزة',
    exploreLuxury: 'استكشف عقاراتنا الفاخرة المختارة في جميع أنحاء الإمارات.',
    viewAllProperties: 'عرض جميع العقارات',
    readyToFind: 'على استعداد للعثور على منزلك dream؟',
    browseProperties: 'تصفح العقارات',
    
    // Properties
    findDreamProperty: 'اعثر على عقارك dream',
    browseExclusive: 'تصفح مجموعتنا الحصرية من العقارات الفاخرة في جميع أنحاء الإمارات',
    searchPlaceholder: 'ابحث بالموقع أو اسم العقار...',
    allTypes: 'جميع الأنواع',
    allAreas: 'جميع المناطق',
    anyBedrooms: 'أي',
    minPrice: 'الحد الأدنى',
    maxPrice: 'الحد الأقصى',
    allStatus: 'جميع الحالات',
    available: 'متاح',
    offPlan: 'على الخريطة',
    sold: 'مباع',
    clearAll: 'مسح الكل',
    propertiesFound: 'عقار تم العثور عليه',
    noPropertiesFound: 'لم يتم العثور على عقارات',
    tryAdjustingFilters: 'حاول تعديل عوامل التصفية لرؤية المزيد من النتائج',
    beds: 'غرف نوم',
    baths: 'حمامات',
    
    // Property Detail
    backToProperties: 'العودة إلى العقارات',
    description: 'الوصف',
    amenities: 'المرافق',
    location: 'الموقع',
    mortgageCalculator: 'حاسبة الرهن العقاري',
    propertyPrice: 'سعر العقار (د.إ)',
    downPayment: 'الدفعة الأولى (%)',
    interestRate: 'معدل الفائدة (%)',
    loanTerm: 'مدة القرض (سنوات)',
    monthlyPayment: 'الدفعة الشهرية المقدرة',
    loanAmount: 'مبلغ القرض',
    interestedProperty: 'هل أنت مهتم بهذا العقار؟',
    getInTouch: 'تواصل مع فريقنا',
    requestDetails: 'طلب التفاصيل',
    yourName: 'اسمك',
    phoneNumber: 'رقم الهاتف',
    emailAddress: 'البريد الإلكتروني',
    yourMessage: 'رسالتك',
    sendEnquiry: 'إرسال الاستفسار',
    developer: 'المطور',
    contactUs: 'اتصل بنا',
    
    // Chatbot
    welcomeMessage: 'مرحباً بك في بن ثاني للعقارات! كيف يمكنني مساعدتك اليوم؟ 🏠',
    typeMessage: 'اكتب رسالتك...',
    poweredBy: 'مدعوم من بن ثاني AI',
    
    // Footer
    luxuryRealEstate: 'خبراء العقارات الفاخرة في الشارقة والإمارات. نقدم حلول عقارية متميزة منذ أكثر من 15 عاماً.',
    quickLinks: 'روابط سريعة',
    newsletter: 'النشرة الإخبارية',
    yourEmail: 'بريدك الإلكتروني',
    join: 'انضم',
    copyright: 'جميع الحقوق محفوظة.',
    
    // Announcement
    announcement: '🏆 بن ثاني للعقارات — وكالة الشارقة الأكثر موثوقية',
    
    // Developers
    ourDevelopers: 'مطورون موثوقون',
    partneringBest: 'نتعاون مع الأفضل في الصناعة',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('binthani-lang');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('binthani-lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => translations[language][key] || key;
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'ar' : 'en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
