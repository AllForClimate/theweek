import { useState, useEffect } from 'react'
import { useAppContext } from './components/appState'
import { Button, Box, Card, CircularProgress, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Stack, TextField, Typography } from '@mui/material'
import { getFacilitators, grantFacilitatorRole, revokeFacilitatorRole, getAmountToLock, setAmountToLock  } from './lib/lockerContractFacade'
import DeleteRounded from '@mui/icons-material/DeleteRounded'
import { typography } from '@mui/system'

export default function Admin() {
    const [state] = useAppContext()
    const [adminState, setAdminState] = useState(null)
    const [newFacilitatorAddress, setNewFacilitatorAddress] = useState('')
    const [newAmountToLock, setNewAmountToLock] = useState('0')

    const refresh = async () => {
        setAdminState({facilitators: await getFacilitators(state.signer), amountToLock: await getAmountToLock(state.signer)})
    }

    useEffect(async () => {
        if(state.signer && adminState === null) {
            await refresh()
        }
    })

    if(state.walletAddress){
        if(!adminState) {
            return (
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                </Box>
            )
        }
        return (<Stack sx={{padding:'2rem'}}>
            <Card elevation={2} sx={{ padding: '1rem', margin: '1rem' }}>
                <Stack alignItems="center">
                    <Typography variant="h4">Amount to lock</Typography>
                    <Typography sx={{margin: '1rem'}}>Current amount to lock for participation: {adminState.amountToLock.toString()} wei</Typography>
                    <Box>
                        <TextField label="Amount to lock for participation" variant="standard" 
                            value={newAmountToLock} onChange={e => { setNewAmountToLock(e.target.value) }}/>
                        <Button disabled={!newAmountToLock} variant="outlined" onClick={async () => {
                            try {
                                await setAmountToLock(state.signer, state.provider, newAmountToLock)
                                await refresh()
                            }
                            catch(e) {
                                state.setError(state, `Error while executing this request: ${e.message}`)
                            }
                        }}>Change amount</Button>
                    </Box>
                </Stack>
            </Card>
            <Card elevation={2} sx={{ padding: '1rem', margin: '1rem' }}>
                <Stack alignItems="center">
                    <Typography variant="h4">Facilitator list</Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Wallet address</TableCell>
                                    <TableCell>Revoke</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {adminState.facilitators.map((walletAddress, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{walletAddress}</TableCell>
                                        <TableCell><Button onClick={async () => {
                                            try {
                                                await revokeFacilitatorRole(state.signer, walletAddress)
                                            }
                                            catch(e) {
                                                state.setError(state, `Error while executing this request: ${e.message}`)
                                                console.log(e)
                                            }
                                        }}><DeleteRounded /></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Stack component="form" direction="row">
                        <TextField required label="Wallet address" value={newFacilitatorAddress} onChange={e => setNewFacilitatorAddress(e.target.value)}></TextField>
                        <Button variant="contained" onClick={async () => { 
                            try {
                                await grantFacilitatorRole(state.signer, newFacilitatorAddress) 
                            }
                            catch(e) {
                                state.setError(state, `Error while executing this request: ${e.message}`)
                                console.log(e)
                            }
                        }}>Grant facilitator role</Button>
                    </Stack>
                </Stack>
            </Card>
        </Stack>)
    }
    return (<Box sx={{ flexGrow: '1', display:'flex', alignItems:'center', flexDirection:'column'}}>
        <Button onClick={state.tryConnect} variant="contained" sx={{ padding: '1rem', margin:'1rem 0'}}>Connect</Button>
    </Box>)
}
