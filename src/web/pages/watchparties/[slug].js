import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, CircularProgress } from '@mui/material'
import { getWatchparty } from '../lib/apiFacade'
import { useAppContext } from '../components/appState'

export default function Watchparties() {
    const router = useRouter()
    const { slug } = router.query
    const [watchparty, setWatchparty] = useState(null)

    useEffect(async () => {
        if(!watchparty) {
            setWatchparty(await getWatchparty(slug))
        }
    })

    return <Box>
        watch party {slug}
        {!watchparty && <CircularProgress />}
    </Box>
}