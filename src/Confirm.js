import React from "react";
import { useNavigate } from 'react-router-dom';
import './Confirm.css';

function Confirm() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <form className="auth-form confirm-form" onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
        <h2 className="title">Account Created!</h2>
        <p className="message">Click the button below to log in.</p>
        <button className="submit" type="submit">Go to Login</button>
      </form>
    </div>
  );
}

export default Confirm;
