import { executeOnDb } from '../../lib/Db.js'
import logger from '../../lib/logger'

export default async function handler(req, res) {
    return new Promise(async resolve => {
        const { slug } = req.query
        try {
            await executeOnDb(async dbs => {
                const watchparties = await dbs.watchparties.query(watchparty => watchparty.slug === slug)
                if (watchparties.length === 0) {
                    res.status(404)
                } else {
                    res.status(200).json(watchparties[0])   
                }
            })
        } catch(e) {
            logger.error(e)
            res.status(500).json({ error: 'Unexpected error : ' + e })                 
        } finally {
            resolve()
        }
    })
}