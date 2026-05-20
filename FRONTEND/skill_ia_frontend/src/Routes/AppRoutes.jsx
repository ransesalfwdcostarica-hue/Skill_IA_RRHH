import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChatPage from '../pages/ChatPage/ChatPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
    </Routes>
  );
};

export default AppRoutes;
