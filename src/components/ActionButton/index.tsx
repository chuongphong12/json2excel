
import type { useImportJson } from '../../hooks/useImportJson';
import { cn } from '../../lib/utils'

type Props = ReturnType<typeof useImportJson>;

const ActionButton = (props: Props) => {
  const { convertJsonToExcelData } = props;
  return (
    <div className={cn('flex gap-2 items-center justify-center p-4 border-2 border-dashed rounded-xl transition-colors border-slate-300 bg-slate-50 hover:border-blue-400')}>
      <button className='btn btn-lg' onClick={convertJsonToExcelData}>Convert to Excel</button >
      <button className='btn btn-lg'>Download Excel</button >
    </div >
  )
}

export default ActionButton