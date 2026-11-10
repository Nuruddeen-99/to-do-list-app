import React, { useState } from "react";
import './Signup.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    // State to handle form inputs
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match!');
            return;
        }
        setErrorMessage('');

        try {
            // Send data to the server
            const response = await axios.post('http://localhost:3001/api/signup', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password
            });

            if (response.status === 200) {
                // Redirect to the confirmation page
                navigate('/Confirm');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            const serverMessage = error.response && error.response.data;
            setErrorMessage(typeof serverMessage === 'string' ? serverMessage : 'Signup failed. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <p className="title">Create Account</p>
                <p className="message">Signup now and get full access to our app.</p>
                
                <div className="flex">
                    <label>
                        <input 
                            className="input" 
                            type="text" 
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="" 
                            required 
                        />
                        <span>First Name</span>
                    </label>

                    <label>
                        <input 
                            className="input" 
                            type="text" 
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="" 
                            required 
                        />
                        <span>Last Name</span>
                    </label>
                </div>  

                <label>
                    <input 
                        className="input" 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="" 
                        required 
                    />
                    <span>Email</span>
                </label> 
                    
                <label>
                    <input 
                        className="input" 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="" 
                        required 
                    />
                    <span>Password</span>
                </label>
                <label>
                    <input 
                        className="input" 
                        type="password" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="" 
                        required 
                    />
                    <span>Confirm Password</span>
                </label>
                {errorMessage && <p className="error-msg">{errorMessage}</p>}
                <button className="submit" type="submit">Create Account</button>
                <p className="signin">Already have an account? <Link to="/">Login</Link></p>
            </form>
        </div>
    );
}

export default Signup;
