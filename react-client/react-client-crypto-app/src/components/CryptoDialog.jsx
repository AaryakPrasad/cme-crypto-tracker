import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Box, Typography, Paper, Stack, Grid2 as Grid, Select, MenuItem, TextField } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { useNotifications } from '@toolpad/core/useNotifications';

export function CryptoDialog({ open, onClose, payload: { crypto } }) {
    const [ohlcData, setOhlcData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState('');
    const [alertCondition, setAlertCondition] = useState('greater');
    const [alertError, setAlertError] = useState('');
    const notifications = useNotifications();

    useEffect(() => {
        const fetchOHLCData = async () => {
            try {
                const response = await fetch(
                    `https://api.coingecko.com/api/v3/coins/${crypto.id}/ohlc?vs_currency=usd&days=7`,
                    {
                        headers: {
                            'x-cg-demo-api-key': import.meta.env.VITE_COIN_GECKO_API_KEY
                        }
                    }
                );
                const data = await response.json();
                setOhlcData(data);
            } catch (error) {
                console.error('Failed to fetch OHLC data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOHLCData();
    }, [crypto.id]);

    const handleCreateAlert = async () => {
        try {
            // Input validation
            if (!alert) {
                notifications.show('Price alert cannot be empty', {
                    autoHideDuration: 1500,
                    severity: 'info'
                });
                return;
            }

            const threshold = parseFloat(alert);
            if (isNaN(threshold)) {
                notifications.show('Price alert must be a number', {
                    autoHideDuration: 1500,
                    severity: 'error'
                });
                return;
            }

            const currentPrice = crypto.current_price;
            // Validate threshold based on condition
            if (alertCondition === 'greater' && threshold <= currentPrice) {
                notifications.show(`Alert price must be more than ${currentPrice}`, {
                    autoHideDuration: 1500,
                    severity: 'error'
                });
                return;
            } else if (alertCondition === 'less' && threshold >= currentPrice) {
                notifications.show(`Alert price must be less than ${currentPrice}`, {
                    autoHideDuration: 1500,
                    severity: 'error'
                });
                return;
            }

            const session = JSON.parse(localStorage.getItem('session'));
            const response = await fetch('http://localhost:8080/api/alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify({
                    cryptoId: crypto.id,
                    threshold: threshold,
                    condition: alertCondition,
                    userId: session.user.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create alert');
            }

            notifications.show('Alert created successfully', {
                autoHideDuration: 1500,
                severity: 'success'
            });
            onClose();
        } catch (error) {
            notifications.show('Failed to create alert', {
                autoHideDuration: 1500,
                severity: 'error'
            });
        }
    };

    const chartOptions = {
        chart: {
            type: 'candlestick',
            height: 350,
            foreColor: 'inherit' // This will inherit text color from theme
        },
        title: {
            text: `${crypto.name} Price Chart`,
            align: 'left',
            style: {
                color: 'inherit' // This will inherit text color from theme
            }
        },
        xaxis: {
            type: 'datetime',
            tooltip: {
                enabled: true
            },
            labels: {
                style: {
                    colors: 'inherit' // This will inherit text color from theme
                }
            }
        },
        yaxis: {
            tooltip: {
                enabled: true
            },
            labels: {
                style: {
                    colors: 'inherit' // This will inherit text color from theme
                }
            }
        },
        theme: {
            mode: 'inherit' // This will inherit dark/light mode from theme
        }
    };

    const chartSeries = [{
        data: ohlcData.map(([timestamp, open, high, low, close]) => ({
            x: new Date(timestamp),
            y: [open, high, low, close]
        }))
    }];

    return (
        <Dialog
            fullWidth
            maxWidth="lg"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { minHeight: '80vh' }
            }}
        >
            <DialogTitle>{crypto.name} Details</DialogTitle>
            <DialogContent>
                {/* <Stack spacing={4}> */}
                <Grid container spacing={4}>
                    {/* Chart Section */}
                    <Grid item sx={{ width: '100%', height: 400 }}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <CircularProgress />
                            </Box>
                        ) : (
                            <ReactApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type="candlestick"
                                height={400}
                            />
                        )}
                    </Grid>

                    {/* Market Data and Alert Section */}
                    {/* Market Data */}
                    <Grid item size={6} md={12}>
                        <Paper sx={{ p: 4 }}>
                            <Typography variant="h6" gutterBottom>Market Data</Typography>
                            <Stack spacing={2}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography>Current Price:</Typography>
                                    <Typography>${crypto.current_price.toLocaleString()}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography>24h Change:</Typography>
                                    <Typography color={crypto.price_change_percentage_24h > 0 ? 'success.main' : 'error.main'}>
                                        {crypto.price_change_percentage_24h.toFixed(2)}%
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography>Market Cap:</Typography>
                                    <Typography>${crypto.market_cap.toLocaleString()}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography>Volume:</Typography>
                                    <Typography>${crypto.total_volume.toLocaleString()}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Alert Settings */}
                    <Grid item size={6} md={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Set Price Alert</Typography>
                            <Stack spacing={2}>
                                <Select
                                    value={alertCondition}
                                    onChange={(e) => setAlertCondition(e.target.value)}
                                >
                                    <MenuItem value="greater">Greater than</MenuItem>
                                    <MenuItem value="less">Less than</MenuItem>
                                </Select>
                                <TextField
                                    fullWidth
                                    type="number"
                                    placeholder="Enter price threshold"
                                    value={alert}
                                    onChange={(e) => {
                                        const newValue = parseFloat(e.target.value);
                                        const currentPrice = crypto.current_price;

                                        let errorMessage = '';
                                        if (alertCondition === 'greater' && newValue <= currentPrice) {
                                            errorMessage = `Price must be greater than ${currentPrice}`;
                                        } else if (alertCondition === 'less' && newValue >= currentPrice) {
                                            errorMessage = `Price must be less than ${currentPrice}`;
                                        }

                                        setAlertError(errorMessage);
                                        setAlert(e.target.value);
                                    }}
                                    error={Boolean(alertError)}
                                    helperText={alertError}
                                />
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleCreateAlert}
                                >
                                    Set Alert
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
                {/* </Stack> */}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

CryptoDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    payload: PropTypes.shape({
        crypto: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            current_price: PropTypes.number.isRequired,
            price_change_percentage_24h: PropTypes.number.isRequired,
            market_cap: PropTypes.number.isRequired,
            total_volume: PropTypes.number.isRequired
        }).isRequired
    }).isRequired,
};