import { Box, Button, Container, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 4
                }}
            >
                <CurrencyBitcoinIcon sx={{ fontSize: 80, color: 'primary.main' }} />

                <Typography variant="h2" component="h1" gutterBottom>
                    Crypto Tracker
                </Typography>

                <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                    Track cryptocurrency prices, set alerts, and manage your portfolio in one place
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/signup')}
                    >
                        Get Started
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </Button>
                </Stack>

                <Box sx={{ mt: 8 }}>
                    <Typography variant="h6" gutterBottom>
                        Key Features
                    </Typography>
                    <Stack spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
                        <Typography>• Real-time cryptocurrency price tracking</Typography>
                        <Typography>• Customizable price alerts</Typography>
                        <Typography>• Email notifications</Typography>
                        <Typography>• Interactive price charts</Typography>
                    </Stack>
                </Box>
            </Box>
        </Container>
    );
}