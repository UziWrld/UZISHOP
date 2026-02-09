import React from 'react';

const Header = ({ user, onLoginClick, onLogout, onAdminClick }) => {
    return (
        <div className="header">
            <h1>UZI SHOP</h1>
            <div style={{ display: 'flex', gap: '10px', position: 'absolute', bottom: '10px', right: '20px' }}>
                {user ? (
                    <>
                        <span style={{ color: '#fff', alignSelf: 'center', fontSize: '1rem' }}>Bienvenido, {user.name}</span>
                        <button className="login-button" style={{ position: 'static' }} onClick={onAdminClick}>Admin CRUD</button>
                        <button className="login-button" style={{ position: 'static', background: '#e74c3c' }} onClick={onLogout}>Logout</button>
                    </>
                ) : (
                    <button className="login-button" onClick={onLoginClick}>Login / Register</button>
                )}
            </div>
        </div>
    );
};

export default Header;
