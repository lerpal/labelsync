import { useCallback, useState } from 'react';

const useFlag = (initialState: boolean = false): [boolean, () => void, () => void] => {
    const [flag, setFlag] = useState<boolean>(initialState);
    const setFlagToTrue = useCallback(() => setFlag(true), [setFlag]);
    const setFlagToFalse = useCallback(() => setFlag(false), [setFlag]);
    return [flag, setFlagToTrue, setFlagToFalse];
};

export default useFlag;
