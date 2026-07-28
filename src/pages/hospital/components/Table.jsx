import React from 'react';
import { motion } from 'framer-motion';
import '../css/tables.css';

const tableVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  show:   (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
};

export default function Table({ title, subtitle, columns, rows, toolbar, pagination, onRowClick }) {
  return (
    <motion.div className="table-card" variants={tableVariants} initial="hidden" animate="show">
      {/* Header */}
      <div className="table-card-header">
        <div>
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </div>
        {toolbar && <div className="table-toolbar">{toolbar}</div>}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <motion.tr
                  key={row.id ?? i}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="show"
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : undefined }}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="table-pagination">
          <span>Showing {pagination.from}–{pagination.to} of {pagination.total}</span>
          <div className="pagination-btns">
            <button disabled={pagination.page === 1} onClick={() => pagination.onChange(pagination.page - 1)}>‹</button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={pagination.page === p ? 'active' : ''} onClick={() => pagination.onChange(p)}>{p}</button>
            ))}
            <button disabled={pagination.page === pagination.pages} onClick={() => pagination.onChange(pagination.page + 1)}>›</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
