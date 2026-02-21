import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="uzu-loading-screen-tactical">
            {/* Corner Markers */}
            <div className="corner top-left">+</div>
            <div className="corner top-right">+</div>
            <div className="corner bottom-left">+</div>
            <div className="corner bottom-right">+</div>

            <div className="loader-center">
                <div className="tactical-logo">UZI SHOP</div>

                {/* Centered Loading Line */}
                <div className="loading-line-container">
                    <div className="loading-line-fill"></div>
                </div>

                <div className="tactical-status">INITIALIZING...</div>
            </div>
        </div>
    );
};

export default LoadingScreen;
