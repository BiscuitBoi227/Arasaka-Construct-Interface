import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { CONSTRUCT_STATUSES } from '@aci/shared';

const constructSchema = new Schema(
    {
        slug: { type: String, unique: true, sparse: true, trim: true },
        name: { type: String, required: true, trim: true },
        alias: { type: String, trim: true },
        gender: { type: String, required: true, trim: true },
        birthdate: { type: Date, required: true },
        affiliation: { type: String, trim: true },
        occupation: { type: String, trim: true },
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
            required: true,
            min: [1, 'clearanceLevel must be 1, 2, or 3'],
            max: [3, 'clearanceLevel must be 1, 2, or 3'],
            validate: { validator: Number.isInteger, message: 'clearanceLevel must be 1, 2, or 3' },
            default: 3,
        },
        scannedAt: { type: Date },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true },
);

constructSchema.index({ clearanceLevel: 1, name: 1 }, { name: 'clearance_name' });

export type ConstructRecord = InferSchemaType<typeof constructSchema>;
export type ConstructDocument = HydratedDocument<ConstructRecord>;

export const Construct = model('Construct', constructSchema);