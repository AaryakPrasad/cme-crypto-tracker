import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSession } from '../SessionContext'; // Import useSession

import {
    TextField,
    Button,
    Container,
    Box,
    Typography,
    Alert,
    Paper
} from '@mui/material';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setSession } = useSession(); // Use the session context

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/signup', formData);
            const token = response.data.token;

            // Set up axios default header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Store session data
            const sessionData = {
                token,
                user: {
                    id: response.data.id,
                    name: response.data.username,
                    email: response.data.email
                },
                isAuthenticated: true
            };

            // Update session context
            setSession(sessionData);

            // Store in localStorage for persistence
            localStorage.setItem('session', JSON.stringify(sessionData));

            navigate('/');
        } catch (err) {
            setError('Signup failed. Please try again.');
            console.error('Signup error:', err);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{
            display: 'flex',
            minHeight: '100vh',  // Full viewport height
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Paper
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 4,
                }}
            >
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                    Create your account
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </Button>
                    <Box textAlign="center">
                        <Link
                            to="/login"
                            style={{
                                color: '#1976d2',
                                textDecoration: 'none'
                            }}>
                            Already have an account? Sign in
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Signup;