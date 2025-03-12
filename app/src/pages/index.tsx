import Create from '@common/components/lib/events/create';
import PageHeader from '@common/components/lib/partials/PageHeader';
import Routes from '@common/defs/routes';
import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import { Accordion, AccordionSummary, Avatar, Box, Button, Card, CardActions, CardContent, Chip, Grid, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import axios from 'axios';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import api from '@common/components/lib/events/api';
import useAuth from '@modules/auth/hooks/api/useAuth';
import laravelEcho from 'src/lib/echo';
import { useSnackbar } from 'notistack';
import ListData from '@common/components/lib/events/list_data';

interface EventCreatedData {
  event: {
    id: number;
    title: string;
    date: string;
    location: string;
    description: string;
    maxParticipants: number;
    userId: number;
  };
}

const Index: NextPage = () => {
  const { t } = useTranslation(['home']);
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
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

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (laravelEcho) {
      laravelEcho.channel("event-created").listen("EventCreated", (data: EventCreatedData) => {
        const { event } = data;
        const formattedDate = dayjs(event.date).format('MMM D, YYYY [at] h:mm A');
        
        enqueueSnackbar(
          <Typography>
            New event: <strong>{event.title}</strong>
            <br />
            📅 {formattedDate}
            <br />
            📍 {event.location}
          </Typography>, 
          {
            variant: 'success',
            autoHideDuration: 5000,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right'
            }
          }
        );
        fetchData();
      });
      laravelEcho.channel("event-deleted").listen("EventDeleted", (data: EventCreatedData) => {
        const { event } = data;
        const formattedDate = dayjs(event.date).format('MMM D, YYYY [at] h:mm A');
        
        enqueueSnackbar(
          <Typography>
            <strong>{event.title}</strong> has been canceled.
            <br />
            📅 {formattedDate}
            <br />
            📍 {event.location}
          </Typography>, 
          {
            variant: "error",
            autoHideDuration: 5000,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right'
            }
          }
        );
        fetchData();
      })
    }
    return () => {
      if (laravelEcho) {
        laravelEcho.leave("event-created");
        laravelEcho.leave("event-deleted");
      }
    }
  }, []);
  useEffect(() => {
    if (laravelEcho && user?.id) {
      laravelEcho.private(`event_participation.${user?.id}`)
        .listen('EventParticipation', (data: any) => {
            const { event, participant, participants_count } = data;

            enqueueSnackbar(
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box>
                  <strong>{participant.email}</strong> joined your event
                  <br />
                  🎯 <strong>{event.title}</strong>
                  <br />
                  👥 Total participants: {participants_count}/{event.max_participants}
                </Box>
              </Box>, {
                autoHideDuration: 5000,
                variant: "success",
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                }
            });
            fetchData();
        });
      laravelEcho.private(`event_participation_cancelled.${user?.id}`)
        .listen('EventParticipationCancelled', (data: any) => {
            const { event, participant, participants_count } = data;

            enqueueSnackbar(
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box>
                  <strong>{participant.email}</strong> left your event
                  <br />
                  🎯 <strong>{event.title}</strong>
                  <br />
                  👥 Total participants: {participants_count}/{event.max_participants}
                </Box>
              </Box>, {
                autoHideDuration: 5000,
                variant: "error",
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                }
            });
            fetchData();
        });
    }
    return () => {
      if (laravelEcho) {
        laravelEcho.leave(`event_participation_cancelled.${user?.id}`);
        laravelEcho.leave(`event_participation.${user?.id}`);
      }
    }
  }, [user?.id]);

  async function fetchData() {
    try {
      const response = await api.get(`/events`);

      setData(response.data.data)
    } catch (e) {
      if (axios.isAxiosError(e))
        console.log(e.response?.data);
    }
  }

  return (
    <>
      <PageHeader title={t('home:dashboard')} />
      <Create onSuccess={fetchData} />
      <ListData data={data} fetchData={fetchData} />
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
