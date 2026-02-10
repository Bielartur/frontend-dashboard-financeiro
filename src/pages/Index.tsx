import { useDashboardView } from '@/hooks/use-dashboard-view';
import { DashboardView } from './DashboardView';

const Index = () => {
  const viewProps = useDashboardView();

  return (
    <DashboardView
      {...viewProps}
      onSelectMetrics={viewProps.setSelectedMetrics}
    />
  );
};

export default Index;
