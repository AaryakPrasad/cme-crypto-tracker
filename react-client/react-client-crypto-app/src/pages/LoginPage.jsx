import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../SessionContext';
import { useSessionStorageState } from '@toolpad/core';
import axios from 'axios';
import {
    TextField,
    Button,
    Container,
    Box,
    Typography,
    Alert,
    Paper
} from '@mui/material';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setSession } = useSession();
    const [sessionData, setSessionData] = useSessionStorageState('session', null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', formData);
            const token = response.data.token;

            // Set up axios default header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Store session data
            const sessionData = {
                token,
                user: {
                    id: response.data.id.toString(),
                    name: response.data.username,
                    email: response.data.email
                },
                isAuthenticated: true
            };

            // Update session context
            setSession(sessionData);

            setSessionData(sessionData);

            window.sessionStorage.setItem('session', JSON.stringify(sessionData));
            // Store in localStorage for persistence
            localStorage.setItem('session', JSON.stringify(sessionData));


            navigate('/app/dashboard');
        } catch (err) {
            setError('Login failed. Please check your credentials.');
            console.error('Login error:', err);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Paper
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 4
                }}
            >
                {/* <Paper elevation={3} sx={{ p: 4, width: '100%' }}></Paper> */}
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                    Sign in to your account
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
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    <Box textAlign="center">
                        <Link
                            to="/signup"
                            style={{
                                color: '#1976d2',
                                textDecoration: 'none'
                            }}>Don't have an account? Sign up
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;