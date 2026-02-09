import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const videoRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        // Load Cormorant Garamond for Luxury feel
        const link = document.createElement('link');
        link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@300;400;700&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        // Configuration
        const isMobile = window.innerWidth < 768;
        const gridSpacing = isMobile ? 45 : 35;
        const pixelSize = isMobile ? 35 : 40;
        const mouseRadius = isMobile ? 120 : 180;

        let grid = [];
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const cols = Math.ceil(canvas.width / gridSpacing) + 1;
            const rows = Math.ceil(canvas.height / gridSpacing) + 1;
            grid = [];
            for (let i = 0; i < cols; i++) {
                grid[i] = [];
                for (let j = 0; j < rows; j++) {
                    grid[i][j] = { ox: i * gridSpacing, oy: j * gridSpacing, x: 0, y: 0, vx: 0, vy: 0 };
                }
            }
        };

        window.addEventListener('resize', resize);
        resize();

        let mouse = { x: -1000, y: -1000, lx: 0, ly: 0, v: 0 };
        const handleInteraction = (x, y) => {
            const dx = x - mouse.lx;
            const dy = y - mouse.ly;
            mouse.v = Math.sqrt(dx * dx + dy * dy);
            mouse.x = x;
            mouse.y = y;
            mouse.lx = x;
            mouse.ly = y;
        };

        const onMouseMove = (e) => handleInteraction(e.clientX, e.clientY);
        const onTouchMove = (e) => {
            if (e.touches && e.touches[0]) {
                handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: true });

        const animate = () => {
            if (video.readyState >= 2) {
                const time = Date.now() * 0.001;
                const cols = grid.length;
                const rows = grid[0].length;
                const interactionRadius = isMobile ? 200 : 300;

                for (let i = 0; i < cols; i++) {
                    for (let j = 0; j < rows; j++) {
                        const p = grid[i][j];
                        const lavaX = Math.sin(time * 0.5 + i * 0.2 + j * 0.3) * (isMobile ? 20 : 40);
                        const lavaY = Math.cos(time * 0.4 + i * 0.3 + j * 0.2) * (isMobile ? 20 : 40);
                        const dx = p.ox - mouse.x;
                        const dy = p.oy - mouse.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < interactionRadius) {
                            const force = (1 - dist / interactionRadius) * (mouse.v * 0.5 + 5);
                            const angle = Math.atan2(dy, dx);
                            p.vx += Math.cos(angle) * force;
                            p.vy += Math.sin(angle) * force;
                        }

                        // Edge Stabilization: Dampen displacement near the boundaries
                        const edgeDistX = Math.min(i, cols - 1 - i) / (cols * 0.15);
                        const edgeDistY = Math.min(j, rows - 1 - j) / (rows * 0.15);
                        const edgeFactor = Math.min(1, edgeDistX, edgeDistY);

                        p.vx *= 0.94;
                        p.vy *= 0.94;
                        p.x = (lavaX + p.vx) * edgeFactor;
                        p.y = (lavaY + p.vy) * edgeFactor;
                    }
                }

                // 2. Render Background with Overscan (Zoom to hide edges)
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const overscan = 1.1; // 10% zoom buffer
                const vW = video.videoWidth;
                const vH = video.videoHeight;
                const oW = vW / overscan;
                const oH = vH / overscan;
                const offsetX = (vW - oW) / 2;
                const offsetY = (vH - oH) / 2;

                for (let i = 0; i < cols - 1; i++) {
                    for (let j = 0; j < rows - 1; j++) {
                        const p1 = grid[i][j];
                        const x = i * gridSpacing;
                        const y = j * gridSpacing;

                        // Adjusted sampling with overscan buffer
                        const sx = offsetX + (x / canvas.width) * oW + p1.x;
                        const sy = offsetY + (y / canvas.height) * oH + p1.y;
                        const sw = (gridSpacing / canvas.width) * oW;
                        const sh = (gridSpacing / canvas.height) * oH;

                        ctx.drawImage(video, sx, sy, sw, sh, x, y, gridSpacing + 1, gridSpacing + 1);
                    }
                }

                const pCols = Math.ceil(canvas.width / pixelSize);
                const pRows = Math.ceil(canvas.height / pixelSize);
                ctx.save();
                for (let i = 0; i < pCols; i++) {
                    for (let j = 0; j < pRows; j++) {
                        const px = i * pixelSize;
                        const py = j * pixelSize;
                        const dx = (px + pixelSize / 2) - mouse.x;
                        const dy = (py + pixelSize / 2) - mouse.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < mouseRadius) {
                            const intensity = 1 - (dist / mouseRadius);
                            const pxOffset = Math.sin(time * 2 + i) * (isMobile ? 50 : 100) * intensity;
                            const pyOffset = Math.cos(time * 2 + j) * (isMobile ? 50 : 100) * intensity;
                            const sx = (px / canvas.width) * video.videoWidth + pxOffset;
                            const sy = (py / canvas.height) * video.videoHeight + pyOffset;
                            const sw = (pixelSize / canvas.width) * video.videoWidth;
                            const sh = (pixelSize / canvas.height) * video.videoHeight;
                            ctx.globalAlpha = intensity;
                            ctx.imageSmoothingEnabled = false;
                            ctx.drawImage(video, sx, sy, sw, sh, px, py, pixelSize, pixelSize);
                            ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.1})`;
                            ctx.fillRect(px, py, pixelSize, pixelSize);
                        }
                    }
                }
                ctx.restore();
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            cancelAnimationFrame(animationFrameId);
            document.head.removeChild(link);
        };
    }, []);

    return (
        <div className="collections-immersive-container" style={{
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#000',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Inter', sans-serif"
        }}>
            <video ref={videoRef} autoPlay loop muted playsInline style={{ display: 'none' }}>
                <source src="/video/4044.mp4" type="video/mp4" />
            </video>

            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', touchAction: 'none' }} />

            <div style={{
                position: 'relative',
                zIndex: 10,
                textAlign: 'center',
                padding: '0 20px',
                pointerEvents: 'none',
                maxWidth: '1200px'
            }}>
                {/* Massive Luxury Serif 404 */}
                <h1 style={{
                    fontSize: 'clamp(10rem, 40vw, 28rem)',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: '300', // Light weight for luxury feel
                    color: '#fff',
                    lineHeight: 0.8,
                    margin: 0,
                    letterSpacing: '-5px',
                    textShadow: '0 10px 40px rgba(0,0,0,0.4)',
                    fontStyle: 'italic', // Italic luxury serif is very classic
                    opacity: 0.95
                }}>
                    404
                </h1>

                {/* Minimalist Subtext */}
                <div style={{ marginTop: '-40px' }}>
                    <p style={{
                        fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
                        textTransform: 'uppercase',
                        letterSpacing: 'clamp(10px, 4vw, 25px)',
                        fontWeight: '300',
                        color: '#fff',
                        opacity: 0.8,
                        margin: '60px 0 80px'
                    }}>
                        NOT FOUND
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'transparent',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.4)',
                            padding: '15px 50px',
                            fontSize: '0.75rem',
                            fontWeight: '400',
                            textTransform: 'uppercase',
                            letterSpacing: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                            pointerEvents: 'auto',
                            backdropFilter: 'blur(5px)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.color = '#000';
                            e.currentTarget.style.border = '1px solid #fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.4)';
                        }}
                    >
                        Volver
                    </button>

                    {/* Small luxury accent bar */}
                    <div style={{
                        marginTop: '80px',
                        width: '40px',
                        height: '1px',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        margin: '0 auto'
                    }} />
                </div>
            </div>

            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
                zIndex: 2,
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default NotFoundPage;
