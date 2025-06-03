import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const InsuranceFormWrapper = ({ children, onSubmit }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleFormSubmit = async (formDataFromChild) => {
    try {
      setError(''); // Сброс предыдущих ошибок
      let response;
      if (!user) {
        const dataForApi = {};
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
          setError('Email для регистрации не может быть пустым.');
          // Не возвращаем промис с ошибкой, а просто прерываем, т.к. onSubmit не будет вызван
          // Или можно throw new Error, чтобы вызывающий код обработал
          throw new Error('Email для регистрации не может быть пустым.');
        }

        // Копируем все поля из formDataFromChild (специфичные для страхования)
        // Object.assign(dataForApi, formDataFromChild);
        // Важно не копировать owner* поля напрямую, если они будут перезаписаны
        for (const key in formDataFromChild) {
          if (key !== 'ownerFirstName' && key !== 'ownerLastName' && key !== 'ownerMiddleName') {
            dataForApi[key] = formDataFromChild[key];
          }
        }

        dataForApi.email = trimmedEmail;
        dataForApi.password = trimmedEmail; // Пароль равен email

        dataForApi.firstName = formDataFromChild.ownerFirstName ? formDataFromChild.ownerFirstName.trim() : '';
        dataForApi.lastName = formDataFromChild.ownerLastName ? formDataFromChild.ownerLastName.trim() : '';
        dataForApi.middleName = formDataFromChild.ownerMiddleName ? formDataFromChild.ownerMiddleName.trim() : '';
        
        // Проверка, что ФИО не пустые, если они требуются для регистрации
        if (!dataForApi.firstName || !dataForApi.lastName) {
            // Можно добавить setError или throw, если ФИО обязательны
            // setError('Имя и Фамилия для регистрации не могут быть пустыми.');
            // throw new Error('Имя и Фамилия для регистрации не могут быть пустыми.');
        }

        console.log('[InsuranceFormWrapper] Received formDataFromChild (unauthenticated):', JSON.stringify(formDataFromChild));
        console.log('[InsuranceFormWrapper] Email for registration:', trimmedEmail);
        console.log('[InsuranceFormWrapper] Constructed dataForApi before sending:', JSON.stringify(dataForApi));

        response = await onSubmit(dataForApi); // onSubmit это handleSubmitFromWrapper из OsagoForm
      } else {
        console.log('[InsuranceFormWrapper] Authenticated user, sending formDataFromChild as is:', JSON.stringify(formDataFromChild));
        response = await onSubmit(formDataFromChild);
      }
      return response; // Возвращаем результат вызова onSubmit (промис от API запроса)
    } catch (err) {
      // Если ошибка пришла из await onSubmit(), она будет здесь
      // Если ошибка была до этого (например, пустой email), она обработается выше
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Произошла ошибка при отправке формы';
      setError(errorMessage);
      console.error('[InsuranceFormWrapper] Error during form submission:', err, 'Data attempted:', JSON.stringify(err.config?.data));
      // Перебрасываем ошибку, чтобы вызывающий компонент (OsagoFormContent) мог ее поймать и обработать
      throw err; 
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!user && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Данные для регистрации
          </Typography>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            helperText="Этот email будет использован для входа в личный кабинет. Пароль будет таким же."
          />
          {/* Поля ФИО для регистрации теперь ожидаются из дочернего компонента как ownerFirstName и т.д. */}
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      {React.cloneElement(children, {
        onSubmit: handleFormSubmit, // Передаем handleFormSubmit как onSubmit в OsagoFormContent
        isAuthenticated: !!user
      })}
    </Paper>
  );
};

export default InsuranceFormWrapper; 