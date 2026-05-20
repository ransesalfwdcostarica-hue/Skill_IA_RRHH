import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Routes/AppRoutes';
import './index.css'; // Asegurando de tener estilos globales

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
