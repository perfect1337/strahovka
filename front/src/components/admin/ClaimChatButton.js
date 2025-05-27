import React, { useState } from 'react';
import {
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Box,
    Typography
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import { format } from 'date-fns';
import api from '../../api';

const ClaimChatButton = ({ claimId, claimDescription }) => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        setOpen(true);
        setLoading(true);
        try {
            const response = await api.get(`/api/insurance/claims/${claimId}/messages`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setMessages([]);
        setNewMessage('');
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const response = await api.post(`/api/insurance/claims/${claimId}/messages`, {
                message: newMessage
            });
            setMessages([...messages, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <>
            <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<ChatIcon />}
                onClick={handleOpen}
            >
                ЧАТ
            </Button>

            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">
                        Чат по страховому случаю #{claimId}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                        {claimDescription}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <List sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                            {loading ? (
                                <ListItem>
                                    <ListItemText primary="Загрузка сообщений..." />
                                </ListItem>
                            ) : messages.length === 0 ? (
                                <ListItem>
                                    <ListItemText primary="Нет сообщений" />
                                </ListItem>
                            ) : (
                                messages.map((message) => (
                                    <ListItem 
                                        key={message.id}
                                        sx={{
                                            backgroundColor: message.user.role === 'ROLE_ADMIN' || message.user.role === 'ROLE_MODERATOR' 
                                                ? '#e3f2fd' 
                                                : 'transparent',
                                            borderRadius: '4px',
                                            mb: 1
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle2">
                                                    {message.user.firstName} {message.user.lastName} 
                                                    {(message.user.role === 'ROLE_ADMIN' || message.user.role === 'ROLE_MODERATOR') && 
                                                        ' (Администратор)'}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" color="textPrimary" sx={{ my: 1 }}>
                                                        {message.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {format(new Date(message.createdAt), 'dd.MM.yyyy HH:mm')}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="Введите сообщение..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={<SendIcon />}
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                            >
                                Отправить
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ClaimChatButton; 