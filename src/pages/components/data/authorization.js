import axios from 'axios'

export async function isFacilitator (address) {
    const res = await axios.get('/api/auth')
    return res.data
}