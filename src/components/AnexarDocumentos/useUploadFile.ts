import axios, { AxiosError } from 'axios';
import fluigConfig from '../../config';
import { useContratoContext } from '../Contratos/hooks/useContratoContext';



import { version as pdfjsVersion, GlobalWorkerOptions } from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import {  useState } from "react";

import * as pdfjsLib from 'pdfjs-dist';

// Configura o worker do PDF.js (necessário para processamento)
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

export function useUploadFile(){
  const {setError, setOpenError, uploadedFile, setUploadedFile} = useContratoContext()
  const [openUploadFile, setOpenUploadFile] = useState(false);

  function handleAttachmentFileProcess(result: any){
    void createFolderProcess(result.processInstanceId)
  }
async function saveDocument(idFolder: any){
  if(idFolder < 0) {setError("Não foi possível criar o diretório. Veja o log."); setOpenError(true)}
  uploadedFile.map(async (item)=>{
    await axios.post(fluigConfig.createDocumentUrl,{
      description: item,
      parentId: idFolder,
      attachments: [{fileName: item}]
    })
    .then(r=>{console.log('createDocument response',r)})
    .catch(e=>{
      console.log('createDocument error',e)
      setError(e instanceof AxiosError ? e.message : String(e))
      setOpenError(true)
    })
  })
}
async function createFolderProcess(idprocess: string){
  await axios.post(fluigConfig.createFolder, {
    description: idprocess.toString(),
    parentId: fluigConfig.idFolder
  })
  .then(r=>{
    console.log('createFolder response',r)
    if(r.data.content.id) saveDocument(r.data.content.id)
  })
  .catch(e=>{
    console.log('createFolder error: ',e)
    setError(e instanceof AxiosError ? e.message : String(e))
    setOpenError(true)
  })
}






// Configuração automática da versão correta
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function handleChangeFile(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
  setOpenUploadFile(true);

  if (!event.target.files?.length) {
    setError("Nenhum arquivo foi selecionado");
    setOpenError(true);
    return;
  }

  const file = event.target.files[0];

  try {
    // 1. Converter PDF para imagens (PDF estático)
    const pdfBytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) }).promise;
    const newPdfDoc = await PDFDocument.create();

    // Processar cada página
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); // Ajuste a qualidade aqui

      // Renderizar no canvas
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Falha ao criar contexto 2D");

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;

      // Converter para imagem e adicionar ao novo PDF
      const imageBytes = await canvasToArrayBuffer(canvas);
      const image = await newPdfDoc.embedPng(imageBytes);
      newPdfDoc.addPage([image.width, image.height])
        .drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    // 2. Criar novo arquivo PDF
    const staticPdfBytes = await newPdfDoc.save();
    const staticPdfFile = new File([staticPdfBytes], `static_${file.name}`, {
      type: 'application/pdf'
    });

    // 3. Fazer upload do PDF estático
    await uploadFile(staticPdfFile);

  } catch (error) {
    console.error("Erro na conversão:", error);
    setError(error instanceof Error ? error.message : "Falha ao processar PDF");
    setOpenError(true);
  }
}

// Helper: Canvas para ArrayBuffer
function canvasToArrayBuffer(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.readAsArrayBuffer(blob!);
    }, 'image/png');
  });
}
  /*function handleChangeFile(event: ChangeEvent<HTMLInputElement>): void{
    setOpenUploadFile(true)
    if(event.target.files){
      const file = event.target.files[0]
      if(file) void uploadFile(file)
    } else{
    setError("Nenhum arquivo foi selecionado")
    setOpenError(true)
    }
  }*/

  async function uploadFile(file: any){
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post(fluigConfig.uploadUrl, formData,{
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  .then(r=>{
    console.log('uploadFile response',r);
    const result = r.data;
    setUploadedFile([...uploadedFile,result.files[0].name]);
  })
  .catch(e=>{
    console.log('uploadFile error',e);
    setError('Erro ao carregar arquivo, verifique os detalhes no log.')
    setOpenError(true);
  })
  }
  return {handleChangeFile, openUploadFile, setOpenUploadFile, uploadedFile, handleAttachmentFileProcess}
}
