export const BAZAR_CATEGORIES = [
  { en: "Vegetables", bn: "সবজি" },
  { en: "Protein", bn: "প্রোটিন" },
  { en: "Grocery", bn: "মুদি" },
  { en: "Crockery", bn: "ক্রোকারিজ" },
  { en: "Fruit", bn: "ফলসমূহ" },
  { en: "Others", bn: "অন্যান্য" }
];

export const PRELOADED_BAZAR_ITEMS = [
  { name: "Potato", bn: "আলু", category: "Vegetables", unit: "kg" },
  { name: "Onion", bn: "পেঁয়াজ", category: "Vegetables", unit: "kg" },
  { name: "Tomato", bn: "টমেটো", category: "Vegetables", unit: "kg" },
  { name: "Green Chili", bn: "কাঁচা মরিচ", category: "Vegetables", unit: "kg" },
  { name: "Brinjal", bn: "বেগুন", category: "Vegetables", unit: "kg" },
  { name: "Garlic", bn: "রসুন", category: "Vegetables", unit: "kg" },
  { name: "Ginger", bn: "আদা", category: "Vegetables", unit: "kg" },
  { name: "Cucumber", bn: "শশা", category: "Vegetables", unit: "kg" },
  { name: "Pumpkin", bn: "মিষ্টি কুমড়া", category: "Vegetables", unit: "kg" },
  
  { name: "Beef", bn: "গরুর মাংস", category: "Protein", unit: "kg" },
  { name: "Mutton", bn: "খাসির মাংস", category: "Protein", unit: "kg" },
  { name: "Chicken", bn: "মুরগির মাংস", category: "Protein", unit: "kg" },
  { name: "Hilsa", bn: "ইলিশ মাছ", category: "Protein", unit: "piece" },
  { name: "Rohu", bn: "রুই মাছ", category: "Protein", unit: "kg" },
  { name: "Eggs", bn: "ডিম", category: "Protein", unit: "dozen" },
  { name: "Fish (Others)", bn: "মাছ (অন্যান্য)", category: "Protein", unit: "kg" },
  
  { name: "Rice", bn: "চাল", category: "Grocery", unit: "kg" },
  { name: "Oil", bn: "তেল", category: "Grocery", unit: "litre" },
  { name: "Salt", bn: "লবণ", category: "Grocery", unit: "kg" },
  { name: "Sugar", bn: "চিনি", category: "Grocery", unit: "kg" },
  { name: "Lentils (Dal)", bn: "ডাল", category: "Grocery", unit: "kg" },
  { name: "Flour (Atta)", bn: "আটা", category: "Grocery", unit: "kg" },
  { name: "Milk", bn: "দুধ", category: "Grocery", unit: "litre" },
  { name: "Tea", bn: "চা", category: "Grocery", unit: "packet" },
  
  { name: "Plate", bn: "প্লেট", category: "Crockery", unit: "piece" },
  { name: "Glass", bn: "গ্লাস", category: "Crockery", unit: "piece" },
  { name: "Bowl", bn: "বাটি", category: "Crockery", unit: "piece" },
  { name: "Spoon", bn: "চামচ", category: "Crockery", unit: "piece" },
  { name: "Pan", bn: "কড়াই", category: "Crockery", unit: "piece" },

  { name: "Apple", bn: "আপেল", category: "Fruit", unit: "kg" },
  { name: "Banana", bn: "কলা", category: "Fruit", unit: "dozen" },
  { name: "Mango", bn: "আম", category: "Fruit", unit: "kg" },
  { name: "Orange", bn: "কমলা", category: "Fruit", unit: "kg" }
];

export const BILL_CATEGORIES = [
  { en: "House Rent", bn: "বাসা ভাড়া" },
  { en: "Electricity", bn: "বিদ্যুৎ বিল" },
  { en: "Gas", bn: "গ্যাস বিল" },
  { en: "Water", bn: "পানির বিল" },
  { en: "Internet", bn: "ইন্টারনেট বিল" },
  { en: "Direct TV/Dish", bn: "ডিশ বিল" },
  { en: "Service Charge", bn: "সার্ভিস চার্জ" }
];

export const EDUCATION_SUB_CATEGORIES = [
  { en: "Monthly Tuition Fee", bn: "মাসিক বেতন" },
  { en: "Exam Fee", bn: "পরীক্ষার ফি" },
  { en: "Stationery", bn: "স্টেশনারি" },
  { en: "Uniform", bn: "ইউনিফর্ম" },
  { en: "School Transport", bn: "স্কুল পরিবহন" },
  { en: "Tutor Fee", bn: "গৃহশিক্ষকের ফি" },
  { en: "Books", bn: "বইপত্র" }
];

export const INCOME_SOURCES = [
  { en: "Salary", bn: "বেতন" },
  { en: "Bonus", bn: "বোনাস" },
  { en: "Side Income", bn: "বাড়তি আয়" },
  { en: "Gift", bn: "উপহার" },
  { en: "Business", bn: "ব্যবসা" },
  { en: "Others", bn: "অন্যান্য" }
];

export const MONTHS = [
  { en: "January", bn: "জানুয়ারি" },
  { en: "February", bn: "ফেব্রুয়ারি" },
  { en: "March", bn: "মার্চ" },
  { en: "April", bn: "এপ্রিল" },
  { en: "May", bn: "মে" },
  { en: "June", bn: "জুন" },
  { en: "July", bn: "জুলাই" },
  { en: "August", bn: "আগস্ট" },
  { en: "September", bn: "সেপ্টেম্বর" },
  { en: "October", bn: "অক্টোবর" },
  { en: "November", bn: "নভেম্বর" },
  { en: "December", bn: "ডিসেম্বর" }
];

export const UI_STRINGS = {
  dashboard: { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  bazar: { en: "Bazar", bn: "বাজার" },
  bills: { en: "Bills", bn: "বিলসমূহ" },
  school: { en: "School", bn: "শিক্ষা" },
  loans: { en: "Loans", bn: "ঋণ" },
  income: { en: "Income", bn: "আয়" },
  backup: { en: "Backup", bn: "ব্যাকআপ" },
  settings: { en: "Settings", bn: "সেটিংস" },
  totalIncome: { en: "Total Income", bn: "মোট আয়" },
  totalExpense: { en: "Total Expense", bn: "মোট খরচ" },
  balance: { en: "Balance", bn: "অবশিষ্ট" },
  remarks: { en: "Remarks", bn: "মন্তব্য" },
  save: { en: "Save", bn: "সংরক্ষণ করুন" },
  cancel: { en: "Cancel", bn: "বাতিল করুন" },
};
