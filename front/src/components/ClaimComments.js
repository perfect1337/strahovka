import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import api from '../api';

const ClaimComments = ({ claimId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/insurance/claims/${claimId}/comments`);
      setComments(response.data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить комментарии');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [claimId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await api.post(`/api/insurance/claims/${claimId}/comments`, newComment);
      setNewComment('');
      await fetchComments();
      setError(null);
    } catch (err) {
      setError('Не удалось отправить комментарий');
      console.error('Error submitting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return '#f44336'; // Red for admin
      case 'ROLE_MODERATOR':
        return '#2196f3'; // Blue for moderator
      default:
        return '#4caf50'; // Green for users
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'Администратор';
      case 'ROLE_MODERATOR':
        return 'Модератор';
      default:
        return 'Пользователь';
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Комментарии
      </Typography>

      {/* Comment Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmitComment}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Напишите комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !newComment.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Отправить'}
          </Button>
        </form>
      </Paper>

      {/* Comments List */}
      <Box>
        {comments.map((comment) => (
          <Paper key={comment.id} sx={{ p: 2, mb: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{
                  bgcolor: getAvatarColor(comment.authorRole),
                  mr: 2
                }}
              >
                {getInitials(comment.authorName)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {comment.authorName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {getRoleLabel(comment.authorRole)} • {format(new Date(comment.createdAt), 'dd.MM.yyyy HH:mm')}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {comment.content}
            </Typography>
          </Paper>
        ))}
        {comments.length === 0 && !loading && (
          <Typography color="textSecondary" align="center">
            Нет комментариев
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ClaimComments; 