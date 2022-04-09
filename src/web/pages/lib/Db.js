import { create } from 'ipfs'
import OrbitDB from 'orbit-db'

export async function executeOnDb(operations)  {
    const createNode = () => create({
      preload: { enabled: false },
      repo: './ipfs',
      EXPERIMENTAL: { pubsub: true },
      config: {
        Bootstrap: [],
        Addresses: { Swarm: [] }
      }
    })

    const node = await createNode()
    const orbitDb = await OrbitDB.createInstance(node)
    const cohorts = await orbitDb.docstore('cohorts', { accessController: { write: [orbitDb.identity.id] }})
    const watchParties = await orbitDb.docstore('watchParties', { accessController: { write: [orbitDb.identity.id] }})
    await cohorts.load()
    await watchParties.load()
    const dbs = { cohorts, watchParties, node }
    try {
      await operations(dbs)
    }
    finally {
      orbitDb.stop()
      node.stop()
    }
}