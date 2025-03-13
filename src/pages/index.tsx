import Create from '@common/components/lib/events/create';
import PageHeader from '@common/components/lib/partials/PageHeader';
import Routes from '@common/defs/routes';
import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import api from '@common/components/lib/events/api';
import useAuth from '@modules/auth/hooks/api/useAuth';
import laravelEcho from 'src/lib/echo';
import { useSnackbar } from 'notistack';
import ListData from '@common/components/lib/events/list_data';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  maxParticipants: number;
  userId: number;
  user: {
    id: number;
    email: string;
  };
  participantsCount: number;
  isParticipating: boolean;
}

interface EventCreatedData {
  event: Omit<Event, 'user' | 'participantsCount' | 'isParticipating'>;
}

interface ParticipationData {
  event: {
    title: string;
    maxParticipants: number;
  };
  participant: {
    email: string;
  };
  participantsCount: number;
}

const Index: NextPage = () => {
  const { t } = useTranslation(['home']);
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [events, setEvents] = useState<Event[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error('Failed to fetch events:', e.response?.data);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!laravelEcho) {
      return;
    }

    const handleEventCreated = (data: EventCreatedData) => {
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
            horizontal: 'right',
          },
        }
      );
      fetchData();
    };

    const handleEventDeleted = (data: EventCreatedData) => {
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
          variant: 'error',
          autoHideDuration: 5000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }
      );
      fetchData();
    };

    laravelEcho.channel('event-created').listen('EventCreated', handleEventCreated);
    laravelEcho.channel('event-deleted').listen('EventDeleted', handleEventDeleted);

    return () => {
      if (laravelEcho) {
        laravelEcho.leave('event-created');
        laravelEcho.leave('event-deleted');
      }
    };
  }, [enqueueSnackbar, fetchData]);

  useEffect(() => {
    if (!laravelEcho || !user?.id) {
      return;
    }

    const handleParticipation = (data: ParticipationData) => {
      const { event, participant, participantsCount } = data;

      enqueueSnackbar(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box>
            <strong>{participant.email}</strong> joined your event
            <br />
            🎯 <strong>{event.title}</strong>
            <br />
            👥 Total participants: {participantsCount}/{event.maxParticipants}
          </Box>
        </Box>,
        {
          variant: 'success',
          autoHideDuration: 5000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }
      );
      fetchData();
    };

    const handleParticipationCancelled = (data: ParticipationData) => {
      const { event, participant, participantsCount } = data;

      enqueueSnackbar(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box>
            <strong>{participant.email}</strong> left your event
            <br />
            🎯 <strong>{event.title}</strong>
            <br />
            👥 Total participants: {participantsCount}/{event.maxParticipants}
          </Box>
        </Box>,
        {
          variant: 'error',
          autoHideDuration: 5000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        }
      );
      fetchData();
    };

    laravelEcho
      .private(`event_participation.${user.id}`)
      .listen('EventParticipation', handleParticipation);

    laravelEcho
      .private(`event_participation_cancelled.${user.id}`)
      .listen('EventParticipationCancelled', handleParticipationCancelled);

    return () => {
      if (laravelEcho) {
        laravelEcho.leave(`event_participation.${user.id}`);
        laravelEcho.leave(`event_participation_cancelled.${user.id}`);
      }
    };
  }, [user?.id, enqueueSnackbar, fetchData]);

  return (
    <>
      <PageHeader title={t('home:dashboard')} />
      <Create onSuccess={fetchData} />
      <ListData data={events} fetchData={fetchData} />
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
