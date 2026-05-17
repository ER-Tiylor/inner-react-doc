import 'antd/dist/reset.css';
import type { CSSProperties } from 'react';
import { FormDigitRangeBasicDemo, FormDigitRangeWithSuffixDemo } from './index';

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 16,
};

const FormDigitRangePreview = () => {
  return (
    <div style={cardStyle}>
      <FormDigitRangeBasicDemo />
      <FormDigitRangeWithSuffixDemo />
    </div>
  );
};

export default FormDigitRangePreview;