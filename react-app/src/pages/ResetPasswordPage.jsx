import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import Footer from '../components/Footer';
import PasswordStrength from '../components/PasswordStrength';
import '../assets/css/stylelogin.css';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { confirmPassword } = useAuth();

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const oobCode = searchParams.get('oobCode');

    useEffect(() => {
        if (!oobCode) {
            setToast({ message: 'Enlace de recuperación inválido o expirado.', type: 'error' });
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [oobCode, navigate]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const pwdError = validatePassword(newPassword);
        if (pwdError) {
            return showToast(pwdError, 'error');
        }

        if (newPassword !== confirmNewPassword) {
            return showToast('Las contraseñas no coinciden.', 'error');
        }

        setLoading(true);
        try {
            await confirmPassword(oobCode, newPassword);
            showToast('¡Contraseña actualizada! Ya puedes iniciar sesión.', 'success');
            setTimeout(() => navigate('/login'), 2500);
        } catch (error) {
            console.error(error);
            showToast('Error al restablecer. El enlace podría haber expirado.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!oobCode) {
        return (
            <div className="auth-modal-overlay">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <div className="auth-centered-box">
                    <h1>Error</h1>
                    <p>Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="auth-modal-overlay">
                <div className="auth-centered-box">
                    <div className="form-content show">
                        <form onSubmit={handleSubmit}>
                            <h1>Nueva Contraseña</h1>
                            <p>Ingresa tu nueva clave de acceso para UZI SHOP.</p>

                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Contraseña*"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <i
                                    className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} password-toggle-icon`}
                                    onClick={() => setShowPassword(!showPassword)}
                                ></i>
                            </div>
                            <PasswordStrength password={newPassword} />

                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirmar Contraseña*"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                                <i
                                    className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} password-toggle-icon`}
                                    onClick={() => setShowPassword(!showPassword)}
                                ></i>
                            </div>

                            <button type="submit" disabled={loading}>
                                {loading ? 'Actualizando...' : 'Restablecer Clave'}
                            </button>

                            <div className="toggle-hint">
                                <span onClick={() => navigate('/login')}>Cancelar y Volver</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPasswordPage;
