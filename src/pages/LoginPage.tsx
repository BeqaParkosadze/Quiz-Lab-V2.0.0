import * as React from 'react';
import { Login as LoginComponent } from '../components/Login';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    onLoginSuccess();
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <LoginComponent 
      onLoginSuccess={handleSuccess} 
      onBackToHome={handleBack} 
    />
  );
};
