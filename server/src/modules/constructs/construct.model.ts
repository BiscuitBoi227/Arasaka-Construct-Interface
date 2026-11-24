import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { CONSTRUCT_STATUSES } from '@aci/shared';

// One construct record in the archive. Field names match the shared Construct type
// in shared/src/construct.ts and the constructs table in docs/database-schema.md.
const constructSchema = new Schema(
    {
        // Readable id for URLs such as /constructs/johnny-silverhand. Optional, but no
        // two constructs can share one. sparse lets any number of constructs have none.
        slug: { type: String, unique: true, sparse: true, trim: true },
        name: { type: String, required: true, trim: true },
        alias: { type: String, trim: true },
        gender: { type: String, required: true, trim: true },
        birthdate: { type: Date, required: true },
        affiliation: { type: String, trim: true },
        occupation: { type: String, trim: true },
        // personality and history feed the AI chat prompt later. history is the bio.
        personality: { type: String, required: true, trim: true },
        history: { type: String, required: true, trim: true },
        skills: { type: [{ type: String, trim: true }], default: [] },
        status: {
            type: String,
            required: true,
            enum: {
                values: CONSTRUCT_STATUSES,
                message: `status must be one of: ${CONSTRUCT_STATUSES.join(', ')}`,
            },
            default: 'active',
        },
        integrity: {
            type: Number,
            min: [0, 'integrity must be 0 or more'],
            max: [100, 'integrity must be 100 or less'],
            validate: { validator: Number.isInteger, message: 'integrity must be a whole number' },
        },
        // The lowest role clearance that can see this construct (analyst 1, netrunner 2, executive 3).
        clearanceLevel: {
            type: Number,
            required: true,
            min: [1, 'clearanceLevel must be 1, 2 or 3'],
            max: [3, 'clearanceLevel must be 1, 2 or 3'],
            validate: { validator: Number.isInteger, message: 'clearanceLevel must be 1, 2 or 3' },
            default: 3,
        },
        scannedAt: { type: Date },
        // The user who created it. Empty for seeded constructs.
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true },
);

// The dashboard's query: constructs at or below a clearance, sorted by name (cards 10 and 20).
constructSchema.index({ clearanceLevel: 1, name: 1 }, { name: 'clearance_name' });

export type ConstructRecord = InferSchemaType<typeof constructSchema>;
export type ConstructDocument = HydratedDocument<ConstructRecord>;

export const Construct = model('Construct', constructSchema);