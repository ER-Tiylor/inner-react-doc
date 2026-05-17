import { useState } from 'react';
import FormDigitRange from '../../components/FormDigitRange';

const FormDigitRangeWithSuffixDemo = () => {
  const [value, setValue] = useState<(number | undefined)[]>([20, 200]);

  return (
    <div style={{ maxWidth: 420, padding: 24, border: '1px solid #e5e7eb', borderRadius: 16 }}>
      <div style={{ marginBottom: 12, fontWeight: 600 }}>带范围限制和后缀</div>
      <FormDigitRange
        value={value}
        onChange={setValue}
        suffix="kg"
        fieldProps={{ min: 0, max: 999 }}
      />
      <div style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>
        当前值：[{String(value[0])}, {String(value[1])}] kg
      </div>
    </div>
  );
};

export default FormDigitRangeWithSuffixDemo;