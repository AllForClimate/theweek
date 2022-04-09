import { useState, useEffect } from 'react'
import { useAppContext } from './components/appState'
import { Button, Box, CircularProgress, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Stack, TextField } from '@mui/material'
import { getFacilitators, grantFacilitatorRole  } from './lib/lockerContractFacade'
import DeleteRounded from '@mui/icons-material/DeleteRounded'

export default function Admin() {
    const [state] = useAppContext()
    const [facilitators, setFacilitators] = useState([])
    const [newFacilitatorAddress, setNewFacilitatorAddress] = useState('')

    useEffect(async () => {
        if(state.signer) {
            setFacilitators(await getFacilitators(state.signer))
        }
    })

    if(state.walletAddress){
        if(!facilitators) {
            return (
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                </Box>
            )
        }
        return (<Stack>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Wallet address</TableCell>
                            <TableCell>Revoke</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {facilitators.map(walletAddress => (
                            <TableRow>
                                <TableCell>{walletAddress}</TableCell>
                                <TableCell><DeleteRounded onClick={() => {}}/></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Stack component="form" direction="row">
                <TextField required label="Wallet address" value={newFacilitatorAddress} onChange={e => setNewFacilitatorAddress(e.target.value)}></TextField>
                <Button variant="contained" onClick={async () => { await grantFacilitatorRole(state.signer, newFacilitatorAddress) }}>Grant facilitator role</Button>
            </Stack>
        </Stack>)
    }
    return (<Box sx={{ flexGrow: '1', display:'flex', alignItems:'center', flexDirection:'column'}}>
        <Button onClick={state.tryConnect} variant="contained" sx={{ padding: '1rem', margin:'1rem 0'}}>Connect</Button>
    </Box>)
}
