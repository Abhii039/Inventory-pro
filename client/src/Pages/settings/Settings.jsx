import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

function Settings() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.put('/customer/update', 
                { username },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Username updated successfully!');
                localStorage.setItem('username', username);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/customer/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            navigate('/login');
        } catch (err) {
            setError('Logout failed');
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-card">
                <h2>Settings</h2>
                
                <form onSubmit={handleUpdateUsername} className="settings-form">
                    <div className="form-group">
                        <label>Change Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter new username"
                            className="form-input"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <button 
                        type="submit" 
                        className="update-btn"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Username'}
                    </button>
                </form>

                <button 
                    onClick={handleLogout} 
                    className="logout-btn"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Settings;
