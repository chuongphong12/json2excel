import type { useImportJson } from '../../hooks/useImportJson';
import ReactJson from 'react-json-view';

type Props = ReturnType<typeof useImportJson>;

const object = {
  "avatar": 'https://i.imgur.com/MK3eW3As.jpg',
  "string": 'Import JSON to view here',
  "integer": 42,
}

const JsonEditor = (props: Props) => {
  const { json } = props;
  return (
    <ReactJson name={false} src={json || object} enableClipboard={false} displayDataTypes={false} displayObjectSize={false} theme="railscasts" collapseStringsAfterLength={false} />
  );
}

export default JsonEditor;