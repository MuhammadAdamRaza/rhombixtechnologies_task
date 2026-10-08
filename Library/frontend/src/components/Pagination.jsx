import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    // Smart window of page numbers to show (maximum 5 visible pages to prevent overflowing on mobile)
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            range.unshift('...');
        }
        if (currentPage + delta < totalPages - 1) {
            range.push('...');
        }

        range.unshift(1);
        if (totalPages > 1) {
            range.push(totalPages);
        }

        return range;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="pagination-container">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-nav-btn"
                aria-label="Previous Page"
            >
                <ChevronLeft size={16} />
                <span className="btn-label">Previous</span>
            </button>

            <div className="pagination-pages">
                {visiblePages.map((page, idx) => {
                    if (page === '...') {
                        return <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>;
                    }
                    const isCurrent = currentPage === page;
                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`pagination-number-btn ${isCurrent ? 'active' : ''}`}
                            aria-label={`Page ${page}`}
                            aria-current={isCurrent ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="pagination-nav-btn"
                aria-label="Next Page"
            >
                <span className="btn-label">Next</span>
                <ChevronRight size={16} />
            </button>

            <style>{`
                .pagination-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.75rem;
                    margin-top: 2.5rem;
                    padding: 1rem 1.25rem;
                    background: var(--bg-card);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--glass-border);
                    flex-wrap: wrap;
                }

                .pagination-pages {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    flex-wrap: wrap;
                }

                .pagination-nav-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 8px 14px;
                    border-radius: var(--radius-sm);
                    font-size: 0.85rem;
                    font-weight: 600;
                    background: #f8fafc;
                    border: 1px solid var(--glass-border);
                    color: var(--text-main);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .pagination-nav-btn:hover:not(:disabled) {
                    background: #eef3f7;
                    border-color: var(--border-light);
                }

                .pagination-nav-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .pagination-number-btn {
                    min-width: 38px;
                    height: 38px;
                    padding: 0 8px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-sm);
                    font-size: 0.875rem;
                    font-weight: 500;
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .pagination-number-btn:hover:not(.active) {
                    background: #f3f7fa;
                    color: var(--text-main);
                }

                .pagination-number-btn.active {
                    background: var(--primary);
                    color: #ffffff;
                    border-color: var(--primary);
                    font-weight: 700;
                    box-shadow: 0 2px 10px rgba(15, 118, 110, 0.2);
                }

                .pagination-ellipsis {
                    color: var(--text-dim);
                    padding: 0 4px;
                }

                @media (max-width: 520px) {
                    .pagination-container {
                        gap: 0.5rem;
                        padding: 0.75rem;
                    }
                    .btn-label {
                        display: none;
                    }
                    .pagination-nav-btn {
                        padding: 8px 10px;
                    }
                    .pagination-number-btn {
                        min-width: 32px;
                        height: 32px;
                        font-size: 0.8rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Pagination;
