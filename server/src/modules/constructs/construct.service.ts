export function findVisibleById(id: string, clearance: number) {
    return Construct.findOne({ _id: id, clearanceLevel: { $lte: clearance } });
}