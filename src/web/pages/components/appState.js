import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Button, Snackbar, Alert } from '@mui/material'
import { isFacilitator  } from '../lib/lockerContractFacade'

const AppContext = createContext();

let ethereum
let provider

export function AppWrapper({ children }) {
  const tryConnect = async () => {
    try {
        ensureWalletInitialized()
        provider = new ethers.providers.Web3Provider(ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        localStorage.setItem('address', address)
        const signerIsFacilitator = await isFacilitator(signer)
        mergeWithState({ 
          address: address, 
          signer, 
          autoConnecting: false, 
          isFacilitator: signerIsFacilitator,
          errorMsg: null
        })
    } catch (ex) {
        console.log(ex)
        let errorMsg = 'There was a failure connecting to our smart contract.'

        if(ex.code === 'CALL_EXCEPTION') {
          errorMsg = 'Failed to contact our smart contract. Is your wallet connected to the Polygon network ?'
        }
        mergeWithState({ 
          autoConnecting: false, 
          errorMsg, 
          triedConnected: true // Prevents endlessly retrying to connect
        })
    }
  }

  const mergeWithState = newState => {
    setState({...state, ...newState})
  }
  
  const [state, setState] = useState({
      address: null,
      tryConnect,
      mergeWithState,
      autoConnecting:false
  })

  const ensureWalletInitialized = () => {
    if(!ethereum){
      ethereum = window.ethereum
      ethereum.on('accountsChanged', tryConnect)
      ethereum.on('chainChanged', tryConnect)
    }
  }

  useEffect(async () => {
    if(!state.address && localStorage.getItem('address') && !state.autoConnecting && !state.errorMsg && !state.triedConnected) {
      mergeWithState({ autoConnecting: true })
      await state.tryConnect()
    }
  })

  const dismissErrorMsg = () => mergeWithState({ errorMsg : null })

  return (
    <AppContext.Provider value={[state, setState]}>
      <Snackbar
        open={!!state.errorMsg}
        autoHideDuration={60000}
        onClose={dismissErrorMsg}
        message={state.errorMsg}
      >
        <Alert onClose={dismissErrorMsg} severity="error">
            {state.errorMsg}
            <Button color="secondary" size="small" onClick={tryConnect}>
              Try again
            </Button>
        </Alert>
      </Snackbar>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}