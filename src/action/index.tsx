export const setArtNumber = (num:Number) => {
    return{
        type:'SET_NUM',
        payload: num
    }
}
export const setClaim = (claimArt:any[]) => {
    return{
        type:'SET_CLAIM',
        payload: claimArt.length
    }
}