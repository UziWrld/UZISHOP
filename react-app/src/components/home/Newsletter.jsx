import React from 'react';

const Newsletter = () => {
    return (
        <section className="newsletter" style={{ padding: '100px 5%', background: '#fff', borderTop: '1px solid #eee' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <i className='bx bx-envelope' style={{ fontSize: '3rem', marginBottom: '20px', color: '#000' }}></i>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px' }}>Join the Club</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>Subscribe to get early access to drops, exclusive offers, and invites to events.</p>

                <form
                    onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}
                    style={{ display: 'flex', gap: '10px' }}
                >
                    <input
                        type="email"
                        placeholder="ENTER YOUR EMAIL"
                        required
                        style={{
                            flex: 1,
                            padding: '15px 20px',
                            background: '#f4f4f4',
                            border: '1px solid #ddd',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '15px 30px',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            letterSpacing: '1px'
                        }}
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Newsletter;
