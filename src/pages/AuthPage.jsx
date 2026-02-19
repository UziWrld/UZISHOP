import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '../assets/css/stylelogin.css';
import '../assets/css/responsivelogin.css';
import { useAuthController } from '../hooks/useAuthController';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import PasswordStrength from '../components/PasswordStrength';

const AuthPage = () => {
    const [isActive, setIsActive] = useState(false); // false = sign-in, true = sign-up
    const [viewMode, setViewMode] = useState('login'); // 'login', 'register', 'forgot'
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }
    const [showPassword, setShowPassword] = useState(false);
    const [honey, setHoney] = useState(''); // Honeypot field for bot protection

    const navigate = useNavigate();
    const location = useLocation();
    const { login, signup, loginWithGoogle, updateProfile, resetPassword, user } = useAuthController();


    // Redirigir directamente al estar autenticado
    useEffect(() => {
        if (user) {
            // Verificar si venía de otra página (ej: checkout)
            const from = location.state?.from || '/';
            console.log("AuthPage: Redirecting to", from, "State:", location.state);
            navigate(from, { replace: true });
        }
    }, [user, navigate, location]);

    // Estados del Formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleToggle = (targetMode) => {
        setViewMode(targetMode);
        setIsActive(targetMode === 'register');
        setToast(null);
        setEmail('');
        setPassword('');
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            console.error(err);
            showToast('No pudimos conectar con Google.', 'error');
        } finally {
            setLoading(false);
        }
    };


    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!email) return showToast('Ingresa tu correo.', 'error');

        setLoading(true);
        try {
            await resetPassword(email);
            showToast('Enlace de recuperación enviado a tu correo.', 'success');
            setTimeout(() => setViewMode('login'), 3000);
        } catch (err) {
            console.error(err);
            showToast('Error al enviar el correo. Revisa tus datos.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const validatePassword = (pwd) => {
        const hasNumber = /[0-9]/.test(pwd);
        const hasUpper = /[A-Z]/.test(pwd);
        const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
        const isLongEnough = pwd.length >= 6;

        if (!isLongEnough) return "La contraseña debe tener al menos 6 caracteres.";
        if (!hasNumber) return "La contraseña debe incluir al menos un número.";
        if (!hasUpper) return "La contraseña debe incluir al menos una letra mayúscula.";
        if (!hasSymbol) return "La contraseña debe incluir al menos un símbolo (ej: !@#$).";
        return null;
    };

    const handleSubmit = async (e, type) => {
        e.preventDefault();
        console.log("handleSubmit triggered", { type, email });

        setToast(null);
        setLoading(true);

        try {
            if (type === 'login') {
                console.log("Attempting login...");
                await login(email, password);
                console.log("Login success!");
                showToast('¡Bienvenido de nuevo!');
            } else {
                // Validaciones de contraseña premium
                const pwdError = validatePassword(password);
                if (pwdError) {
                    showToast(pwdError, 'error');
                    setLoading(false);
                    return;
                }

                await signup(email, password, {
                    role: 'user'
                });
                showToast('¡Registro exitoso! Bienvenido a la Gang.', 'success');
            }
        } catch (err) {
            console.error(err);
            let msg = err.message;
            if (msg.includes('auth/email-already-in-use')) msg = 'El correo ya está en uso.';
            else if (msg.includes('auth/wrong-password')) msg = 'Contraseña incorrecta.';
            else if (msg.includes('auth/user-not-found')) msg = 'No encontramos tu cuenta.';
            else if (msg.includes('auth/invalid-email')) msg = 'Correo inválido.';
            else if (msg.includes('auth/weak-password')) msg = 'Contraseña débil (mínimo 6 caracteres).';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };


    // VISTA: RECUPERAR CONTRASEÑA
    if (viewMode === 'forgot') {
        return (
            <>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <div className="auth-modal-overlay">
                    <div className="auth-centered-box">
                        <div className="form-content show">
                            <form onSubmit={handleForgotPassword}>
                                <h1>Recuperar Cuenta</h1>
                                <p>Te enviaremos un link para restablecer tu clave.</p>
                                <input
                                    type="email"
                                    placeholder="Correo Electrónico*"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Enviando...' : 'Enviar Enlace'}
                                </button>
                                <div className="toggle-hint">
                                    ¿Ya la recordaste? <span onClick={() => handleToggle('login')}>Volver al Login</span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="auth-modal-overlay">
                <div className={`auth-centered-box ${isActive ? 'active' : ''}`}>
                    {/* Sección Inicio de Sesión */}
                    <div className={`form-content login-side ${viewMode === 'login' ? 'show' : ''}`}>
                        <form onSubmit={(e) => handleSubmit(e, 'login')}>
                            <h1>Iniciar Sesión</h1>
                            <div className="social-icons">
                                <a href="#!" className="icons" onClick={handleGoogleAuth} title="Iniciar sesión con Google">
                                    <i className='bx bxl-google'></i>
                                </a>
                            </div>
                            <span>Accede con tu cuenta o Google</span>
                            <input
                                type="email"
                                placeholder="Correo Electrónico*"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Contraseña*"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <i
                                    className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} password-toggle-icon`}
                                    onClick={() => setShowPassword(!showPassword)}
                                ></i>
                            </div>
                            <a href="#!" className="forgot-link" onClick={() => handleToggle('forgot')}>¿Olvidaste tu contraseña?</a>
                            <button type="submit" disabled={loading}>{loading ? 'Cargando...' : 'Entrar'}</button>

                            <div className="toggle-hint">
                                ¿Eres nuevo aquí? <span onClick={() => handleToggle('register')}>Crea tu cuenta</span>
                            </div>
                        </form>
                    </div>

                    {/* Sección Registro */}
                    <div className={`form-content register-side ${viewMode === 'register' ? 'show' : ''}`}>
                        <form onSubmit={(e) => handleSubmit(e, 'register')}>
                            <h1>Unirme a la Gang</h1>
                            <div className="social-icons">
                                <a href="#!" className="icons" onClick={handleGoogleAuth} title="Registrarse con Google">
                                    <i className='bx bxl-google'></i>
                                </a>
                            </div>
                            <span>Regístrate rápido con tu correo</span>

                            <input
                                type="email"
                                placeholder="Correo Electrónico*"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Contraseña*"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <i
                                    className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} password-toggle-icon`}
                                    onClick={() => setShowPassword(!showPassword)}
                                ></i>
                            </div>
                            <PasswordStrength password={password} />

                            <button type="submit" disabled={loading}>{loading ? 'Procesando...' : 'Registrarme'}</button>

                            <div className="toggle-hint">
                                ¿Ya tienes cuenta? <span onClick={() => handleToggle('login')}>Inicia sesión</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;
