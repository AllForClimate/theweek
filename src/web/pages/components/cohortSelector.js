import { useState, useEffect } from 'react'
import { Stack, Typography, Card, CardContent, CardActions, Button, CircularProgress } from '@mui/material'
import {  DateTime, Interval } from 'luxon'
import { getAvailableCohorts } from '../lib/apiFacade'

export default function CohortSelector({value, onChange}) {
    const [cohorts, setCohorts] = useState(null)
    const dateFormatter = Intl.DateTimeFormat(navigator.languages,  { dateStyle: 'medium', timeStyle: 'short'})
    const shortDateFormatter = Intl.DateTimeFormat(navigator.languages,  { dateStyle: 'short', timeStyle: 'short'})

    useEffect(async () => {
        if(!cohorts) {
            const result = {
                thisWeek:[],
                nextWeek:[],
                later:[]                
            }
            const rawCohorts = await getAvailableCohorts()
            const endOfCurrentWeek = DateTime.now().endOf('week')
            rawCohorts.forEach(cohort => {
                const cohortEp1Datetime = DateTime.fromISO(cohort.datetimeEp1)
                if(cohortEp1Datetime.toJSDate() <= endOfCurrentWeek.toJSDate()) {
                    result.thisWeek.push(cohort)
                } else if(cohortEp1Datetime.toJSDate() <= endOfCurrentWeek.plus({ week: 1}).toJSDate()) {
                    result.nextWeek.push(cohort)
                } else {
                    result.later.push(cohort)
                }
            })
            setCohorts(result)
        }
    })

    const CohortOverPeriod = (title, cohorts, showIfEmpty, idxBasis) => {
        let result
        if(cohorts.length === 0){
            if(showIfEmpty) {
                result = [
                    <Typography key={`${idxBasis}1`} variant="h5">{title}</Typography>,
                    <Typography key={`${idxBasis}2`} variant="subtitle1">No cohort in this period</Typography>]
            } else {
                return []
            }
        } else {
            result = [
                <Typography key={`${idxBasis}1`} variant="h5">{title}</Typography>,
                <Stack key={`${idxBasis}2`} direction="row" spacing={1}>
                    {cohorts.sort((a,b) => new Date(a.datetimeEp1) - new Date(b.datetimeEp1)).map((cohort, idx) => {
                        return <Card key={idx}>
                            <CardContent>
                                <Typography variant="subtitle1">{dateFormatter.format(new Date(cohort.datetimeEp1))}</Typography>
                                <Typography variant="subtitle2">Ep2: {shortDateFormatter.format(new Date(cohort.datetimeEp2))}</Typography>
                                <Typography variant="subtitle2">Ep3: {shortDateFormatter.format(new Date(cohort.datetimeEp3))}</Typography>
                                <Typography variant="subtitle2">Join within: {Interval.fromDateTimes(new Date(), new Date(cohort.confirmationDeadline)).toDuration(['days', 'hours', 'minutes']).toHuman({ maximumFractionDigits: 0 })}</Typography>
                            </CardContent>
                            <CardActions sx={{justifyContent: 'center'}}>
                                <Button variant={value.includes(cohort._id) ? 'contained' : 'outlined'} onClick={() => {
                                    if(value.includes(cohort._id)) {
                                        onChange(value.filter(id => id != cohort._id))
                                    } else {
                                        onChange([...value, cohort._id])
                                    }
                                }}>{value.includes(cohort._id) ? 'Available' : 'Available ?'}</Button>
                            </CardActions>
                        </Card>
                    })}
                </Stack>]
        }
        return result
    }

    return (<Stack>
        <Typography variant="h4">Available cohorts</Typography>
        { cohorts &&
            [
                ...CohortOverPeriod('This week', cohorts.thisWeek, true, 1),
                ...CohortOverPeriod('Next week', cohorts.nextWeek, false, 2),
                ...CohortOverPeriod('Later', cohorts.later, true, 3),
                
            ]}
        { !cohorts && <CircularProgress />}
    </Stack>)
}