import React from 'react';
import { Typography, Box, Chip } from '@mui/material';
import { formatCurrency } from '../../utils/currency';
import { useApp } from '../../context/AppContext';

const CurrencyDisplay = ({ 
  amount, 
  variant = 'body1', 
  showSymbol = true,
  showCode = true,
  showAsChip = false,
  currencyCode = null,
  sx = {},
  component = 'span',
  chipProps = {},
  ...props 
}) => {
  const { currentBusiness } = useApp();
  
  // Usar divisa del negocio actual o la proporcionada
  const currency = currencyCode || (currentBusiness?.moneda) || 'COP';
  
  
  const formattedAmount = formatCurrency(amount, currency, showSymbol, showCode);

  if (showAsChip) {
    return (
      <Chip 
        label={formattedAmount}
        size="small"
        {...chipProps}
      />
    );
  }

  return (
    <Typography 
      variant={variant}
      component={component}
      sx={sx}
      {...props}
    >
      {formattedAmount}
    </Typography>
  );
};

export default CurrencyDisplay;
