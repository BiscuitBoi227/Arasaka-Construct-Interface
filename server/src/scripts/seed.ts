import { connectToMongo, disconnectFromMongo } from '../db/mongo';
import { Construct } from '../modules/constructs/construct.model';
import { constructSeeds } from './seedConstructs';

// npm run seed (from project root)
// Replaces the sample constructs in whatever database that MONGO_URI points at.
// Safe to rerun. Old seeds are removed before creating new ones.

function countBy<T>(items: T[], key: (item: T) => string | number): string {
    const counts = new Map<string | number, number>();
    for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
    return [...counts].map(([value, count]) => `${value} x${count}`).join(', ');
}

async function seedConstructs(): Promise<void> {
    // 1. Check the seed list before touching the database, so a typo in one record can't delete the old seeds and then stop halfway.
    // Without a slug field in the model, Mongoose drops the slugs, step 2 matches nothing, and every run would add 10 more copies.

    if (!Construct.schema.path('slug')) {
        throw new Error('The Construct model has no "slug" field, so old seed can\'t be found. Add slug to construct.model.ts.');
    }

    const slugs = constructSeeds.map((seed) => seed.slug);
    const duplicate = slugs.find((slug, index) => slugs.indexOf(slug) !== index);
    if (duplicate) throw new Error(`Two seeds use the slug "${duplicate}". Each seed needs its own slug.`);

    const docs = [];
    for (const seed of constructSeeds) {
        const doc = new Construct(seed);
        try {
            await doc.validate();
        } catch (error) {
            throw new Error(`Seed "${seed.slug}" is invalid: ${(error as Error).message}`);
        }
        docs.push(doc);
    }

    // 2. Remove old copies of these seeds, matched by slug.
    // Constructs that people created in the app have other slugs (or none), so they're left alone.
    const { deletedCount } = await Construct.deleteMany({ slug: { $in: slugs } });
    console.log(`[seed] Removed ${deletedCount} old seed construct(s)`);

    // 3. Insert fresh copies.
    const inserted = await Construct.insertMany(docs);
    console.log(`[seed] Inserted ${inserted.length} constructs`);
    console.log(`[seed]   clearance: ${countBy(inserted, (c) => c.clearanceLevel)}`);
    console.log(`[seed]   status:    ${countBy(inserted, (c) => c.status)}`);
}

try {
    await connectToMongo();
    // Wait until the collection and its indexes (unique slug, clearance_name) exist before touching data.
    await Construct.init();
    await seedConstructs();
    console.log('[seed] Done');
} catch (error) {
    console.error(`[seed] Seeding failed: ${(error as Error).message}`);
    process.exitCode = 1;
} finally {
    await disconnectFromMongo();
}