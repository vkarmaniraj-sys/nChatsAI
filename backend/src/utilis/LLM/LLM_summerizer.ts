import { callLLMForSummary } from "../../handler/together_API";

export default async function llmsummarize(text:string){
    if(text.length > 150){

        const summary = await callLLMForSummary(
            `Summarize for continuity. Max 10 tokens.\n\n${text}`
        );
        
        return summary;
    }
    else{
        return text;
    }
}