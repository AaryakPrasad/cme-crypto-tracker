import { useState, useEffect } from 'react';
import { useNotifications } from '@toolpad/core/useNotifications';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    CircularProgress,
    Alert,
    TextField,
    FormControl,
    Select,
    MenuItem,
    IconButton,
    Grid2 as Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDialogs } from '@toolpad/core';
import { CryptoDialog } from '../components/CryptoDialog';


const CryptoList = () => {
    const [cryptoData, setCryptoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const dialogs = useDialogs();
    const notifications = useNotifications();

    const filteredCryptoData = cryptoData.filter(crypto =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const checkAlerts = async (cryptoData) => {
        try {
            const session = JSON.parse(localStorage.getItem('session'));
            const emailNotifications = JSON.parse(localStorage.getItem('emailNotifications') || 'false');

            const alertsResponse = await fetch(`http://localhost:8080/api/alerts/${session.user.id}`, {
                headers: {
                    'Authorization': `Bearer ${session.token}`
                }
            });

            if (!alertsResponse.ok) {
                throw new Error('Failed to fetch alerts');
            }

            const alerts = await alertsResponse.json();
            const persistAlerts = JSON.parse(localStorage.getItem('persistAlerts') || 'false');

            // Track triggered alerts for email
            const triggeredAlerts = [];
            triggeredAlerts.push(`Hi ${session.user.name}!\n\nThe following crypto alerts have been triggered:`);
            // Check each alert
            for (const alert of alerts) {
                const crypto = cryptoData.find(c => c.id === alert.cryptoId);
                if (crypto) {
                    const currentPrice = crypto.current_price;
                    const isTriggered = alert.condition === 'greater'
                        ? currentPrice > alert.threshold
                        : currentPrice < alert.threshold;

                    if (isTriggered) {
                        const message = `Price of ${crypto.name} is ${alert.condition === 'greater' ? 'above' : 'below'} the threshold (${alert.threshold})`;
                        triggeredAlerts.push(message);

                        notifications.show(message, {
                            severity: 'warning',
                            autoHideDuration: 3000
                        });

                        if (!persistAlerts) {
                            try {
                                await fetch(`http://localhost:8080/api/alerts/${alert.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${session.token}`
                                    }
                                });
                            } catch (deleteError) {
                                console.error(`Failed to delete alert ${alert.id}:`, deleteError);
                            }
                        }
                    }
                }
            }

            // Send email if notifications are enabled and there are triggered alerts
            if (emailNotifications && triggeredAlerts.length > 0) {
                const emailResponse = await fetch('http://localhost:8080/api/mail/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.token}`
                    },
                    body: JSON.stringify({
                        to: session.user.email,
                        subject: 'Crypto Price Alerts',
                        text: triggeredAlerts.join('\n\n')
                    })
                });

                if (!emailResponse.ok) {
                    throw new Error('Failed to send email notification');
                }
            }
        } catch (error) {
            console.error('Failed to check alerts:', error);
        }
    };

    const fetchCryptoData = async (isManualRefresh = false) => {
        setLoading(true);
        try {
            const response = await fetch(
                'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc',
                {
                    headers: {
                        'x-cg-demo-api-key': import.meta.env.VITE_COIN_GECKO_API_KEY
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch crypto data');
            }

            const data = await response.json();
            setCryptoData(data);

            // Check alerts after updating crypto data
            await checkAlerts(data);

            if (isManualRefresh) {
                notifications.show('Data refreshed successfully', {
                    autoHideDuration: 2000,
                    severity: 'success'
                });
            }
        } catch (err) {
            setError(err.message);
            notifications.show('Failed to refresh data', {
                autoHideDuration: 2000,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCryptoData(false);
    }, []);

    const handleRefresh = () => {
        fetchCryptoData(true); // Pass true for manual refresh
    };

    const handleCryptoClick = (crypto) => {
        dialogs.open(CryptoDialog, { crypto });
    };

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

    const GRID_SPACING = {
        // Adjust grid spacing for different breakpoints
        xs: {
            coin: '50%',
            price: '50%',
        },
        sm: {
            index: '10%',
            coin: '30%',
            price: '30%',
            change: '30%',
        },
        md: {
            index: '10%',
            coin: '20%',
            price: '20%',
            change: '20%',
            marketCap: '20%',
            button: '10%'
        }
    };

    // In the return statement, update the Grid components:

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h4" gutterBottom>
                All Cryptocurrencies
            </Typography>

            <TextField
                fullWidth
                placeholder="Search cryptocurrency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />

            {/* Header */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, borderTop: 1, borderBottom: 1, mb: 2, borderColor: 'grey.500' }}>
                <Grid container sx={{
                    backgroundColor: 'background.paper',

                    borderRadius: 1,
                    alignItems: 'center'
                }}>
                    <Grid item sx={{ width: GRID_SPACING.md.index }}>
                        <Typography>#</Typography>
                    </Grid>
                    <Grid item sx={{ width: GRID_SPACING.md.coin }}>
                        <Typography>Coin</Typography>
                    </Grid>
                    <Grid item sx={{ width: GRID_SPACING.md.price }}>
                        <Typography>Price</Typography>
                    </Grid>
                    <Grid item sx={{ width: GRID_SPACING.md.change }}>
                        <Typography>24h Change</Typography>
                    </Grid>
                    <Grid item sx={{ width: GRID_SPACING.md.marketCap }}>
                        <Typography>Market Cap</Typography>
                    </Grid>
                    <Grid item sx={{ width: GRID_SPACING.md.button }}>
                        <IconButton
                            onClick={handleRefresh}
                            disabled={loading}
                            color="primary"
                            sx={{ ml: 3 }}
                        >
                            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                        </IconButton>
                    </Grid>
                </Grid>
            </Box>
            {/* Refresh button for mobile */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end', mb: 2 }}>
                <IconButton
                    onClick={handleRefresh}
                    disabled={loading}
                    color="primary"
                >
                    {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                </IconButton>
            </Box>

            {filteredCryptoData.map((crypto, index) => (
                <Paper
                    key={crypto.id}
                    sx={{
                        p: { xs: 1, sm: 2 },
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: 'action.hover'
                        }
                    }}
                    onClick={() => handleCryptoClick(crypto)}
                >
                    <Grid container sx={{ alignItems: 'center' }}>
                        {/* Mobile Layout */}
                        <Grid container sx={{ display: { xs: 'flex', md: 'none' }, width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Grid item sx={{ width: GRID_SPACING.xs.coin, pr: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar src={crypto.image} alt={crypto.name} sx={{ width: 24, height: 24 }} />
                                    <Typography>{crypto.name}</Typography>
                                </Box>
                            </Grid>
                            <Grid item sx={{ width: GRID_SPACING.xs.price }}>
                                <Typography sx={{ textAlign: 'right' }} >${crypto.current_price.toLocaleString()}</Typography>
                                <Typography sx={{
                                    color: crypto.price_change_percentage_24h > 0 ? 'success.main' : 'error.main',
                                    fontSize: '0.875rem',
                                    textAlign: 'right'
                                }}>
                                    {crypto.price_change_percentage_24h.toFixed(2)}%
                                </Typography>
                            </Grid>
                        </Grid>


                        {/* Desktop Layout */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, width: '100%' }}>
                            <Grid item sx={{ width: GRID_SPACING.md.index }}>
                                <Typography>{index + 1}</Typography>
                            </Grid>
                            <Grid item sx={{ width: GRID_SPACING.md.coin }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar src={crypto.image} alt={crypto.name} sx={{ width: 24, height: 24 }} />
                                    <Typography>{crypto.name}</Typography>
                                </Box>
                            </Grid>
                            <Grid item sx={{ width: GRID_SPACING.md.price }}>
                                <Typography>${crypto.current_price.toLocaleString()}</Typography>
                            </Grid>
                            <Grid item sx={{ width: GRID_SPACING.md.change }}>
                                <Typography sx={{
                                    color: crypto.price_change_percentage_24h > 0 ? 'success.main' : 'error.main'
                                }}>
                                    {crypto.price_change_percentage_24h.toFixed(2)}%
                                </Typography>
                            </Grid>
                            <Grid item sx={{ width: GRID_SPACING.md.marketCap }}>
                                <Typography>${crypto.market_cap.toLocaleString()}</Typography>
                            </Grid>
                        </Box>
                    </Grid>
                </Paper>
            ))}
        </Box>
    );

};

export default CryptoList;