import { db, categories, subCategories } from "@/db";

// Category and sub-category seed data with lucide-react icons
export const SEED_CATEGORIES = [
  // ============ NEEDS ============
  {
    id: "food_groceries",
    name: "Food & Groceries",
    icon: "ShoppingBasket",
    subCategories: [
      { id: "vegetables", name: "Vegetables & Fruits", icon: "Apple" },
      { id: "groceries", name: "Groceries & Staples", icon: "ShoppingCart" },
      { id: "dairy", name: "Milk & Dairy Products", icon: "Milk" },
      { id: "meat_fish", name: "Meat & Fish", icon: "Fish" },
      { id: "bakery", name: "Bread & Bakery", icon: "Cake" },
    ],
  },
  {
    id: "utilities",
    name: "Utilities & Bills",
    icon: "Receipt",
    subCategories: [
      { id: "electricity", name: "Electricity Bill", icon: "Zap" },
      { id: "water", name: "Water Bill", icon: "Droplet" },
      { id: "gas_cylinder", name: "Gas Cylinder", icon: "Flame" },
      { id: "internet", name: "Internet/Broadband", icon: "Wifi" },
      { id: "dth_cable", name: "DTH/Cable TV", icon: "Tv" },
      { id: "mobile_recharge", name: "Mobile Recharge", icon: "Smartphone" },
      { id: "maintenance", name: "Society Maintenance", icon: "Building2" },
    ],
  },
  {
    id: "housing",
    name: "Housing",
    icon: "Home",
    subCategories: [
      { id: "rent", name: "House Rent", icon: "Home" },
      { id: "emi_home", name: "Home Loan EMI", icon: "Landmark" },
      { id: "property_tax", name: "Property Tax", icon: "FileText" },
      { id: "repairs", name: "Home Repairs", icon: "Wrench" },
    ],
  },
  {
    id: "transportation",
    name: "Transportation",
    icon: "Car",
    subCategories: [
      { id: "petrol", name: "Petrol/Diesel", icon: "Fuel" },
      { id: "public_transport", name: "Metro/Bus/Auto", icon: "Bus" },
      { id: "car_emi", name: "Car/Bike EMI", icon: "Car" },
      { id: "vehicle_maintenance", name: "Vehicle Maintenance", icon: "Settings" },
      { id: "vehicle_insurance", name: "Vehicle Insurance", icon: "Shield" },
      { id: "parking", name: "Parking", icon: "ParkingCircle" },
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: "Heart",
    subCategories: [
      { id: "medicines", name: "Medicines", icon: "Pill" },
      { id: "doctor_consultation", name: "Doctor Consultation", icon: "Stethoscope" },
      { id: "health_insurance", name: "Health Insurance", icon: "HeartPulse" },
      { id: "lab_tests", name: "Lab Tests", icon: "TestTube" },
      { id: "hospital", name: "Hospital Bills", icon: "Hospital" },
    ],
  },
  {
    id: "education",
    name: "Education",
    icon: "GraduationCap",
    subCategories: [
      { id: "school_fees", name: "School Fees", icon: "School" },
      { id: "tuition", name: "Tuition/Coaching", icon: "BookOpen" },
      { id: "books", name: "Books & Stationery", icon: "Book" },
      { id: "uniform", name: "School Uniform", icon: "Shirt" },
      { id: "transport_school", name: "School Transport", icon: "Bus" },
    ],
  },
  {
    id: "household_help",
    name: "Household Help",
    icon: "Users",
    subCategories: [
      { id: "maid", name: "Maid/House Help", icon: "UserCheck" },
      { id: "cook", name: "Cook", icon: "ChefHat" },
      { id: "driver", name: "Driver", icon: "User" },
      { id: "security", name: "Security Guard", icon: "ShieldCheck" },
    ],
  },

  // ============ WANTS ============
  {
    id: "dining_out",
    name: "Dining & Food Delivery",
    icon: "UtensilsCrossed",
    subCategories: [
      { id: "restaurants", name: "Restaurants", icon: "Utensils" },
      { id: "food_delivery", name: "Food Delivery (Swiggy/Zomato)", icon: "Bike" },
      { id: "cafe", name: "Café & Coffee", icon: "Coffee" },
      { id: "fast_food", name: "Fast Food", icon: "Pizza" },
    ],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "Film",
    subCategories: [
      { id: "movies", name: "Movies & Cinema", icon: "Clapperboard" },
      { id: "ott", name: "OTT Subscriptions", icon: "Tv2" },
      { id: "music", name: "Music Streaming", icon: "Music" },
      { id: "games", name: "Gaming", icon: "Gamepad2" },
      { id: "events", name: "Events & Concerts", icon: "Ticket" },
    ],
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "ShoppingBag",
    subCategories: [
      { id: "clothes", name: "Clothes & Fashion", icon: "Shirt" },
      { id: "footwear", name: "Footwear", icon: "Footprints" },
      { id: "accessories", name: "Accessories & Jewelry", icon: "Watch" },
      { id: "electronics", name: "Electronics & Gadgets", icon: "Laptop" },
      { id: "home_decor", name: "Home Décor", icon: "Sofa" },
      { id: "gifts", name: "Gifts", icon: "Gift" },
    ],
  },
  {
    id: "personal_care",
    name: "Personal Care",
    icon: "Sparkles",
    subCategories: [
      { id: "salon", name: "Salon & Spa", icon: "Scissors" },
      { id: "cosmetics", name: "Cosmetics & Skincare", icon: "Sparkle" },
      { id: "gym", name: "Gym Membership", icon: "Dumbbell" },
      { id: "yoga", name: "Yoga/Fitness Classes", icon: "Activity" },
    ],
  },
  {
    id: "travel",
    name: "Travel & Vacation",
    icon: "Plane",
    subCategories: [
      { id: "flights", name: "Flight Tickets", icon: "PlaneTakeoff" },
      { id: "hotels", name: "Hotels & Accommodation", icon: "Hotel" },
      { id: "travel_packages", name: "Travel Packages", icon: "MapPin" },
      { id: "local_travel", name: "Local Sightseeing", icon: "Map" },
    ],
  },
  {
    id: "hobbies",
    name: "Hobbies & Leisure",
    icon: "Palette",
    subCategories: [
      { id: "sports", name: "Sports Equipment", icon: "Trophy" },
      { id: "photography", name: "Photography", icon: "Camera" },
      { id: "art_craft", name: "Art & Craft Supplies", icon: "Palette" },
      { id: "gardening", name: "Gardening", icon: "Flower" },
    ],
  },
  {
    id: "festivals",
    name: "Festivals & Celebrations",
    icon: "Sparkles",
    subCategories: [
      { id: "diwali", name: "Diwali Shopping", icon: "Sparkles" },
      { id: "puja", name: "Puja Items", icon: "Flame" },
      { id: "birthday", name: "Birthday Celebrations", icon: "PartyPopper" },
      { id: "wedding", name: "Wedding Expenses", icon: "Heart" },
    ],
  },

  // ============ SAVINGS ============
  {
    id: "savings",
    name: "Savings",
    icon: "PiggyBank",
    subCategories: [
      { id: "emergency_fund", name: "Emergency Fund", icon: "AlertCircle" },
      { id: "savings_account", name: "Savings Account", icon: "Wallet" },
      { id: "fixed_deposit", name: "Fixed Deposit", icon: "Lock" },
      { id: "recurring_deposit", name: "Recurring Deposit", icon: "Repeat" },
      { id: "ppf", name: "PPF", icon: "BadgeIndianRupee" },
    ],
  },

  // ============ INVESTMENTS ============
  {
    id: "investments",
    name: "Investments",
    icon: "TrendingUp",
    subCategories: [
      { id: "mutual_funds", name: "Mutual Funds/SIP", icon: "LineChart" },
      { id: "stocks", name: "Stocks/Equity", icon: "CandlestickChart" },
      { id: "gold", name: "Gold/Digital Gold", icon: "Gem" },
      { id: "insurance", name: "Life Insurance", icon: "Shield" },
      { id: "nps", name: "NPS", icon: "Landmark" },
      { id: "real_estate", name: "Real Estate", icon: "Building" },
      { id: "crypto", name: "Cryptocurrency", icon: "Bitcoin" },
    ],
  },

  // ============ INCOME ============
  {
    id: "income_salary",
    name: "Salary & Wages",
    icon: "Briefcase",
    subCategories: [
      { id: "monthly_salary", name: "Monthly Salary", icon: "Wallet" },
      { id: "bonus", name: "Bonus", icon: "Gift" },
      { id: "overtime", name: "Overtime Pay", icon: "Clock" },
      { id: "commission", name: "Commission", icon: "BadgePercent" },
    ],
  },
  {
    id: "income_business",
    name: "Business Income",
    icon: "Building2",
    subCategories: [
      { id: "sales", name: "Sales Revenue", icon: "ShoppingCart" },
      { id: "consulting", name: "Consulting Fees", icon: "UserCheck" },
      { id: "freelance", name: "Freelance Income", icon: "Laptop" },
    ],
  },
  {
    id: "income_investment",
    name: "Investment Returns",
    icon: "TrendingUp",
    subCategories: [
      { id: "dividends", name: "Dividends", icon: "PieChart" },
      { id: "interest_income", name: "Interest Income", icon: "Percent" },
      { id: "capital_gains", name: "Capital Gains", icon: "ArrowUpRight" },
      { id: "rental_income", name: "Rental Income", icon: "Home" },
    ],
  },
  {
    id: "income_other",
    name: "Other Income",
    icon: "Plus",
    subCategories: [
      { id: "gifts_received", name: "Gifts Received", icon: "Gift" },
      { id: "refunds", name: "Refunds", icon: "RotateCcw" },
      { id: "cashback", name: "Cashback & Rewards", icon: "BadgePercent" },
      { id: "misc_income", name: "Miscellaneous", icon: "MoreHorizontal" },
    ],
  },

  // ============ OTHERS ============
  {
    id: "others",
    name: "Others",
    icon: "MoreHorizontal",
    subCategories: [
      { id: "charity", name: "Charity & Donations", icon: "HandHeart" },
      { id: "loan_payment", name: "Loan Payments", icon: "Banknote" },
      { id: "pet_care", name: "Pet Care", icon: "Dog" },
      { id: "misc", name: "Miscellaneous", icon: "Package" },
    ],
  },

  // ============ CREDIT CARDS & LOANS ============
  {
    id: "credit_cards",
    name: "Credit Cards & Loans",
    icon: "CreditCard",
    subCategories: [
      { id: "credit_card_bill", name: "Credit Card Bill", icon: "CreditCard" },
      { id: "personal_loan", name: "Personal Loan EMI", icon: "HandCoins" },
      { id: "education_loan", name: "Education Loan EMI", icon: "GraduationCap" },
      { id: "business_loan", name: "Business Loan EMI", icon: "Briefcase" },
      { id: "loan_interest", name: "Loan Interest", icon: "Percent" },
    ],
  },
];

/**
 * Seeds categories and sub-categories for a new user
 * @param userId - The user's UUID
 */
export async function seedCategoriesForUser(userId: string): Promise<void> {
  for (let i = 0; i < SEED_CATEGORIES.length; i++) {
    const category = SEED_CATEGORIES[i];

    // Insert parent category
    const [insertedCategory] = await db
      .insert(categories)
      .values({
        userId,
        name: category.name,
        icon: category.icon,
        sortOrder: i,
        isSystem: true,
        isArchived: false,
      })
      .returning();

    // Insert sub-categories for this category
    if (category.subCategories && category.subCategories.length > 0) {
      const subCategoryValues = category.subCategories.map((sub, subIndex) => ({
        categoryId: insertedCategory.id,
        userId,
        name: sub.name,
        icon: sub.icon,
        sortOrder: subIndex,
        isSystem: true,
        isArchived: false,
      }));

      await db.insert(subCategories).values(subCategoryValues);
    }
  }
}

/**
 * Get the total count of seed categories
 */
export function getSeedCategoryCounts(): { categories: number; subCategories: number } {
  const categoriesCount = SEED_CATEGORIES.length;
  const subCategoriesCount = SEED_CATEGORIES.reduce(
    (acc, cat) => acc + (cat.subCategories?.length || 0),
    0
  );
  return { categories: categoriesCount, subCategories: subCategoriesCount };
}

