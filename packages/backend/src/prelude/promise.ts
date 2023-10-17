// Returns T if promise settles before timeout, otherwise returns void, finishing execution in the background.
export async function promiseEarlyReturn<T>(promise: Promise<T>, after: number): Promise<T | void> {
    const timer: Promise<void> = new Promise((res) => setTimeout(() => res(undefined), after));
    return Promise.race([promise, timer]);
}