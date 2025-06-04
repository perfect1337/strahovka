import React from 'react';
import { useAuth } from '../context/AuthContext';

const InsuranceFormWrapper = ({ children, onSubmit }) => {
  const { user } = useAuth();

  const handleFormSubmit = async (formData) => {
    try {
      if (onSubmit) {
        // Добавляем email пользователя к данным формы
        const dataWithEmail = {
          ...formData,
          email: user?.email
        };
        return await onSubmit(dataWithEmail);
      }
    } catch (error) {
      console.error('Error in InsuranceFormWrapper:', error);
      throw error;
    }
  };

  // Клонируем дочерний компонент и передаем ему все его оригинальные пропсы
  // плюс обработчик отправки формы и флаг аутентификации
  return React.cloneElement(children, {
    ...children.props, // Сохраняем все оригинальные пропсы
    onSubmit: handleFormSubmit,
    isAuthenticated: !!user
  });
};

export default InsuranceFormWrapper; 