import { prisma } from "../src/lib/prisma";

const rooms = [
  {
    title: "Sunny Double Room, Northcote",
    description:
      "Bright double room in a shared 3-bedroom house. Fully furnished, includes bills. 5 min walk to tram.",
    price: 32000, // $320.00/week, in cents
    leaseLengthMonths: 6,
    address: "12 Example St, Northcote VIC",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    ],
  },
  {
    title: "Cosy Single Room, Brunswick",
    description:
      "Quiet single room, great natural light, shared kitchen and living area with two easygoing housemates.",
    price: 26000,
    leaseLengthMonths: 12,
    address: "48 Sample Ave, Brunswick VIC",
    photos: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"],
  },
  {
    title: "Master Room w/ Ensuite, Fitzroy",
    description:
      "Spacious master room with private ensuite in a modern co-living house. Furnishing and styling support available.",
    price: 41000,
    leaseLengthMonths: 6,
    address: "7 Demo Rd, Fitzroy VIC",
    photos: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    ],
  },
];

async function main() {
  for (const { photos, ...room } of rooms) {
    await prisma.room.create({
      data: {
        ...room,
        photos: {
          create: photos.map((url, order) => ({ url, order })),
        },
      },
    });
  }

  console.log(`Seeded ${rooms.length} rooms.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
