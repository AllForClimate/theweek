import { executeOnDb } from '../lib/Db.js'
import { CID } from 'ipfs'
import { randomUUID } from 'crypto'

export default async function handler(req, res) {
    return new Promise(async resolve => {
        if(req.method === 'PUT') {
            try {
                if(!req.body.datetimeEp1 || !req.body.datetimeEp2 || !req.body.datetimeEp3 || 
                    !req.body.confirmationDeadline || !req.body.facilitatorAddress ) {
                    res.status(500).json({ error: 'Some mandatory fields are missing.' })
                } else {
                    const datetimeEp1 = new Date(req.body.datetimeEp1)
                    const datetimeEp2 = new Date(req.body.datetimeEp2)
                    const datetimeEp3 = new Date(req.body.datetimeEp3)
                    const confirmationDeadline = new Date(req.body.confirmationDeadline)
                    if(datetimeEp1 < confirmationDeadline || datetimeEp2 < datetimeEp1 || datetimeEp3 < datetimeEp2) {
                        res.status(500).json({ error: 'Improper chronological order of dates.' })
                    } else {
                        await executeOnDb(async dbs => {
                            const cidStr = await dbs.cohorts.put({
                                _id: randomUUID(),
                                facilitatorAddress: req.body.facilitatorAddress,
                                datetimeEp1: datetimeEp1.toISOString(),
                                datetimeEp2: datetimeEp2.toISOString(),
                                datetimeEp3: datetimeEp3.toISOString(),
                                confirmationDeadline: confirmationDeadline.toISOString()
                            })
                            const cid = CID.parse(cidStr)
                            res.status(200).json(await dbs.node.dag.get(cid))
                        })
                    }
                }
            }
            catch(e) {
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