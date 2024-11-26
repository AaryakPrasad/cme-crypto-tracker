import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { createTheme } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '../SessionContext';

const BRANDING = {
    title: 'Crypto Tracker',
};

const newTheme = createTheme({
    cssVariables: {
        colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: { light: true, dark: true },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
});

const providers = [{ id: 'credentials', name: 'Email and Password' }];

export default function CredentialsSignInPage() {
    const { setSession } = useSession();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const signIn = async (provider, formData) => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.get('email'),
                    password: formData.get('password'),
                }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            // Store auth data in session
            setSession({
                user: {
                    id: data.id,
                    email: data.email,
                    username: data.username,
                    roles: data.roles
                },
                accessToken: data.accessToken,
                tokenType: data.tokenType
            });

            // Redirect to callback URL or dashboard
            navigate(callbackUrl);

        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <AppProvider theme={newTheme} branding={BRANDING}>
            <SignInPage signIn={signIn} providers={providers} sx={{ mx: { xl: 90 } }} />
        </AppProvider>
    );
}