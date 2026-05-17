import { Row, type RowProps } from 'antd';

const SRow = (props: RowProps) => {
  return <Row {...props}>{props.children}</Row>;
};

export default SRow;