import { makeElectricContext, electrify } from 'electric-sql/wa-sqlite'
import { schema } from './schema'

export const { ElectricProvider, useElectric } = makeElectricContext()

export async function initDb() {
  const config = {
    url: 'http://localhost:5133',
    debug: true,
  }

  const { db } = await electrify(config)
  await db.tx(async (tx) => {
    await tx.none(schema)
  })

  return db
}
