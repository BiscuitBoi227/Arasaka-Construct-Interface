import type { ReactNode } from 'react'
import { Link } from 'react-router'
import arasakaLogo from '../../assets/assets/arasaka_logo.png'
import styles from './AppLayout.module.css'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand} aria-label="Arasaka Construct Interface home">
          <span className={styles.logoCrop}>
            <img src={arasakaLogo} alt="" />
          </span>
          <span className={styles.brandSubtitle}>CONSTRUCT INTERFACE</span>
        </Link>
        <span className={styles.previewStatus}>Local preview</span>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
