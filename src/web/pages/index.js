import { useAppContext } from './components/appState'
import Presentation from './components/presentation'
import FacilitatorDashboard from './components/facilitatorDashboard'
import ParticipantDashboard from './components/participantDashboard'
import { Container } from '@mui/material'

export default function Home() {
  const [state] = useAppContext()

  if(state.address){
    let component
    if(state.isFacilitator) {
      component = <FacilitatorDashboard />
    } else {
      component = <ParticipantDashboard />
    }
    return <Container>
      {component}
    </Container>
    
  }
  return <Presentation />
}
