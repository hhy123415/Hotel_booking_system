import React from 'react';
import styles from '../css/Pagination.module.css'; // 假设css文件和ts文件在同级目录

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void; // 回调函数，通知父组件页码变化
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={styles.pagination}>
      <button
        className={styles.btn}
        disabled={currentPage === 1}
        onClick={handlePrevClick}
      >
        上一页
      </button>

      <span className={styles.pageInfo}>
        第 <strong>{currentPage}</strong> 页 / 共 {totalPages} 页
      </span>

      <button
        className={styles.btn}
        disabled={currentPage === totalPages}
        onClick={handleNextClick}
      >
        下一页
      </button>
    </div>
  );
};

export default Pagination;