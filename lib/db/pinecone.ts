import {Pinecone, PineconeRecord} from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server'
import {Document} from "langchain/document"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import {PDFLoader} from 'langchain/document_loaders/fs/pdf'
// import {Document,RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter'
import { getEmbeddings } from './embeddings';
import md5 from 'md5';
import { metadata } from '@/app/layout';
import { convertToAscii } from '../utils';
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
    const loader = new PDFLoader(file_name)
    const pages = (await loader.load()) as PDFPage[];

    //2. Split and segment the pdf 
    // pages = Array(12) => documents = Array(100)
    const documents = await Promise.all(pages.map(page=>prepareDocument(page)))
    console.log("List of documents",documents)
    // 3. vectorise and embed indivicdual documents 
    const vectors = await Promise.all(documents.flat().map(embedDocuments))

    //4. upload to pinecone

    const client = await getPineconeClient()
    const pineconeIndex = await client.Index('chatpdfpk')


    const namespace = pineconeIndex.namespace(convertToAscii(fileKey)) //namespace should be ascii compatible
    
    console.log('inseriting vectors into pincone')

    await namespace.upsert(vectors)

    return documents[0]



    


}

async function embedDocuments(doc:Document) {
    try {
        const embeddings = await getEmbeddings(doc.pageContent)
        const hash = md5(doc.pageContent)
        return {
            id:hash,
            values:embeddings,
            metadata:{
                text:doc.metadata.text,
                pageNumber:doc.metadata.pageNumber
            }
        } as PineconeRecord;
        
    } catch (error) {
        console.log('error embedding document',error)
        throw error
    }
    
}

export const truncateStringByBytes = (str:string,bytes:number) =>{
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0,bytes))
}
async function prepareDocument(page:PDFPage) {

    let {pageContent,metadata} = page;

    pageContent = pageContent.replace(/\n/g,'')  // newline chars will be replaced with an empty string

    // split the docs

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize:50,
        chunkOverlap:0
    })
    
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata:{
                pageContent:metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent,36000)

            }
            
})
    ],
    )
    return docs

    
}