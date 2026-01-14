import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Real locations across Overijssel
const initiatives = [
  // Enschede area
  { name: 'Enschede Community Garden', type: 'garden', lat: 52.2215, lng: 6.8937, location: 'Hengelosestraat 51, Enschede' },
  { name: 'Roombeek Urban Farm', type: 'garden', lat: 52.2185, lng: 6.9147, location: 'Roomweg 165, Enschede' },
  { name: 'Enschede Farmers Market', type: 'market', lat: 52.2208, lng: 6.8961, location: 'Marktplein, Enschede' },
  { name: 'Green Living Enschede', type: 'event', lat: 52.2165, lng: 6.8892, location: 'Langestraat 77, Enschede' },
  { name: 'Sustainable Enschede Group', type: 'group', lat: 52.2198, lng: 6.8845, location: 'Haaksbergerstraat 33, Enschede' },

  // Hengelo
  { name: 'Hengelo Community Hub', type: 'group', lat: 52.2655, lng: 6.7935, location: 'Enschedesestraat 2, Hengelo' },
  { name: 'Hengelo Organic Market', type: 'market', lat: 52.2643, lng: 6.7921, location: 'Markt 5, Hengelo' },
  { name: 'Hengelo Green Space', type: 'garden', lat: 52.2671, lng: 6.7885, location: 'Deldensestraat 88, Hengelo' },
  { name: 'Eco-Friendly Hengelo', type: 'event', lat: 52.2614, lng: 6.7962, location: 'Industrieplein 10, Hengelo' },

  // Almelo
  { name: 'Almelo Urban Garden', type: 'garden', lat: 52.3571, lng: 6.6633, location: 'Grotestraat 127, Almelo' },
  { name: 'Almelo Weekend Market', type: 'market', lat: 52.3564, lng: 6.6621, location: 'Marktplein, Almelo' },
  { name: 'Sustainability Almelo', type: 'group', lat: 52.3547, lng: 6.6687, location: 'Windmolenbroeksestraat 45, Almelo' },
  { name: 'Almelo Climate Action', type: 'event', lat: 52.3591, lng: 6.6574, location: 'Hofstraat 8, Almelo' },

  // Oldenzaal
  { name: 'Oldenzaal Community Garden', type: 'garden', lat: 52.3131, lng: 6.9293, location: 'Ganzenmarkt 12, Oldenzaal' },
  { name: 'Oldenzaal Farmers Market', type: 'market', lat: 52.3124, lng: 6.9281, location: 'Marktstraat 22, Oldenzaal' },
  { name: 'Green Oldenzaal Initiative', type: 'event', lat: 52.3117, lng: 6.9314, location: 'Ootmarsumseweg 55, Oldenzaal' },

  // Zwolle
  { name: 'Zwolle City Garden', type: 'garden', lat: 52.5125, lng: 6.0946, location: 'Grote Kerkplein 5, Zwolle' },
  { name: 'Zwolle Eco Market', type: 'market', lat: 52.5118, lng: 6.0934, location: 'Melkmarkt 41, Zwolle' },
  { name: 'Sustainable Zwolle Network', type: 'group', lat: 52.5137, lng: 6.0891, location: 'Diezerstraat 88, Zwolle' },
  { name: 'Zwolle Green Events', type: 'event', lat: 52.5094, lng: 6.0972, location: 'Stationsweg 10, Zwolle' },
  { name: 'Zwolle Community Hub', type: 'group', lat: 52.5162, lng: 6.0887, location: 'Assendorperplein 56, Zwolle' },

  // Deventer
  { name: 'Deventer Urban Farm', type: 'garden', lat: 52.2551, lng: 6.1636, location: 'Brink 89, Deventer' },
  { name: 'Deventer Organic Market', type: 'market', lat: 52.2543, lng: 6.1627, location: 'Kleine Poot 2, Deventer' },
  { name: 'Eco Deventer Group', type: 'group', lat: 52.2567, lng: 6.1594, location: 'Korte Assenstraat 14, Deventer' },

  // Kampen
  { name: 'Kampen Community Garden', type: 'garden', lat: 52.5549, lng: 5.9114, location: 'Oudestraat 151, Kampen' },
  { name: 'Kampen Weekly Market', type: 'market', lat: 52.5542, lng: 5.9105, location: 'Burgemeester Berghuisplein 1, Kampen' },

  // Steenwijk
  { name: 'Steenwijk Green Space', type: 'garden', lat: 52.7856, lng: 6.1167, location: 'Marktstraat 25, Steenwijk' },
  { name: 'Steenwijk Sustainability Hub', type: 'event', lat: 52.7863, lng: 6.1152, location: 'Stationsweg 45, Steenwijk' },

  // Rijssen
  { name: 'Rijssen Community Initiative', type: 'group', lat: 52.3087, lng: 6.5163, location: 'Wemenstraat 42, Rijssen' },
  { name: 'Rijssen Local Market', type: 'market', lat: 52.3094, lng: 6.5177, location: 'Marktplein 8, Rijssen' },

  // Tubbergen
  { name: 'Tubbergen Green Living', type: 'garden', lat: 52.4072, lng: 6.7831, location: 'Dorpsstraat 19, Tubbergen' }
]

async function seedInitiatives() {
  console.log('🌱 Seeding initiatives across Overijssel...\n')

  for (const init of initiatives) {
    const created = await prisma.initiative.create({
      data: {
        name: init.name,
        type: init.type,
        latitude: init.lat,
        longitude: init.lng,
        location: init.location,
        description: `A wonderful ${init.type === 'garden' ? 'community garden' : init.type === 'market' ? 'local market' : init.type === 'event' ? 'sustainability event' : 'community group'} in ${init.location.split(',')[1]?.trim() || 'Overijssel'}. Join us to make our community more sustainable and connected!`,
        contact: 'info@example.com',
        website: 'https://example.com'
      }
    })
    console.log(`✅ Created: ${created.name}`)
  }

  console.log(`\n🎉 Successfully created ${initiatives.length} initiatives!`)

  // Show distribution
  const counts = await prisma.initiative.groupBy({
    by: ['type'],
    _count: true
  })

  console.log('\n📊 Distribution:')
  counts.forEach(({ type, _count }) => {
    console.log(`   ${type}: ${_count}`)
  })
}

seedInitiatives()
  .catch((e) => {
    console.error('❌ Error seeding initiatives:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
