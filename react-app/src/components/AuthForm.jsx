import React, { useState } from 'react';
import '../assets/css/stylelogin.css';
import '../assets/css/responsivelogin.css';

const AuthForm = ({ onLoginSuccess, onClose }) => {
    const [isActive, setIsActive] = useState(false); // false = sign-in, true = sign-up
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleToggle = () => {
        setIsActive(!isActive);
        setError('');
    };

    const handleSubmit = async (e, type) => {
        e.preventDefault();
        setError('');

        const payload = type === 'login'
            ? { action: 'login', email: formData.email, password: formData.password }
            : { action: 'register', email: formData.email, password: formData.password };

        try {
            const response = await fetch('http://localhost/UZISHOP/api_auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                if (type === 'login') {
                    onLoginSuccess(result.user);
                } else {
                    // Password Strength Check for Registration
                    const password = formData.password;
                    const hasUpperCase = /[A-Z]/.test(password);
                    const hasNumber = /[0-9]/.test(password);
                    const isLongEnough = password.length >= 8;

                    if (!isLongEnough || !hasUpperCase || !hasNumber) {
                        setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
                        return;
                    }

                    alert('Registro exitoso. Por favor inicia sesión.');
                    setIsActive(false);
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        }
    };

    return (
        <div className="auth-modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="close-button-container">
                <button onClick={onClose} className="close-modal-btn">
                    <i className='bx bx-x'></i>
                </button>
            </div>

            <div className={`container ${isActive ? 'active' : ''}`} id="container">
                {/* Sign-Up Form */}
                <div className="form-container sign-up">
                    <form onSubmit={(e) => handleSubmit(e, 'register')}>
                        <h1>Create Account</h1>
                        <div className="social-icons">
                            <a href="#" className="icons"><i className="bx bxl-google"></i></a>
                            <a href="#" className="icons"><i className="bx bxl-facebook"></i></a>
                            <a href="#" className="icons"><i className="bx bxl-github"></i></a>
                            <a href="#" className="icons"><i className="bx bxl-tux"></i></a>
                        </div>
                        <span>Register with Email & Password</span>
                        {error && isActive && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
                        <input
                            type="email"
                            placeholder="Enter E-mail"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Enter Password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button type="submit">Sign Up</button>
                    </form>
                </div>

                {/* Sign-In Form */}
                <div className="form-container sign-in">
                    <form onSubmit={(e) => handleSubmit(e, 'login')}>
                        <h1>Sign In</h1>
                        <div className="social-icons">
                            <a href="#" className="icons"><i className="bx bxl-google"></i></a>
                            <a href="#" className="icons"><i className="bx bxl-facebook"></i></a>
                            <a href="#" className="icons"><i className="bx bxl-github"></i></a>
                            <a href="#" className="icons"><i className="bx bxl-tux"></i></a>
                        </div>
                        <span>Login with Email & Password</span>
                        {error && !isActive && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
                        <input
                            type="email"
                            placeholder="Enter E-mail"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Enter Password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <a href="#">Forgot Password?</a>
                        <button type="submit">Sign In</button>
                    </form>
                </div>

                {/* Toggle Panels */}
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Welcome To <br />Uzi Shop</h1>
                            <p>Sign in With ID & Password</p>
                            <button className="hidden" onClick={handleToggle}>Go to Sign In</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>ROLL WITH THE UZI GANG</h1>
                            <p>Join "UZI SHOP" to be UNIQUE</p>
                            <button className="hidden" onClick={handleToggle}>Go to Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
