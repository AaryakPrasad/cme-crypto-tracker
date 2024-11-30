import * as React from 'react';
import { NotificationsProvider } from '@toolpad/core/useNotifications';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import PermIdentityIcon from '@mui/icons-material/PermIdentity'; import { AppProvider } from '@toolpad/core/react-router-dom';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navigation, Session } from '@toolpad/core';
import { SessionContext } from './SessionContext';
import { createTheme } from '@mui/material/styles';

const NAVIGATION: Navigation = [
  {
    segment: 'app/dashboard',
    title: '',
    icon: <CurrencyBitcoinIcon />,
  },
  {
    segment: 'app/account',
    title: '',
    icon: <PermIdentityIcon />,
  },
];

const newTheme = createTheme({
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 300,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

const BRANDING = {
  title: 'Crypto Tracker',
};

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const navigate = useNavigate();

  const signIn = React.useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const signOut = React.useCallback(() => {
    setSession(null);
    navigate('/login');
  }, [navigate]);

  const sessionContextValue = React.useMemo(() => ({ session, setSession }), [session, setSession]);

  return (
    <NotificationsProvider>
      <SessionContext.Provider value={sessionContextValue}>
        <AppProvider
          navigation={NAVIGATION}
          branding={BRANDING}
          theme={newTheme}
          session={session}
          authentication={{ signIn, signOut }}
        >
          <Outlet />
        </AppProvider>
      </SessionContext.Provider>
    </NotificationsProvider>
  );
}
