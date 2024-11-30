import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useSession } from '../SessionContext';

export default function Layout() {
    const { session } = useSession();
    const location = useLocation();


    if (!window.sessionStorage.getItem('session') && !session) {
        // Add the `callbackUrl` search parameter
        const redirectTo = `/login?callbackUrl=${encodeURIComponent(location.pathname)}`;

        return <Navigate to={redirectTo} replace />;
    }

    return (
        <DashboardLayout defaultSidebarCollapsed>
            <PageContainer title='' breadcrumbs={[]}>
                <Outlet />
            </PageContainer>
        </DashboardLayout>
    );
}
