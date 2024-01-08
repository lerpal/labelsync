import styles from '@/components/Form/Footer.module.scss';
import logo from '@/components/Form/lerpal.svg';

export default function Footer() {
    return (
        <div className={styles.wrapper}>
            <div>
                <p className={styles.text}>Powered by&nbsp;</p>
                <a href="https://lerpal.com" target="_blank" className={styles.link} rel="noreferrer">
                    <img src={logo} alt="lerpal" />
                </a>
            </div>

            <button className={styles.save} type="submit">Save</button>
        </div>
    );
}
