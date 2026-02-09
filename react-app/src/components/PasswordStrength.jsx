import React from 'react';

const PasswordStrength = ({ password }) => {
    const evaluateStrength = (pwd) => {
        if (!pwd) return { score: 0, label: '', color: 'transparent' };

        let score = 0;

        // Requisitos básicos
        if (pwd.length >= 6) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (pwd.length >= 10) score++;

        if (score <= 2) return { score, label: 'Baja', color: '#ff4757', width: '33%' };
        if (score <= 4) return { score, label: 'Media', color: '#ffa502', width: '66%' };
        return { score, label: 'Alta', color: '#2ed573', width: '100%' };
    };

    const getMissingRequirements = (pwd) => {
        const missing = [];
        if (pwd.length < 6) missing.push("Mín. 6 caracteres");
        if (!/[A-Z]/.test(pwd)) missing.push("una Mayúscula");
        if (!/[0-9]/.test(pwd)) missing.push("un Número");
        if (!/[^A-Za-z0-9]/.test(pwd)) missing.push("un Símbolo");
        return missing;
    };

    const strength = evaluateStrength(password);
    const missing = getMissingRequirements(password);

    if (!password) return null;

    return (
        <div className="password-strength-meter" style={{ width: '100%', marginTop: '5px', marginBottom: '10px' }}>
            <div style={{
                height: '4px',
                width: '100%',
                backgroundColor: '#eee',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '4px'
            }}>
                <div style={{
                    height: '100%',
                    width: strength.width,
                    backgroundColor: strength.color,
                    transition: 'all 0.3s ease'
                }}></div>
            </div>
            <div style={{
                textAlign: 'left',
                fontSize: '0.65rem',
                fontWeight: '700',
                color: missing.length > 0 ? '#999' : '#2ed573'
            }}>
                {missing.length > 0 ? (
                    <span>Falta: {missing.join(', ')}</span>
                ) : (
                    <span>Contraseña Segura</span>
                )}
            </div>
        </div>
    );
};

export default PasswordStrength;
