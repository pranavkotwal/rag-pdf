import React from 'react'

type Props = {pdf_url: string}

export const PDFViewer = ({pdf_url}: Props) => {
    return (
        <iframe src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`} className='h-full w-full'>

        </iframe>
    )
}
