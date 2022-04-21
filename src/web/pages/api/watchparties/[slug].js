import { executeOnDb } from '../../lib/Db.js'
import logger from '../../lib/logger'

export default async function handler(req, res) {
    return new Promise(async resolve => {
        const { slug } = req.query
        try {
            await executeOnDb(async dbs => {
                res.status(200).json(await dbs.watchParties.query(watchParty => watchParty.slug === slug))    
            })
        } catch(e) {
            logger.error(e)
            res.status(500).json({ error: 'Unexpected error : ' + e })                 
        } finally {
            resolve()
        }
    })
}