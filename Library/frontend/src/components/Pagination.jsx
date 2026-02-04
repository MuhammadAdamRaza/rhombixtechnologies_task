import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'var(--glass)',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)'
        }}>
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-primary"
                style={{
                    padding: '10px 20px',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
            >
                ← Previous
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => onPageChange(i + 1)}
                        style={{
                            padding: '10px 14px',
                            background: currentPage === i + 1 ? 'var(--primary)' : 'var(--glass)',
                            border: `2px solid ${currentPage === i + 1 ? 'var(--primary)' : 'var(--glass-border)'}`,
                            borderRadius: '8px',
                            color: currentPage === i + 1 ? 'white' : 'var(--text-main)',
                            cursor: 'pointer',
                            fontWeight: currentPage === i + 1 ? 700 : 400,
                            minWidth: '44px'
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-primary"
                style={{
                    padding: '10px 20px',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
            >
                Next →
            </button>
        </div>
    );
};

export default Pagination;
