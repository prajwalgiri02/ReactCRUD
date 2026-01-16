export interface Category {
  id: number
  name: string
  status: "active" | "inactive"
  created_at: string
}

const generateCategories = (): Category[] => {
  const names = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Sports",
    "Books",
    "Toys",
    "Food & Beverage",
    "Health & Beauty",
    "Automotive",
    "Office Supplies",
    "Furniture",
    "Jewelry",
    "Shoes",
    "Accessories",
    "Software",
    "Hardware",
    "Gaming",
    "Music",
    "Movies",
    "Collectibles",
    "Pet Supplies",
    "Tools",
    "Garden Tools",
    "Kitchen Appliances",
    "Bedding",
    "Luggage",
    "Sporting Equipment",
    "Bicycles",
    "Photography",
    "Outdoor Gear",
    "Art Supplies",
    "Craft Supplies",
    "Cleaning Supplies",
    "Laundry Supplies",
    "Personal Care",
    "Baby Products",
    "Maternity",
    "Kids Clothing",
    "Kids Shoes",
    "Infant Gear",
  ]

  return names.map((name, idx) => ({
    id: idx + 1,
    name,
    status: idx % 3 === 0 ? "inactive" : "active",
    created_at: new Date(2024, Math.random() * 12, Math.floor(Math.random() * 28) + 1).toISOString(),
  }))
}

export const mockDb = {
  categories: generateCategories(),
}
