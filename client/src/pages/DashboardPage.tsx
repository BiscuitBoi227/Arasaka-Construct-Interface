import { AppLayout } from '../components/layout/AppLayout';
import { ConstructList } from '../features/constructs/ConstructList';


export function DashboardPage() {
    return (
        <AppLayout title="Construct Archive">
            <ConstructList />
        </AppLayout>
    );
}
