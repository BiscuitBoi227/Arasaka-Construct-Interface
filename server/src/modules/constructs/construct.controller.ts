export async function getConstruct(req: Request, res: Response) {
    const clearance = clearanceFor(req.user!.role);
    const construct = await findVisibleById(req.params.id, clearance);
    if (!construct) {
        res.status(404).json({ error: 'Construct not found' });
        return;
    }
    res.json(construct);
}