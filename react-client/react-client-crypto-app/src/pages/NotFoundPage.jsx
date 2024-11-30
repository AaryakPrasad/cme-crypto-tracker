import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <Container>
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
                <Typography variant="h1">404</Typography>
                <Typography variant="h4">Page Not Found</Typography>
                <Typography color="text.secondary">
                    The page you're looking for doesn't exist or has been moved.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Go to Home
                </Button>
            </Box>
        </Container>
    );
}