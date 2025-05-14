import { AuditStatus } from '@/store/audit';
import React from 'react';
import AuditTable from './components/AuditTable';

const RejectedAudit: React.FC = () => {
  return <AuditTable status={AuditStatus.Rejected} />;
};

export default RejectedAudit;
