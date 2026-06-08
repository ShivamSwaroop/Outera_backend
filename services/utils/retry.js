export const sleep = (ms) =>{
    new Promise((resolve)=>setTimeout(resolve, ms));
}

export async function retry(fn, retries = 3){
    let attempt = 0;

    while(attempt < retries) {
        try {
            return await fn();
        }catch(error){
            attempt++;

            if(attempt == retries){
                throw error;
            }
            await sleep(1000 * attempt);
        }
    }
}