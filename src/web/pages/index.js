import { useAppContext } from './components/appState'
import Presentation from './components/presentation'
import FacilitatorDashboard from './components/facilitatorDashboard'
import ParticipantDashboard from './components/participantDashboard'

export default function Home() {
  const [state] = useAppContext()

  if(state.address){
    if(state.isFacilitator) {
      return <FacilitatorDashboard />
    }

    return <ParticipantDashboard />
  }
  return <Presentation />
}
