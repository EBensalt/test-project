import useAuth from "@modules/auth/hooks/api/useAuth";
import { Box, Button, Card, Dialog, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import api from "./api";

interface CreateProps {
	onSuccess?: () => void;
}

export default function Create({ onSuccess }: CreateProps) {
	const [open, setOpen] = useState(false);
  	const [data, setData] = useState({ title: "", date: dayjs(), location: "", max_participants: 1, description: ""});
  	const { user } = useAuth();

	function openDialog() {
		setOpen(true);
	}
	function closeDialog() {
		setOpen(false);
	}
	function changeText(event: React.ChangeEvent<HTMLInputElement>) {
		setData({...data, [event.target.name]: event.target.value});
	}
	function chageDate(event: Dayjs | null) {
		setData({...data, date: event ?? dayjs()});
	}
	async function addEvent() {
		const mp = Number(data.max_participants) || 1;

		try {
		  await api.post("/events", { ...data, max_participants: mp });

		  closeDialog();
		  onSuccess?.();
		} catch (e) {
		  if (axios.isAxiosError(e))
			console.log(e.response?.data);
		}
	}

	return <>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
    		  <Button variant="outlined" onClick={openDialog}>
    		    create an event
    		  </Button>
    		</Box>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Dialog open={open} maxWidth="xs" fullWidth>
				<Card sx={{ padding: "10px", display: 'flex', flexDirection: "column", gap: "10px", width: "100%" }} >
				<TextField
					id="outlined-basic"
					label="Title"
					name='title'
					variant="outlined"
					value={data.title}
					onChange={changeText}
				/>
				<DatePicker label="Date" value={data.date} onChange={chageDate} />
				<TextField
					name='location'
					id="outlined-basic"
					label="Location"
					variant="outlined"
					value={data.location}
					onChange={changeText}
				/>
				<TextField
					name='max_participants'
					id="outlined-basic"
					label="Maximum number of participants"
					variant="outlined"
					type="number"
					value={data.max_participants}
					onChange={changeText}
				/>
				<TextField
					name='description'
					id="outlined-basic"
					label="Description"
					variant="outlined"
					multiline
					value={data.description}
					onChange={changeText}
				/>
				<Box sx={{ display: 'flex', justifyContent: "center", gap: "10px" }}>
					<Button variant="outlined" onClick={addEvent}>Save</Button>
					<Button variant="outlined" color='error' onClick={closeDialog}>Cancel</Button>
				</Box>
				</Card>
			</Dialog>
			</LocalizationProvider>
	</>
}