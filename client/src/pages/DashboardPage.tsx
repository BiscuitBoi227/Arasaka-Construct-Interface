import { useParams } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { ConstructDetails } from '../features/constructs/ConstructDetails'
import { ConstructList } from '../features/constructs/ConstructList'
import { previewConstructs } from '../features/constructs/previewConstructs'
import styles from '../features/constructs/ConstructArchive.module.css'
import { NotFoundPage } from './NotFoundPage'

export function DashboardPage() {
  const { id } = useParams()
  const selected = id
    ? previewConstructs.find((construct) => construct.slug === id || construct._id === id)
    : previewConstructs[0]

  if (!selected) {
    return <NotFoundPage title="Construct not found" />
  }

  return (
    <AppLayout>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>DATABASE / CONSTRUCTS</p>
        <h1>Construct Archive</h1>
      </div>

      <div className={styles.workspace}>
        <ConstructList constructs={previewConstructs} selectedId={selected._id} />
        <ConstructDetails construct={selected} />
        <aside className={styles.controls} aria-labelledby="control-heading">
          <div className={styles.panelHeading}>
            <span className={styles.eyebrow}>ACCESS PANEL</span>
            <h2 id="control-heading">Actions</h2>
          </div>
          <div className={styles.controlBody}>
            <button type="button" disabled>
              Edit record
            </button>
            <button type="button" disabled>
              Delete record
            </button>
          </div>
        </aside>
      </div>
    </AppLayout>
  )
}
