import Create from '@common/components/lib/events/create';
import PageHeader from '@common/components/lib/partials/PageHeader';
import Routes from '@common/defs/routes';
import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import { ListItemButton, ListItemText } from '@mui/material';
import axios from 'axios';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Index: NextPage = () => {
  const { t } = useTranslation(['home']);
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/events`);

      console.log(response.data.data)
      setData(response.data.data)
    }
    fetchData();
  }, []);

  return (
    <>
      <PageHeader title={t('home:dashboard')} />
      <Create />
      {
        data?.map((e) => (
          <ListItemButton key={e.id} component="a" href="#simple-list">
            <ListItemText primary={e.title} />
          </ListItemButton>
        ))
      }
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
