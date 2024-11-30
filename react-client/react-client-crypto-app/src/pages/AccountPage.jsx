import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNotifications } from '@toolpad/core/useNotifications';
import {
    Typography,
    Box,
    Paper,
    Stack,
    IconButton,
    Alert,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Avatar,
    Grid2,
    Divider,
    Button,
    Select,
    MenuItem,
    TextField

} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';


export default function AccountPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [persistAlerts, setPersistAlerts] = useState(() => {
        const saved = localStorage.getItem('persistAlerts');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('persistAlerts', JSON.stringify(persistAlerts));
    }, [persistAlerts]);

    // Add new state for email notifications
    const [emailNotifications, setEmailNotifications] = useState(() => {
        const saved = localStorage.getItem('emailNotifications');
        return saved ? JSON.parse(saved) : false;
    });

    // Save preference to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('emailNotifications', JSON.stringify(emailNotifications));
    }, [emailNotifications]);


    const [editingAlert, setEditingAlert] = useState(null);
    const [editForm, setEditForm] = useState({ threshold: '', condition: 'greater' });
    const notifications = useNotifications();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('session');
        navigate('/login');
    };

    const handleEdit = (alert) => {
        setEditingAlert(alert.id);
        setEditForm({
            threshold: alert.threshold,
            condition: alert.condition
        });
    };

    const handleCancelEdit = () => {
        setEditingAlert(null);
        setEditForm({ threshold: '', condition: 'greater' });
    };

    const handleUpdateAlert = async (cryptoId, alertId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/alerts/${alertId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify({
                    cryptoId,
                    threshold: parseFloat(editForm.threshold),
                    condition: editForm.condition,
                    userId: session.user.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update alert');
            }

            const updatedAlerts = alerts.map(alert =>
                alert.id === alertId
                    ? { ...alert, ...editForm }
                    : alert
            );

            setAlerts(updatedAlerts);
            setEditingAlert(null);
            notifications.show('Alert updated successfully', {
                severity: 'success',
                autoHideDuration: 3000
            });
        } catch (err) {
            notifications.show('Failed to update alert', {
                severity: 'error',
                autoHideDuration: 3000
            });
        }
    };



    const session = JSON.parse(localStorage.getItem('session'));
    const fetchAlerts = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/alerts/${session.user.id}`, {
                headers: {
                    'Authorization': `Bearer ${session.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch alerts');
            }

            const data = await response.json();
            setAlerts(data);
        } catch (err) {
            setError('Failed to load alerts');
            notifications.show('Failed to load alerts', {
                severity: 'error',
                autoHideDuration: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAlert = async (alertId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/alerts/${alertId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete alert');
            }

            setAlerts(alerts.filter(alert => alert.id !== alertId));
            notifications.show('Alert deleted successfully', {
                severity: 'success',
                autoHideDuration: 3000
            });
        } catch (err) {
            notifications.show('Failed to delete alert', {
                severity: 'error',
                autoHideDuration: 3000
            });
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    function capitalizeFirstLetter(val) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                My Details
            </Typography>
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid2 container spacing={3} alignItems="center">
                    <Grid2>
                        <Avatar
                            sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                            src={session.user.avatarUrl}
                        >
                            <PersonIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                    </Grid2>
                    <Grid2>
                        <Typography variant="h5" gutterBottom>
                            {session.user.name || 'Loading...'}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                            {session.user.email}
                        </Typography>

                    </Grid2>
                    <Grid2>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </Grid2>
                </Grid2>
            </Paper>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h4" gutterBottom>
                Settings
            </Typography>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={persistAlerts}
                        onChange={(e) => setPersistAlerts(e.target.checked)}
                    />
                }
                label="Keep alerts after price check (don't auto-delete)"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                }
                label="Send email notifications for triggered alerts"
            />

            <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
                My Price Alerts
            </Typography>

            {alerts.length === 0 ? (
                <Alert severity="info">You don't have any active price alerts</Alert>
            ) : (
                <Stack spacing={2}>
                    {alerts.map((alert) => (
                        <Paper key={alert.id} sx={{ p: 2 }}>
                            {editingAlert === alert.id ? (
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Select
                                        size="small"
                                        value={editForm.condition}
                                        onChange={(e) => setEditForm(prev => ({
                                            ...prev,
                                            condition: e.target.value
                                        }))}
                                    >
                                        <MenuItem value="greater">Above</MenuItem>
                                        <MenuItem value="lesser">Below</MenuItem>
                                    </Select>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={editForm.threshold}
                                        onChange={(e) => setEditForm(prev => ({
                                            ...prev,
                                            threshold: e.target.value
                                        }))}
                                    />
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleUpdateAlert(alert.cryptoId, alert.id)}
                                    >
                                        <SaveIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={handleCancelEdit}
                                    >
                                        <CancelIcon />
                                    </IconButton>
                                </Stack>
                            ) : (
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography flex={1}>
                                        {capitalizeFirstLetter(alert.cryptoId)} - {alert.condition === 'greater' ? 'Above' : 'Below'} ${alert.threshold}
                                    </Typography>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleEdit(alert)}
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteAlert(alert.id)}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Stack>
                            )}
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
}