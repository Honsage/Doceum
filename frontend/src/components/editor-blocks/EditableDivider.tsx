import { observer } from 'mobx-react-lite';
import styles from './EditableDivider.module.css';

interface EditableDividerProps {
    block: any;
    onUpdate: (updates: any) => void;
}

export const EditableDivider = observer(({ block, onUpdate }: EditableDividerProps) => {
    return (
        <div className={styles.container}>
            <hr className={styles.divider} />
        </div>
    );
});