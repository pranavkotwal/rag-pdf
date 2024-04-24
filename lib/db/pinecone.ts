import {Pinecone,PineconeRecord} from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server'
import {PDFLoader} from 'langchain/document_loaders/fs/pdf'

export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

type PDFPage = {
    pageContent:string;
    metadata:{
        loc:{pageNumber:number}
    }
}

export async function loadS3IntoPinecone(fileKey:string){
    // 1. obtain the pdf > download and read from the pdf
    console.log('downloading s3 into file system')

    const file_name = await downloadFromS3(fileKey);
    console.log('filename',file_name)
    if(!file_name){
        throw new Error("Could not download from s3")
    }
    // const objurl = 'https://pdfchat-pk.s3.ap-southeast-2.amazonaws.com/uploads/1713420341298cache-types.pdf'



    const loader = new PDFLoader(file_name)
    const pages = (await loader.load()) as PDFPage[];

    return pages;


}