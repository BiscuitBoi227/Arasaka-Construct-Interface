import type { Construct } from '@aci/shared'
import styles from './ConstructArchive.module.css'

type ConstructDetailsProps = {
  construct: Construct
}

export function ConstructDetails({ construct }: ConstructDetailsProps) {
  return (
    <article className={styles.details} aria-labelledby="construct-heading">
      <div className={styles.panelHeading}>
        <div>
          <span className={styles.eyebrow}>CONSTRUCT FILE / {construct._id.slice(-4)}</span>
          <h2 id="construct-heading">{construct.name}</h2>
        </div>
        <span className={styles.recordStatus}>{construct.status}</span>
      </div>
      <div className={styles.detailsBody}>
        {construct.alias && <p className={styles.alias}>“{construct.alias}”</p>}
        <dl className={styles.facts}>
          <div>
            <dt>Affiliation</dt>
            <dd>{construct.affiliation || 'Unknown'}</dd>
          </div>
          <div>
            <dt>Occupation</dt>
            <dd>{construct.occupation || 'Unknown'}</dd>
          </div>
          <div>
            <dt>Clearance</dt>
            <dd>Level {construct.clearanceLevel}</dd>
          </div>
          <div>
            <dt>Last scan</dt>
            <dd>{construct.scannedAt || 'Unknown'}</dd>
          </div>
        </dl>

        <div className={styles.integrityLabel}>
          <span>Engram integrity</span>
          <strong>{construct.integrity}%</strong>
        </div>
        <div
          className={styles.integrityTrack}
          role="meter"
          aria-label="Engram integrity"
          aria-valuenow={construct.integrity}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${construct.integrity}%` }} />
        </div>

        <section className={styles.profileSection}>
          <h3>Profile</h3>
          <p>{construct.history}</p>
        </section>
        <section className={styles.profileSection}>
          <h3>Personality</h3>
          <p>{construct.personality}</p>
        </section>
        <section className={styles.profileSection}>
          <h3>Skills</h3>
          <ul className={styles.skills}>
            {construct.skills.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        </section>
      </div>
    </article>
  )
}
