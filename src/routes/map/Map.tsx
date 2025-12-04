import { NaverMap } from '../../component/NaverMap';
import ApiErrorBoundary from '../../boundary/ApiErrorBoundary';
import { SearchFetcher } from '../../api/fetchHooks';
import SearchInput from '../../component/SearchInput';
import ResultsContainer from '../../component/Container/ResultsContainer';
import { RxHamburgerMenu } from "react-icons/rx";
import { useMapStore } from '../../store/data';

const Map = () => {
    const { search, longtitude, latitude, setSearch } = useMapStore();

    return (
        <div className='flex flex-col w-full h-[100vh] overflow-hidden'>
            <div className='flex items-center justify-between'>
                <RxHamburgerMenu className='text-2xl ml-[10px]' />
                <SearchInput search={search} setSearch={setSearch} />
            </div>
            <NaverMap longtitude={longtitude} latitude={latitude} />
            <ApiErrorBoundary>
                <SearchFetcher keyword={search}>
                    <ResultsContainer />
                </SearchFetcher>
            </ApiErrorBoundary>
        </div>
    );
}

export default Map
