import { useState } from 'react'
import { Stepper, Step, StepLabel, Box, MobileStepper, Button, 
    Stack, TextField, Typography, Link } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import CohortSelector from './cohortSelector'
import LockFunds from './lockFunds'
import { useAppContext } from './appState'

const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_PUBLIC_URL

export default function Organize() {
    const [multiStep, setMultiStep] = useState({ currentStep: 0, numberOfSteps: 4, cohorts: [] })
    const [state] = useAppContext()
    const theme = useTheme()
    const largeScreen = useMediaQuery(theme.breakpoints.up('md'))
      
    const goToPreviousStep = () => {
        setMultiStep({ ...multiStep, ...{currentStep: multiStep.currentStep - 1}})
    }
    const goToNextStep = () => {
        if(multiStep.currentStep < multiStep.numberOfSteps - 1) {
            if(multiStep.currentStep === 0 && multiStep.cohorts.length === 0) {
                state.setError(state, 'Please select one or more cohort for which you are available.')
            } else if(multiStep.currentStep === 1 && !multiStep.watchPartyName) {
                state.setError(state, 'Please provide a name for the watch party.')
            } else if(multiStep.currentStep === 2 && !multiStep.txLock) {
                state.setError(state, 'Please lock funds to create the watch party.')
            } else {
                setMultiStep({ ...multiStep, ...{currentStep: multiStep.currentStep + 1}})
            }
        }
    } 
    const getBackButton = <Button variant="contained" onClick={() => goToPreviousStep()} disabled={multiStep.currentStep == 0 || multiStep.currentStep == multiStep.numberOfSteps - 1}>Back</Button>
    const getNextButton = <Button variant="contained" onClick={() => goToNextStep()}>Next</Button>
    const getCurrentStepComponent = currentStep => {
        switch(currentStep) {
            case 0:
                return <CohortSelector value={multiStep.cohorts} onChange={cohorts => {
                    setMultiStep({...multiStep, ...{cohorts}})
                }}/>
            case 1:
                return <TextField fullWidth id="watchPartyName" label="Give a name to your watch party" placeholder={'My DAO\'s watch party of "The Week"'} value={multiStep.watchPartyName} onChange={e => {
                    setMultiStep({...multiStep, ...{watchPartyName: e.currentTarget.value}})
                }}/>
            case 2:
                return <LockFunds onLocked={(lockTransactionId,slug) => setMultiStep({...multiStep, ...{lockTransactionId, watchPartySlug: slug}})} />
            case 3:
                return <Stack>
                    <Typography variant="h5">Well done ! You just created a watch party.</Typography>
                    <Typography>Now please invite people from your DAO, by sending them this participation link:</Typography>
                    <Link target="_blank" href={`${baseUrl}watchparties/${multiStep.watchPartySlug}`}>{`${baseUrl}watchparties/${multiStep.watchPartySlug}`}</Link>
                    <Typography>The page behind this link explains everything they need to know.</Typography>
                </Stack>
            default:
        }
    }
    
    return <Stack sx={{ height: '100%', flexGrow: 1, padding: '0.5rem'}}>
        { largeScreen && [<Stepper key="stepper">
            <Step completed={true}>
                <StepLabel>Dates</StepLabel>
            </Step>
            <Step completed={multiStep.currentStep > 0}>
                <StepLabel>Name</StepLabel>
            </Step>
            <Step completed={multiStep.currentStep > 1}>
                <StepLabel>Lock funds</StepLabel>
            </Step>
            <Step completed={multiStep.currentStep > 2}>
                <StepLabel>Invitations</StepLabel>
            </Step>
        </Stepper>,
        <Stack key="stepperButtons" direction='row' sx={{ justifyContent: 'space-between', padding: '1rem' }}>
            {getBackButton}
            {getNextButton}
        </Stack>] }
        <Box sx={{ flexGrow: 1 }}>
            {getCurrentStepComponent(multiStep.currentStep)}
        </Box>
        {!largeScreen && <MobileStepper
            variant="dots"
            steps={multiStep.numberOfSteps}
            activeStep={multiStep.currentStep}
            position="static"
            sx={{ flexGrow: 0 }}
            nextButton={getNextButton}
            backButton={getBackButton}/>}
    </Stack>
}