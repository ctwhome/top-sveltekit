import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite'
import { authToken } from '$lib/stores/auth'
import { get } from 'svelte/store'

const config = {
  url: 'http://localhost:5133',
  token: get(authToken)
}

export const { db, sync } = await electrify(config)
