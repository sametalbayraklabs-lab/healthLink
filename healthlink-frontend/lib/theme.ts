'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#1E8F8A',
            light: '#2BA8A2',
            dark: '#166E6A',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#14B8A6',
            light: '#5EEAD4',
            dark: '#0F766E',
            contrastText: '#FFFFFF',
        },
        success: {
            main: '#16A34A',
            light: '#4ADE80',
            dark: '#15803D',
        },
        warning: {
            main: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
        },
        error: {
            main: '#DC2626',
            light: '#F87171',
            dark: '#B91C1C',
        },
        background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#0F172A',
            secondary: '#475569',
        },
        divider: '#E2E8F0',
    },
    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontSize: '2.75rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2.25rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
        },
        h3: {
            fontSize: '1.875rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.005em',
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
        },
        h6: {
            fontSize: '1.05rem',
            fontWeight: 600,
        },
        body1: {
            fontWeight: 400,
            lineHeight: 1.7,
        },
        body2: {
            fontWeight: 400,
            lineHeight: 1.6,
        },
        button: {
            fontWeight: 500,
            letterSpacing: '0.01em',
        },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 14,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        filter: 'brightness(1.05)',
                    },
                },
                contained: {
                    boxShadow: '0 2px 8px rgba(30, 143, 138, 0.2)',
                    '&:hover': {
                        boxShadow: '0 4px 16px rgba(30, 143, 138, 0.3)',
                    },
                },
                outlined: {
                    borderWidth: '1.5px',
                    '&:hover': {
                        borderWidth: '1.5px',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 18,
                    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.1), 0 2px 8px rgba(30, 143, 138, 0.06)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1E8F8A',
                            borderWidth: '2px',
                        },
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1E8F8A',
                        borderWidth: '2px',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontWeight: 500,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.06)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 20,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    height: 8,
                    backgroundColor: '#E2E8F0',
                },
                bar: {
                    borderRadius: 8,
                },
            },
        },
    },
});
