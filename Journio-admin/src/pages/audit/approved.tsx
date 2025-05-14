import { AuditStatus } from '@/store/audit';
import React from 'react';
import AuditTable from './components/AuditTable';

const ApprovedAudit: React.FC = () => {
  return <AuditTable status={AuditStatus.Approved} />;
};

export default ApprovedAudit;
