export function debounce(callback: (busqueda: string) => void, time: number){
    let timeout: ReturnType<typeof setTimeout>;
    return (busqueda: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback(busqueda), time);
    }
}