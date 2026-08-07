import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Box } from '@mui/material'
import { tabularNums } from '../theme/theme'
import EmptyState from './EmptyState'
import SkeletonRows from './SkeletonRows'

// Generic sticky-header, hover-highlighted data table. Columns: { key, label,
// align, numeric, render(row) }. Numeric columns get tabular figures and
// right alignment automatically.
export default function DataTable({ columns, rows, getRowKey, loading, emptyProps, maxHeight = 560, rowSx }) {
  if (!loading && (!rows || rows.length === 0)) {
    return <EmptyState {...emptyProps} />
  }

  return (
    <TableContainer sx={{ maxHeight, borderRadius: 2 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.numeric ? 'right' : col.align ?? 'left'} sx={{ whiteSpace: 'nowrap' }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <SkeletonRows columns={columns.length} rows={6} />
          ) : (
            rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                hover
                sx={{ '& td': { py: 1.1 }, position: 'relative', ...(rowSx ? rowSx(row) : {}) }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.numeric ? 'right' : col.align ?? 'left'}
                    sx={col.numeric ? tabularNums : undefined}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export function RowActions({ children }) {
  return (
    <Box
      className="row-actions"
      sx={{
        display: 'flex',
        gap: 0.5,
        justifyContent: 'flex-end',
        opacity: 0,
        transition: 'opacity 0.15s ease',
        'tr:hover &': { opacity: 1 },
      }}
    >
      {children}
    </Box>
  )
}
