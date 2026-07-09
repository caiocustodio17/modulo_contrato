import { useContext } from "react"
import { NotasContext } from "./NotasContext"

export default function useNotasContext(){
  const context = useContext(NotasContext)
  if(!context) throw new Error('useNotasContext deve envolver os componentes dentro do NotasProvider.')
  return context
}
