import { executeOnDb } from '../lib/Db.js'
import { CID } from 'ipfs'
import { randomUUID } from 'crypto'
import logger from '../lib/logger'

export default async function handler(req, res) {
    return new Promise(async resolve => {
        if(req.method === 'PUT') {
            try {
                if(!req.body.address || !req.body.cohorts || !req.body.txLock || !req.body.watchpartySlug ) {
                    res.status(500).json({ error: 'Some mandatory fields are missing.' })
                } else {
                    await executeOnDb(async dbs => {
                        const organizer = await dbs.organizers.get(req.body.watchpartySlug)
                        console.log(`organizer: ${organizer}`)
                        const cidParticipantStr = await dbs.candidateParticipants.put({
                            _id: randomUUID(),
                            address: req.body.address,
                            cohorts: req.body.cohorts,
                            txLock: req.body.txLock,
                            watchparty: req.body.watchpartySlug
                        })
                        const cidParticipant = CID.parse(cidParticipantStr)
                        if(!organizer) {
                            dbs.organizers.put(req.body.watchpartySlug, cidParticipant)
                        }
                        res.status(200).json({ cid: cidParticipant })
                    })
                }
            }
            catch(e) {
                logger.error(e)
                res.status(500).json({ error: 'Unexpected error : ' + e })
            } finally {
                resolve()
            }
        } else {
            res.status(501).end()
            resolve()
        }
    })
}