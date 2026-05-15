import styles from './HomePage.module.css';

export const HomePage = () => {
    return (
        <div className="container">
            <div className={styles.hero}>
                <h1>Doceum</h1>
                <p>Интерактивные документы нового поколения</p>
            </div>
        </div>
    );
};