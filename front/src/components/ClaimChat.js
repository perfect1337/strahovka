import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ClaimChat = ({ claimId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [error, setError] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/insurance/claims/${claimId}/messages`);
      setMessages(response.data);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Ошибка при загрузке сообщений');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [claimId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post(`/api/insurance/claims/${claimId}/messages`, {
        message: newMessage.trim()
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Ошибка при отправке сообщения');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Чат по страховому случаю
      </Typography>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    {message.user.firstName.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      variant="body1"
                      color="text.primary"
                    >
                      {message.user.firstName} {message.user.lastName}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        {new Date(message.createdAt).toLocaleString()}
                      </Typography>
                    </Typography>
                  }
                  secondary={message.message}
                />
              </ListItem>
              {index < messages.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}

      <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          variant="outlined"
        />
        <Button
          type="submit"
          variant="contained"
          endIcon={<SendIcon />}
          disabled={!newMessage.trim()}
        >
          Отправить
        </Button>
      </Box>
    </Paper>
  );
};

export default ClaimChat; 