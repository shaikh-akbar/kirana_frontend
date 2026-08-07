import { TableRow, TableCell, Skeleton } from '@mui/material'

export default function SkeletonRows({ columns = 4, rows = 6 }) {
  return Array.from({ length: rows }).map((_, r) => (
    <TableRow key={r}>
      {Array.from({ length: columns }).map((__, c) => (
        <TableCell key={c}>
          <Skeleton variant="text" sx={{ fontSize: '0.85rem' }} />
        </TableCell>
      ))}
    </TableRow>
  ))
}
