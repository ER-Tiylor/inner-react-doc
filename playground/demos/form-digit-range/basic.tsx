import { useState } from 'react';
import FormDigitRange from '../../components/FormDigitRange';

const FormDigitRangeBasicDemo = () => {
  const [value, setValue] = useState<(number | undefined)[]>([10, 50]);

  return (
    <div style={{ maxWidth: 420, padding: 24, border: '1px solid #e5e7eb', borderRadius: 16 }}>
      <div style={{ marginBottom: 12, fontWeight: 600 }}>基础用法</div>
      <FormDigitRange value={value} onChange={setValue} />
      <div style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>
        当前值：[{String(value[0])}, {String(value[1])}]
      </div>
    </div>
  );
};

export default FormDigitRangeBasicDemo;