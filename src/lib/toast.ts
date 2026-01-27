type ToastTypes = 'success' | 'error' | 'info' | 'warning';

interface ShowToastProps {
    elemento?: HTMLElement | null;
    mensaje: string;
    duracion?: number;
    tipo?: ToastTypes;
    promise?: boolean;
}

export function showToast({ elemento, mensaje, duracion = 3000, tipo="success", promise=false }: ShowToastProps): HTMLElement | null {
    const toaster = document.querySelector(".toaster") as HTMLDivElement;

    if(!toaster){
        console.error("No se encontró el elemento con la clase 'toaster'. Asegúrate de que exista en el DOM.");
        return null;
    }

    // Limpiar el timeout anterior si existe
    if(elemento){
        const prevTimeoutId = (elemento as any)._timeoutId;
        if (prevTimeoutId) {
            console.log(prevTimeoutId);
            clearTimeout(prevTimeoutId);
        }
    }

    let toastItem = elemento || document.createElement("div");
    toastItem.className = `toast-item text-xl rounded-md px-8 py-2`;
    toastItem.classList.add(`toast-${tipo}`);
    toastItem.textContent = mensaje;
    if(!toastItem.isConnected) toaster.appendChild(toastItem);

    // Cerrar el toast después de la duración especificada
    // Si es una promesa, no se cierra automáticamente
    if (promise) return toastItem;

    const toasterId = setTimeout(() => {
        toastItem.classList.add("cerrado");
        function transitionend(){
            toastItem.remove();
            toastItem.removeEventListener("transitionend", transitionend);
        }
        toastItem.addEventListener("transitionend", transitionend);
    }, duracion);

    (toastItem as any)._timeoutId = toasterId;

    return toastItem;
}