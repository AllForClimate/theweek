import axios from 'axios'

export async function createCohort(data){
    return await axios.put('/api/cohorts', {
        facilitatorAddress: data.facilitatorAddress,
        datetimeEp1: data.datetimeEp1.toISOString(),
        datetimeEp2: data.datetimeEp2.toISOString(),
        datetimeEp3: data.datetimeEp3.toISOString(),
        confirmationDeadline: data.confirmationDeadline.toISOString()
    })
}

export async function getCohorts(facilitatorAddress) {
    const res = await axios.get(`/api/cohorts/${facilitatorAddress}`)
    return res.data
}