import { Link } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import styles from './NotFoundPage.module.css'

type NotFoundPageProps = {
  title?: string
}

export function NotFoundPage({ title = 'Page not found' }: NotFoundPageProps) {
  return (
    <AppLayout>
      <section className={styles.panel}>
        <p className={styles.code}>ERROR / 404</p>
        <h1>{title}</h1>
        <Link to="/" className={styles.homeLink}>
          Back to dashboard
        </Link>
      </section>
    </AppLayout>
  )
}
