import JsonEditor from '../../components/JsonEditor'
import { useImportJson } from '../../hooks/useImportJson';
import JsonImport from '../../components/JsonImport';
import ActionButton from '../../components/ActionButton';
import SpreadSheetViewer from '../../components/SpreadsheetViewer';



const Home = () => {
  const hooks = useImportJson();
  return (
    <div className='flex flex-col w-full h-full overflow-auto gap-2'>
      <div className='flex-1 flex justify-center items-center w-full gap-4'>
        <JsonImport {...hooks} />
        <ActionButton {...hooks} />
      </div>
      <div className='flex-4 w-full flex gap-4'>
        <div className='flex-1 overflow-auto rounded-md p-4 bg-[#2b2b2b]'>
          <JsonEditor {...hooks} />
        </div>
        <div className='flex-1 overflow-auto rounded-md p-4 bg-[#2b2b2b]'>
          <SpreadSheetViewer {...hooks} />
        </div>
      </div>
    </div>
  )
}

export default Home