import { AuditStatus } from '@/store/audit';
import React from 'react';
import AuditTable from './components/AuditTable';

const PendingAudit: React.FC = () => {
  return <AuditTable status={AuditStatus.Pending} showActions={true} />;
};

export default PendingAudit;
