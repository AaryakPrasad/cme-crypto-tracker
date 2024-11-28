import React from 'react';
import { useState, useEffect } from 'react';
import { useNotifications } from '@toolpad/core/useNotifications';
import { Box, Stack, Typography, Paper, Avatar, CircularProgress, Alert, TextField, FormControl, Select, MenuItem, IconButton, Grid } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RefreshIcon from '@mui/icons-material/Refresh';
import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'; // Add this import


const CryptoList = () => {
    const [cryptoData, setCryptoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertErrors, setAlertErrors] = useState({});
    const [error, setError] = useState(null);
    const [alerts, setAlerts] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [alertConditions, setAlertConditions] = useState(() => {
        // Initialize with 'greater' as default for all cryptos
        const defaultConditions = {};
        cryptoData.forEach(crypto => {
            defaultConditions[crypto.id] = 'greater';
        });
        return defaultConditions;
    });
    const notifications = useNotifications();

    const filteredCryptoData = cryptoData.filter(crypto =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const fetchCryptoData = async (isManualRefresh = false) => {
        setLoading(true);
        try {
            // Fetch crypto data
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

            const newAlertConditions = {};
            data.forEach(crypto => {
                // Preserve existing conditions or set default
                newAlertConditions[crypto.id] = alertConditions[crypto.id] || 'greater';
            });
            setAlertConditions(newAlertConditions);

            // Fetch user alerts
            const session = JSON.parse(localStorage.getItem('session'));
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


            // Check each alert and delete after processing
            for (const alert of alerts) {
                const crypto = data.find(c => c.id === alert.cryptoId);
                if (crypto) {
                    const currentPrice = crypto.current_price;
                    const isTriggered = alert.condition === 'greater'
                        ? currentPrice > alert.threshold
                        : currentPrice < alert.threshold;

                    if (isTriggered) {
                        notifications.show(
                            `Price of ${crypto.name} is ${alert.condition === 'greater' ? 'above' : 'below'} the threshold (${alert.threshold})`,
                            {
                                severity: 'warning',
                                autoHideDuration: 3000
                            }
                        );
                    }

                    // Delete the alert after checking
                    if (!persistAlerts) {
                        try {
                            const deleteResponse = await fetch(`http://localhost:8080/api/alerts/${alert.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${session.token}`
                                }
                            });

                            if (!deleteResponse.ok) {
                                throw new Error(`Failed to delete alert ${alert.id}`);
                            }
                        } catch (deleteError) {
                            console.error(`Failed to delete alert ${alert.id}:`, deleteError);
                        }
                    }
                }
            }

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

    const handleCreateAlert = async (cryptoId, threshold, condition) => {
        try {
            // Input validation
            if (!threshold) {
                notifications.show('Price alert cannot be empty', {
                    autoHideDuration: 1500,
                    severity: 'info'
                });
                return;
            }

            // Find current price for the crypto
            const crypto = cryptoData.find(c => c.id === cryptoId);
            const currentPrice = crypto.current_price;
            console.log('currentPrice', currentPrice);
            console.log('threshold', threshold);
            console.log('condition', condition);
            // Validate threshold based on condition
            if (condition === 'greater' && threshold <= currentPrice) {
                notifications.show(`Alert price must be greater than ${currentPrice}`, {
                    autoHideDuration: 1500,
                    severity: 'error'
                });
                return;
            } else if (condition === 'less' && threshold >= currentPrice) {
                notifications.show(`Alert price must be less than ${currentPrice}`, {
                    autoHideDuration: 1500,
                    severity: 'error'
                });
                return;
            }
            else if (threshold === null || condition === null) {
                notifications.show(`Alert price must not be empty`, {
                    autoHideDuration: 1500,
                    severity: 'error'
                }); return;
            }

            const session = JSON.parse(localStorage.getItem('session'));

            const response = await fetch('http://localhost:8080/api/alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify({
                    cryptoId,
                    threshold: parseFloat(threshold),
                    condition: condition,
                    userId: session.user.id
                })
            });
            notifications.show('Alert created successfully', {
                autoHideDuration: 1500,
                severity: 'success'
            });

            if (!response.ok) {
                throw new Error('Failed to create alert');
            }
        } catch (error) {
            notifications.show('Failed to create alert', {
                autoHideDuration: 1500,
                severity: 'error'
            });
        }
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
        index: '5%',
        coin: '12%',
        price: '10%',
        change: '10%',
        marketCap: '15%',
        condition: '20%',
        threshold: '20%',
        button: "8%"
    };

    return (
        <Box sx={{ p: 3 }}>
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
            <Grid container sx={{
                backgroundColor: 'background.paper',
                p: 2,
                mb: 2,
                borderRadius: 1,
                alignItems: 'center'
            }}>
                <Grid item sx={{ width: GRID_SPACING.index }}>
                    <Typography>#</Typography>
                </Grid>
                <Grid item sx={{ width: GRID_SPACING.coin }}>
                    <Typography>Coin</Typography>
                </Grid>
                <Grid item sx={{ width: GRID_SPACING.price }}>
                    <Typography>Price</Typography>
                </Grid>
                <Grid item sx={{ width: GRID_SPACING.change }}>
                    <Typography>24h Change</Typography>
                </Grid>
                <Grid item sx={{ width: GRID_SPACING.marketCap }}>
                    <Typography>Market Cap</Typography>
                </Grid>
                <Grid item sx={{ width: GRID_SPACING.condition }}>
                    <Typography>Condition</Typography>
                </Grid>
                <Grid item sx={{ width: GRID_SPACING.threshold }}>
                    <Typography>Threshold</Typography>
                </Grid>
                <Grid item sx={{ width: GRID_SPACING.button }}>
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

            {/* Crypto Data Rows */}
            {filteredCryptoData.map((crypto, index) => (
                <Paper key={crypto.id} sx={{ p: 2, mb: 1 }}>
                    <Grid container sx={{ alignItems: 'center' }}>
                        <Grid item sx={{ width: GRID_SPACING.index }}>
                            <Typography>{index + 1}</Typography>
                        </Grid>
                        <Grid item sx={{ width: GRID_SPACING.coin }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar src={crypto.image} alt={crypto.name} sx={{ width: 24, height: 24 }} />
                                <Typography>{crypto.name}</Typography>
                            </Box>
                        </Grid>
                        <Grid item sx={{ width: GRID_SPACING.price }}>
                            <Typography>${crypto.current_price.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item sx={{ width: GRID_SPACING.change }}>
                            <Typography sx={{
                                color: crypto.price_change_percentage_24h > 0 ? 'success.main' : 'error.main'
                            }}>
                                {crypto.price_change_percentage_24h.toFixed(2)}%
                            </Typography>
                        </Grid>
                        <Grid item sx={{ width: GRID_SPACING.marketCap }}>
                            <Typography>${crypto.market_cap.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item sx={{ width: GRID_SPACING.condition }}>
                            <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                                <Select value={alertConditions[crypto.id] || 'greater'}
                                    onChange={(e) => setAlertConditions(prev => ({
                                        ...prev,
                                        [crypto.id]: e.target.value
                                    }))}>
                                    <MenuItem value="greater">Greater than</MenuItem>
                                    <MenuItem value="less">Less than</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item sx={{ width: GRID_SPACING.threshold }}>
                            <TextField
                                size="small"

                                type="number"
                                placeholder="Set price alert"
                                value={alerts[crypto.id] || ''}
                                onChange={(e) => {
                                    const newValue = parseFloat(e.target.value);
                                    const currentPrice = crypto.current_price;

                                    let errorMessage = '';
                                    const comparisonType = alertConditions[crypto.id] || 'greater';
                                    if (comparisonType === 'greater' && newValue <= currentPrice) {
                                        errorMessage = `Price must be ${comparisonType} than ${currentPrice}`;
                                    } else if (comparisonType === 'lesser' && newValue >= currentPrice) {
                                        errorMessage = `Price must be ${comparisonType} than ${currentPrice}`;
                                    }

                                    setAlertErrors(prev => ({
                                        ...prev,
                                        [crypto.id]: errorMessage
                                    }));

                                    setAlerts(prev => ({
                                        ...prev,
                                        [crypto.id]: newValue
                                    }));
                                }}
                                error={Boolean(alertErrors[crypto.id])}
                                helperText={alertErrors[crypto.id] || ''}
                            />
                        </Grid>
                        <Grid item sx={{ width: GRID_SPACING.button }}>
                            <IconButton
                                color="primary"
                                onClick={() => handleCreateAlert(
                                    crypto.id,
                                    alerts[crypto.id],
                                    alertConditions[crypto.id] || 'greater'
                                )}
                                sx={{ ml: 3 }}
                            >
                                <NotificationsIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Paper>
            ))}
        </Box>
    );

};

export default CryptoList;