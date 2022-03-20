import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { isFacilitator } from './data/authorization'

const AppContext = createContext();

export function AppWrapper({ children }) {
  const tryConnect = async () => {
    try {
        const { ethereum } = window
        const provider = new ethers.providers.Web3Provider(ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        localStorage.setItem('address', address)
        mergeWithState({ address: address, autoConnecting: false, isFacilitator: await isFacilitator(address)})
    } catch (ex) {
        mergeWithState({ autoConnecting: false })
        console.log(ex)
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

  useEffect(async () => {
    if(!state.address && localStorage.getItem('address') && !state.autoConnecting) {
        mergeWithState({ autoConnecting: true })
      await state.tryConnect()
    }
  })

  return (
    <AppContext.Provider value={[state, setState]}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}