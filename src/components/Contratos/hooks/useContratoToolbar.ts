import { useState } from "react";

export default function useContratoToolbar(){
  const [anchorEl,setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const handleClick =(event: React.MouseEvent<HTMLButtonElement>)=>{
    setAnchorEl(event.currentTarget)
  }
  const handleClose= ()=>{
    setAnchorEl(null);
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined;
  return {anchorEl, handleClick, handleClose, id, open}
}

export  function useContratoToolbarAttach(){
  const [anchorAttach,setAnchorAttach] = useState<HTMLButtonElement | null>(null)
  const handleClickAttach =(event: React.MouseEvent<HTMLButtonElement>)=>{
    setAnchorAttach(event.currentTarget)
  }
  const handleCloseAttach= ()=>{
    setAnchorAttach(null);
  }

  const openAttach = Boolean(anchorAttach)
  const idAttach = openAttach ? 'simple-popover-attach' : undefined;
  return {anchorAttach, handleClickAttach, handleCloseAttach, idAttach, openAttach}
}
