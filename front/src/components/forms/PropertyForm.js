import React, { useState } from 'react';
import { TextField, Checkbox, FormControlLabel, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import EmailInput from '../EmailInput';

const PropertyForm = ({ onSubmit, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    propertyType: 'APARTMENT',
    address: '',
    propertyArea: '',
    yearBuilt: '',
    constructionType: '',
    propertyValue: '',
    hasSecuritySystem: false,
    hasFireAlarm: false,
    coverNaturalDisasters: true,
    coverTheft: true,
    coverThirdPartyLiability: false,
    ownershipDocumentNumber: '',
    cadastralNumber: '',
    hasMortgage: false,
    mortgageBank: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = isAuthenticated ? '/api/insurance/property' : '/api/insurance/property/unauthorized';
    onSubmit(formData, endpoint);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        {!isAuthenticated && (
          <Grid item xs={12}>
            <EmailInput
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Тип недвижимости</InputLabel>
            <Select
              value={formData.propertyType}
              onChange={(e) => handleChange('propertyType', e.target.value)}
              label="Тип недвижимости"
            >
              <MenuItem value="APARTMENT">Квартира</MenuItem>
              <MenuItem value="HOUSE">Дом</MenuItem>
              <MenuItem value="COTTAGE">Дача</MenuItem>
              <MenuItem value="GARAGE">Гараж</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Адрес"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Площадь (м²)"
            type="number"
            value={formData.propertyArea}
            onChange={(e) => handleChange('propertyArea', parseFloat(e.target.value))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Год постройки"
            type="number"
            value={formData.yearBuilt}
            onChange={(e) => handleChange('yearBuilt', parseInt(e.target.value))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Тип постройки</InputLabel>
            <Select
              value={formData.constructionType}
              onChange={(e) => handleChange('constructionType', e.target.value)}
              label="Тип постройки"
            >
              <MenuItem value="BRICK">Кирпич</MenuItem>
              <MenuItem value="PANEL">Панель</MenuItem>
              <MenuItem value="MONOLITH">Монолит</MenuItem>
              <MenuItem value="WOOD">Дерево</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Стоимость имущества"
            type="number"
            value={formData.propertyValue}
            onChange={(e) => handleChange('propertyValue', parseFloat(e.target.value))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasSecuritySystem}
                onChange={(e) => handleChange('hasSecuritySystem', e.target.checked)}
              />
            }
            label="Наличие охранной системы"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasFireAlarm}
                onChange={(e) => handleChange('hasFireAlarm', e.target.checked)}
              />
            }
            label="Наличие пожарной сигнализации"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.coverNaturalDisasters}
                onChange={(e) => handleChange('coverNaturalDisasters', e.target.checked)}
              />
            }
            label="Страхование от стихийных бедствий"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.coverTheft}
                onChange={(e) => handleChange('coverTheft', e.target.checked)}
              />
            }
            label="Страхование от кражи"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.coverThirdPartyLiability}
                onChange={(e) => handleChange('coverThirdPartyLiability', e.target.checked)}
              />
            }
            label="Страхование гражданской ответственности"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Номер документа о праве собственности"
            value={formData.ownershipDocumentNumber}
            onChange={(e) => handleChange('ownershipDocumentNumber', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Кадастровый номер"
            value={formData.cadastralNumber}
            onChange={(e) => handleChange('cadastralNumber', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasMortgage}
                onChange={(e) => handleChange('hasMortgage', e.target.checked)}
              />
            }
            label="Недвижимость в ипотеке"
          />
        </Grid>

        {formData.hasMortgage && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Банк-кредитор"
              value={formData.mortgageBank}
              onChange={(e) => handleChange('mortgageBank', e.target.value)}
              required
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Оформить полис
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default PropertyForm; 