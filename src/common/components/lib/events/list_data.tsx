import useAuth from "@modules/auth/hooks/api/useAuth";
import { Box, Button, Card, CardActions, CardContent, Chip, Grid, Typography } from "@mui/material";
import dayjs from "dayjs";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from "./api";
import axios from "axios";
import { useSnackbar } from "notistack";

export default function ListData({ data, fetchData }: { data: {
	id: number,
	title: string,
	description: string,
	date: string,
	location: string,
	maxParticipants: number,
	userId: number,
	user: { id: number, email: string },
	participantsCount: number,
	isParticipating: boolean
}[], fetchData(): Promise<void> }) {
	const { user } = useAuth();
	const { enqueueSnackbar } = useSnackbar();

	async function participate(eventId: number) {
		try {
		  const response = await api.post(`/events/${eventId}/participate`);
	
		  if (response.data.status)
			await fetchData();
		} catch (e) {
		  if (axios.isAxiosError(e))
		  	enqueueSnackbar(e.response?.data.message, {
				variant: 'error',
				autoHideDuration: 5000,
				anchorOrigin: {
				  vertical: 'top',
				  horizontal: 'right'
				}
			  })
		}
	}
	async function cancelEvent(eventId: number) {
		try {
		  const response = await api.post(`/events/${eventId}/cancel`);
	
		  if (response.data.status)
			await fetchData();
		} catch (e) {
		  if (axios.isAxiosError(e))
			enqueueSnackbar(e.response?.data.message, {
				variant: 'error',
				autoHideDuration: 5000,
				anchorOrigin: {
				  vertical: 'top',
				  horizontal: 'right'
				}
			  })
		}
	}
	async function cancelParticipation(eventId: number) {
		try {
		  const response = await api.delete(`/events/${eventId}/participate`);
	
		  if (response.data.status)
			await fetchData();
		} catch (e) {
		  if (axios.isAxiosError(e))
			enqueueSnackbar(e.response?.data.message, {
				variant: 'error',
				autoHideDuration: 5000,
				anchorOrigin: {
				  vertical: 'top',
				  horizontal: 'right'
				}
			  })
		}
	}

	return (
		<Grid container spacing={2} sx={{ mt: 2 }}>
		{data?.map((event) => (
			<Grid item xs={12} md={6} lg={4} key={event.id}>
			<Card sx={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
				<CardContent sx={{ flexGrow: 1 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
					<Box sx={{ display: "flex", gap: "10px", justifyItems: "center", mt: 0 }}>
					<Typography variant="h6">{event.title}</Typography>
					<Box sx={{ mt: "2px" }}>
						{event.userId === user?.id ?
						<Chip 
							label="Organizer" 
							color="primary" 
							size="small" 
							sx={{ mr: 1 }}
						/> :
						(event.isParticipating && <Chip 
							label="Participating" 
							color="secondary" 
							size="small"
						/>)
						}
					</Box>
					</Box>
					<Typography variant="body2" color="text.secondary">
					{dayjs(event.date).format('MMM D, YYYY')}
					</Typography>
				</Box>
				
				<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
					<LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
					<Typography variant="body2">{event.location}</Typography>
				</Box>
				<Box sx={{ mb: 2 }}>
					<Typography variant="body2" color="text.secondary">
					Organizer: {event.user.email}
					</Typography>
					<Typography variant="body2" color="text.secondary">
					Participants: {event.participantsCount}/{event.maxParticipants}
					</Typography>
				</Box>
				<Typography variant="body2" color="text.secondary" sx={{
					whiteSpace: 'pre-wrap',
    				overflowWrap: 'break-word',
    				minHeight: '60px',
    				maxHeight: '120px',
    				overflow: 'auto'
				}}>
					{event.description || "No Description"}
				</Typography>
				</CardContent>
				
				<CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
				{(!event.isParticipating && event.userId != user?.id) ?
					(event.participantsCount != event.maxParticipants &&
						<Button variant="contained" color="primary" onClick={() => participate(event.id)}>
							Participate
						</Button>) :
					(event.userId == user?.id ?
						<Button variant="contained" color="error" onClick={() => cancelEvent(event.id)}>
						Cancel event
						</Button> :
						<Button variant="contained" color="error" onClick={() => cancelParticipation(event.id)}>
						Cancel participation
						</Button>)
				}
				</CardActions>
			</Card>
			</Grid>
		))}
		</Grid>
	)
}