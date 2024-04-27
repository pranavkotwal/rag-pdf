//attempt 2
import {HfInference} from "@huggingface/inference"

const hf = new HfInference(process.env.HF_TOKEN);


export async function getEmbeddings(text:string) {
    try {
        const response =  await hf.featureExtraction({
            model:'sentence-transformers/all-MiniLM-L6-v2',
            inputs:text
        })

        console.log("adfadsfasdfasdfasdfasdf",response)

        // return response[0] as number[]
        return response
    } catch (error) {
        console.log('error calling hugging face embedding',error)
        throw error
        
    }
}