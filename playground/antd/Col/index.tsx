import { Col, type ColProps } from 'antd';

const SCol = (props: ColProps) => {
  return <Col {...props}>{props.children}</Col>;
};

export default SCol;