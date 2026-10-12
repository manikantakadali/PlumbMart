import React from 'react';
import PlumberActivities from './PlumberActivities';

/**
 * PlumberAssignedActivities wrapper for backwards compatibility
 */
export default function PlumberAssignedActivities({
  assignedOrders = [],
  activities = [],
  isLoading = false,
  error = null,
  onRetry,
  onUpdateStatus,
  onUpdateRemarks
}) {
  const combinedActivities = activities.length > 0 ? activities : assignedOrders;

  return (
    <PlumberActivities
      activities={combinedActivities}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onUpdateStatus={onUpdateStatus}
      onUpdateRemarks={onUpdateRemarks}
    />
  );
}
