import type { useImportJson } from '../../hooks/useImportJson';

type Props = ReturnType<typeof useImportJson>;

const SpreadSheetViewer = (props: Props) => {
  const { excelData } = props;
  return (
    <div>
      <pre>{JSON.stringify(excelData, null, 2)}</pre>
    </div>
  )
}

export default SpreadSheetViewer