import Create from '@common/components/lib/events/create';
import PageHeader from '@common/components/lib/partials/PageHeader';
import Routes from '@common/defs/routes';
import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import { Accordion, AccordionSummary, Box, Button, Card, CardActions, CardContent, Chip, Grid, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import axios from 'axios';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from '@common/components/lib/events/api';
import useAuth from '@modules/auth/hooks/api/useAuth';
import { laravelEcho } from 'src/lib/echo';

interface ErrorResponse {
  status: boolean;
  message: string;
  error: string | Record<string, string[]>;
}

const Index: NextPage = () => {
  const { t } = useTranslation(['home']);
  const [data, setData] = useState<{
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
  }[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    laravelEcho.channel("event-created").listen("EventCreated", (event: any) => {
      console.log(event.title);
    })
    return () => {
      laravelEcho.leave("event-created");
    }
  }, [])

  async function fetchData() {
    try {
      const response = await api.get(`/events`);

      // console.log(response.data.data);
      setData(response.data.data)
    } catch (e) {
      if (axios.isAxiosError(e))
        console.log(e.response?.data);
    }
  }
  async function participate(eventId: number) {
    try {
      const response = await api.post(`/events/${eventId}/participate`);

      console.log(response.data.data);
      if (response.data.status)
        await fetchData();
    } catch (e) {
      if (axios.isAxiosError(e))
        console.log(e.response?.data);
    }
  }


  return (
    <>
      <PageHeader title={t('home:dashboard')} />
      <Create onSuccess={fetchData} />
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

                <Typography variant="body2" color="text.secondary">
                  {event.description || "No Description"}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              {(!event.isParticipating && event.userId != user?.id) ?
                <Button variant="contained" color="primary" onClick={() => participate(event.id)}>
                  Participate
                </Button> :
                (event.userId == user?.id ?
                  <Button variant="contained" color="error">
                    Cancel event
                  </Button> :
                  <Button variant="contained" color="error">
                    Cancel participation
                  </Button>)
              }
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['topbar', 'footer', 'leftbar', 'home'])),
  },
});
export default withAuth(Index, {
  mode: AUTH_MODE.LOGGED_IN,
  redirectUrl: Routes.Auth.Login,
});
