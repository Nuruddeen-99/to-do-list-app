import React from 'react';
import Login from './Login';
import Signup from './Signup';
import Main from './Main';
import New from './New';
import Confirm from './Confirm';
import { Routes, Route } from 'react-router-dom';

function App() {

    return (
    <>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/Signup" element={<Signup />}/>
          <Route path="/Main" element={<Main />}/>
          <Route path="/New" element={<New />}/>
          <Route path="/Confirm" element={<Confirm />}/>
        </Routes>
          </>
    );
  }
  export default App;