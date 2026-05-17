import { type FocusEvent } from 'react';
import type { InputNumberProps } from 'antd';
import { Col, InputNumber, Row } from '../../antd';

enum InputType {
  Min,
  Max,
}

type ValuePair = (number | undefined)[];

export type FormDigitRangeProps = {
  value?: ValuePair;
  onChange?: (value: ValuePair) => void;
  separator?: string;
  separatorGap?: number;
  placeholder?: [string, string];
  suffix?: string;
  fieldProps?: InputNumberProps;
} & InputNumberProps;

const FormDigitRange = (props: FormDigitRangeProps) => {
  const {
    value = [],
    onChange,
    separator = '~',
    separatorGap = 10,
    placeholder = ['最小值', '最大值'],
    suffix,
    fieldProps,
  } = props;

  const handleChangeValue = (
    e: FocusEvent<HTMLInputElement>,
    type: InputType,
  ) => {
    let result = e.target.value !== '' ? Math.round(Number(e.target.value)) : undefined;
    const [min, max] = value;

    if (result !== undefined && !Number.isNaN(result)) {
      if (fieldProps?.min !== undefined && result < Number(fieldProps.min)) {
        result = Number(fieldProps.min);
      } else if (fieldProps?.max !== undefined && result > Number(fieldProps.max)) {
        result = Number(fieldProps.max);
      }
    } else if (fieldProps?.min !== undefined) {
      result = Number(fieldProps.min);
    }

    switch (type) {
      case InputType.Min:
        onChange?.(max !== undefined && result !== undefined && result > max ? [max, result] : [result, max]);
        break;
      case InputType.Max:
        onChange?.(min !== undefined && result !== undefined && min > result ? [result, min] : [min, result]);
        break;
    }
  };

  const renderInputNumber = (type: InputType) => (
    <InputNumber
      {...fieldProps}
      value={value[type] !== undefined ? Number(value[type]) : undefined}
      placeholder={placeholder[type]}
      onBlur={(event) => handleChangeValue(event, type)}
      style={{ width: '100%', ...(fieldProps?.style ?? {}) }}
    />
  );

  return (
    <Row gutter={separatorGap} align="middle" wrap={false}>
      <Col flex={1}>{renderInputNumber(InputType.Min)}</Col>
      <Col flex="none">
        <div>{separator}</div>
      </Col>
      <Col flex={1}>{renderInputNumber(InputType.Max)}</Col>
      {suffix ? <Col flex="none">{suffix}</Col> : null}
    </Row>
  );
};

export default FormDigitRange;