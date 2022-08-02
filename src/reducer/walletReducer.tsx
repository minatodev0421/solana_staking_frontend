const initialState = {
    arteNumber: 0,
    claimXal: 0,
    walletState: false,
}
export default (state = initialState, action:any) => {
    switch (action.type) {
        case 'SET_NUM':
            return {
                ...state,
                arteNumber: action.payload
            }
        case 'SET_CLAIM':
            return {
                ...state,
                claimXal: action.payload
            }
        default: 
            return state;
    
    }
}