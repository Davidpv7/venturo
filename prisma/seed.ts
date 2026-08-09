import { prisma } from "../src/lib/prisma";

const homes = [
  {
    name: "Northcote House",
    description:
      "Friendly 3-bedroom share house 5 min walk to the tram. Fully furnished, bills included.",
    address: "12 Example St, Northcote VIC",
    photos: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994"],
    rooms: [
      {
        title: "Sunny Double Room",
        description:
          "Bright double room, shares the kitchen and living area with the rest of the house.",
        price: 32000, // $320.00/week, in cents
        leaseLengthMonths: 6,
        photos: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
        ],
      },
      {
        title: "Cosy Single Room",
        description:
          "Quiet single room, great natural light, shared kitchen and living area with easygoing housemates.",
        price: 26000,
        leaseLengthMonths: 12,
        photos: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"],
      },
    ],
  },
  {
    name: "Fitzroy Terrace",
    description:
      "Modern co-living house with styling support available for the room you move into.",
    address: "7 Demo Rd, Fitzroy VIC",
    photos: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb"],
    rooms: [
      {
        title: "Master Room w/ Ensuite",
        description:
          "Spacious master room with private ensuite in a modern co-living house.",
        price: 41000,
        leaseLengthMonths: 6,
        photos: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511"],
      },
    ],
  },
];

async function main() {
  for (const { photos, rooms, ...home } of homes) {
    await prisma.home.create({
      data: {
        ...home,
        photos: {
          create: photos.map((url, order) => ({ url, order })),
        },
        rooms: {
          create: rooms.map(({ photos: roomPhotos, ...room }) => ({
            ...room,
            photos: {
              create: roomPhotos.map((url, order) => ({ url, order })),
            },
          })),
        },
      },
    });
  }

  console.log(`Seeded ${homes.length} homes.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
