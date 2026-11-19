import type { Construct } from '@aci/shared'
import { Link } from 'react-router'
import styles from './ConstructArchive.module.css'

type ConstructListProps = {
  constructs: Construct[]
  selectedId: string
}

export function ConstructList({ constructs, selectedId }: ConstructListProps) {
  const sortedConstructs = [...constructs].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <aside className={styles.listPanel} aria-labelledby="list-heading">
      <div className={styles.panelHeading}>
        <span className={styles.eyebrow}>ARCHIVE INDEX</span>
        <div className={styles.headingRow}>
          <h2 id="list-heading">Constructs</h2>
          <span className={styles.count}>{constructs.length.toString().padStart(2, '0')}</span>
        </div>
      </div>
      <nav className={styles.recordList} aria-label="Construct records">
        {sortedConstructs.map((construct) => (
          <Link
            key={construct._id}
            to={`/constructs/${construct.slug ?? construct._id}`}
            className={`${styles.record} ${construct._id === selectedId ? styles.selected : ''}`}
            aria-current={construct._id === selectedId ? 'page' : undefined}
          >
            <span className={styles.recordName}>{construct.name}</span>
            <span className={styles.recordMeta}>{construct.affiliation}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
