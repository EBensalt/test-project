import useAuth from '@modules/auth/hooks/api/useAuth';
import { Box, Button, Card, CardActions, CardContent, Chip, Grid, Typography } from '@mui/material';
import dayjs from 'dayjs';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from './api';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  maxParticipants: number;
  userId: number;
  user: { id: number; email: string };
  participantsCount: number;
  isParticipating: boolean;
}

interface ListDataProps {
  data: Event[];
  fetchData: () => Promise<void>;
}

const ListData: React.FC<ListDataProps> = ({ data, fetchData }) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const handleError = useCallback(
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data.message) {
        enqueueSnackbar(error.response.data.message, {
          variant: 'error',
          autoHideDuration: 5000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
      }
    },
    [enqueueSnackbar]
  );

  const participate = useCallback(
    async (eventId: number) => {
      try {
        const response = await api.post(`/events/${eventId}/participate`);
        if (response.data.status) {
          await fetchData();
        }
      } catch (error) {
        handleError(error);
      }
    },
    [fetchData, handleError]
  );

  const cancelEvent = useCallback(
    async (eventId: number) => {
      try {
        const response = await api.post(`/events/${eventId}/cancel`);
        if (response.data.status) {
          await fetchData();
        }
      } catch (error) {
        handleError(error);
      }
    },
    [fetchData, handleError]
  );

  const cancelParticipation = useCallback(
    async (eventId: number) => {
      try {
        const response = await api.delete(`/events/${eventId}/participate`);
        if (response.data.status) {
          await fetchData();
        }
      } catch (error) {
        handleError(error);
      }
    },
    [fetchData, handleError]
  );

  const renderActionButton = useCallback(
    (event: Event) => {
      if (event.userId === user?.id) {
        return (
          <Button variant="contained" color="error" onClick={() => cancelEvent(event.id)}>
            Cancel event
          </Button>
        );
      }

      if (!event.isParticipating && event.participantsCount < event.maxParticipants) {
        return (
          <Button variant="contained" color="primary" onClick={() => participate(event.id)}>
            Participate
          </Button>
        );
      }

      if (event.isParticipating) {
        return (
          <Button variant="contained" color="error" onClick={() => cancelParticipation(event.id)}>
            Cancel participation
          </Button>
        );
      }

      return null;
    },
    [user?.id, cancelEvent, participate, cancelParticipation]
  );

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {data?.map((event) => (
        <Grid item xs={12} md={6} lg={4} key={event.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: '10px', justifyItems: 'center', mt: 0 }}>
                  <Typography variant="h6">{event.title}</Typography>
                  <Box sx={{ mt: '2px' }}>
                    {event.userId === user?.id ? (
                      <Chip label="Organizer" color="primary" size="small" sx={{ mr: 1 }} />
                    ) : (
                      event.isParticipating && (
                        <Chip label="Participating" color="secondary" size="small" />
                      )
                    )}
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
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  minHeight: '60px',
                  maxHeight: '120px',
                  overflow: 'auto',
                }}
              >
                {event.description || 'No Description'}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              {renderActionButton(event)}
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ListData;
