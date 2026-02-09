import React, { useState } from 'react';
import '../../assets/css/stylelogin.css';
import '../../assets/css/responsivelogin.css';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
    const [isActive, setIsActive] = useState(false); // false = sign-in, true = sign-up
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [documento, setDocumento] = useState('');
    const [telefono, setTelefono] = useState('');

    const { login, signup } = useAuth();

    if (!isOpen) return null;

    const handleToggle = () => {
        setIsActive(!isActive);
        setError('');
    };

    const handleSubmit = async (e, type) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (type === 'login') {
                await login(email, password);
                onClose(); // Close on success
            } else {
                // Validation for new fields
                if (!nombre || !documento || !telefono) {
                    throw new Error("Todos los campos son obligatorios.");
                }
                await signup(email, password, {
                    nombre,
                    documento,
                    telefono
                });
                alert('¡Registro exitoso! Bienvenido a UZI GANG.');
                onClose();
            }
        } catch (err) {
            console.error(err);
            setError(err.message === 'Firebase: Error (auth/email-already-in-use).' ? 'El correo ya está registrado.' :
                err.message === 'Firebase: Error (auth/wrong-password).' ? 'Contraseña incorrecta.' :
                    err.message === 'Firebase: Error (auth/user-not-found).' ? 'Usuario no encontrado.' :
                        err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="close-button-container" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 2001 }}>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>
                    <i className='bx bx-x'>&times;</i>
                </button>
            </div>

            <div className={`container ${isActive ? 'active' : ''}`} id="container">
                {/* Sign-Up Form */}
                <div className="form-container sign-up">
                    <form onSubmit={(e) => handleSubmit(e, 'register')}>
                        <h1>Create Account</h1>
                        <div className="social-icons">
                            <a href="#" className="icons"><i className='bx bxl-google'></i></a>
                            <a href="#" className="icons"><i className='bx bxl-facebook'></i></a>
                            <a href="#" className="icons"><i className='bx bxl-github'></i></a>
                            <a href="#" className="icons"><i className='bx bxl-linkedin'></i></a>
                        </div>
                        <span>Register with Email</span>
                        {error && isActive && <p style={{ color: 'red', fontSize: '12px', margin: '5px 0' }}>{error}</p>}

                        <input type="text" placeholder="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        <input type="text" placeholder="Documento ID" value={documento} onChange={(e) => setDocumento(e.target.value)} required />
                        <input type="tel" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />

                        <input type="email" placeholder="Enter E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                        <button type="submit" disabled={loading}>{loading ? 'Procesando...' : 'Sign Up'}</button>
                    </form>
                </div>

                {/* Sign-In Form */}
                <div className="form-container sign-in">
                    <form onSubmit={(e) => handleSubmit(e, 'login')}>
                        <h1>Sign In</h1>
                        <div className="social-icons">
                            <a href="#" className="icons"><i className='bx bxl-google'></i></a>
                            <a href="#" className="icons"><i className='bx bxl-facebook'></i></a>
                            <a href="#" className="icons"><i className='bx bxl-github'></i></a>
                            <a href="#" className="icons"><i className='bx bxl-linkedin'></i></a>
                        </div>
                        <span>Login with Email & Password</span>
                        {error && !isActive && <p style={{ color: 'red', fontSize: '12px', margin: '5px 0' }}>{error}</p>}
                        <input type="email" placeholder="Enter E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <a href="#">Forgot Password?</a>
                        <button type="submit" disabled={loading}>{loading ? 'Espere...' : 'Sign In'}</button>
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

export default AuthModal;
