const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Old Enschede-only formula that was used
const ENSCHEDE_LAT_BASE = 52.24
const ENSCHEDE_LAT_RANGE = 0.04
const ENSCHEDE_LNG_BASE = 6.87
const ENSCHEDE_LNG_RANGE = 0.05

async function migrateCoordinates() {
  console.log('Starting coordinate migration...')

  const initiatives = await prisma.initiative.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null }
      ],
      AND: [
        { coordinateX: { not: null } },
        { coordinateY: { not: null } }
      ]
    }
  })

  console.log(`Found ${initiatives.length} initiatives to migrate`)

  for (const initiative of initiatives) {
    // Convert old 0-100 coordinates to real lat/lng using the OLD Enschede formula
    const latitude = ENSCHEDE_LAT_BASE - (initiative.coordinateY / 100) * ENSCHEDE_LAT_RANGE
    const longitude = ENSCHEDE_LNG_BASE + (initiative.coordinateX / 100) * ENSCHEDE_LNG_RANGE

    await prisma.initiative.update({
      where: { id: initiative.id },
      data: {
        latitude,
        longitude
      }
    })

    console.log(`Migrated: ${initiative.name} -> (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`)
  }

  console.log('Migration complete!')
}

migrateCoordinates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
