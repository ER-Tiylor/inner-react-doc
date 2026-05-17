import { InputNumber, type InputNumberProps } from 'antd';
import { EMPTY } from '../const';

type ExtraProps = {
  viewMode?: boolean;
};

const SInputNumber = (props: InputNumberProps & ExtraProps) => {
  const { viewMode, children, ...restProps } = props;

  if (viewMode) {
    return <>{restProps.value ?? EMPTY}</>;
  }

  return (
    <InputNumber placeholder="请输入" {...restProps}>
      {children}
    </InputNumber>
  );
};

export default SInputNumber;