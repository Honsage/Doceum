import type { TableBlock, TableRow, TableCell } from '@types/document';
import { InlineRenderer } from '@components/inline';
import styles from './Table.module.css';

interface TableProps {
    block: TableBlock;
    onAnchorClick?: (targetId: string) => void;
}

const renderRow = (row: TableRow, onAnchorClick?: (targetId: string) => void) => (
    <tr key={row.id} className={styles.row}>
        {row.cells.map((cell: TableCell) => (
            <td key={cell.id} className={cell.isHeader ? styles.headerCell : styles.cell}>
                <InlineRenderer nodes={cell.content.inlines} onAnchorClick={onAnchorClick} />
            </td>
        ))}
    </tr>
);

export const Table = ({ block, onAnchorClick }: TableProps) => {
    return (
        <div className={styles.tableWrapper}>
            {block.caption && (
                <div className={styles.caption}>
                    <InlineRenderer nodes={block.caption.inlines} onAnchorClick={onAnchorClick} />
                </div>
            )}
            <table className={styles.table}>
                {block.head && block.head.length > 0 && (
                    <thead>
                    {block.head.map(row => renderRow(row, onAnchorClick))}
                    </thead>
                )}
                {block.body && block.body.length > 0 && (
                    <tbody>
                    {block.body.map(row => renderRow(row, onAnchorClick))}
                    </tbody>
                )}
            </table>
        </div>
    );
};