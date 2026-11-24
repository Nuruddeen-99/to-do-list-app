import React from 'react';
import Login from './Login';
import Signup from './Signup';
import Main from './Main';
import New from './New';
import Confirm from './Confirm';
import { Routes, Route, Navigate } from 'react-router-dom';

// Protects the task page so it can't be reached after logging out
const RequireAuth = ({ children }) =>
  sessionStorage.getItem('todo:auth') === 'true'
    ? children
    : <Navigate to="/" replace />;

function App() {

    return (
    <>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/signup" element={<Signup />}/>
          <Route path="/main" element={<Main />}/>
          <Route path="/dashboard" element={<RequireAuth><New /></RequireAuth>} />
          <Route path="/confirm" element={<Confirm />}/>
        </Routes>
          </>
    );
  }
  export default App;