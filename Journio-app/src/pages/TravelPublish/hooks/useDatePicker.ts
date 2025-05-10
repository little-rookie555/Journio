import { useState } from 'react';
import { Form } from 'antd-mobile';

export const useDatePicker = (form: ReturnType<typeof Form.useForm>[0]) => {
  const [dateVisible, setDateVisible] = useState(false);

  const handleDateConfirm = (val: Date) => {
    form.setFieldValue('travelDate', val);
  };

  return {
    dateVisible,
    setDateVisible,
    handleDateConfirm,
  };
};
