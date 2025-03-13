import { Box, Button, Card, Dialog, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useCallback } from 'react';
import api from './api';
import { useSnackbar } from 'notistack';

interface CreateProps {
  onSuccess?: () => void;
}

const Create: React.FC<CreateProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    title: '',
    date: dayjs(),
    location: '',
    max_participants: 1,
    description: '',
  });
  const { enqueueSnackbar } = useSnackbar();

  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const changeText = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }, []);

  const changeDate = useCallback((event: Dayjs | null) => {
    setData((prev) => ({ ...prev, date: event ?? dayjs() }));
  }, []);

  const addEvent = useCallback(async () => {
    const mp = Number(data.max_participants) || 1;

    try {
      await api.post('/events', { ...data, max_participants: mp });
      closeDialog();
      setData({ title: '', date: dayjs(), location: '', max_participants: 1, description: '' });
      onSuccess?.();
    } catch (e) {
      if (axios.isAxiosError(e)) {
        Object.entries(e.response?.data.error).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((message) => {
              enqueueSnackbar(`${field}: ${message}`, { variant: 'error' });
            });
          } else {
            enqueueSnackbar(`${field}: ${messages}`, { variant: 'error' });
          }
        });
      }
    }
  }, [data, onSuccess, enqueueSnackbar]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        addEvent();
      }
      if (event.key === 'Escape' && !event.shiftKey) {
        event.preventDefault();
        closeDialog();
      }
    },
    [addEvent, closeDialog]
  );

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" onClick={openDialog}>
          Create an Event
        </Button>
      </Box>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog open={open} maxWidth="xs" fullWidth>
          <Card
            component="form"
            onKeyDown={handleKeyDown}
            sx={{
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '100%',
            }}
          >
            <TextField
              label="Title"
              name="title"
              variant="outlined"
              value={data.title}
              onChange={changeText}
            />
            <DatePicker label="Date" value={data.date} onChange={changeDate} />
            <TextField
              name="location"
              label="Location"
              variant="outlined"
              value={data.location}
              onChange={changeText}
            />
            <TextField
              name="max_participants"
              label="Maximum number of participants"
              variant="outlined"
              type="number"
              value={data.max_participants}
              onChange={changeText}
            />
            <TextField
              name="description"
              label="Description"
              variant="outlined"
              multiline
              value={data.description}
              onChange={changeText}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <Button variant="outlined" onClick={addEvent}>
                Save
              </Button>
              <Button variant="outlined" color="error" onClick={closeDialog}>
                Cancel
              </Button>
            </Box>
          </Card>
        </Dialog>
      </LocalizationProvider>
    </>
  );
};

export default Create;
