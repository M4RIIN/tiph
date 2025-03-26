// components/Modal.js
import React, { ReactElement } from 'react';
import './styles.css'
interface Props {
    isOpen:boolean,
    content: ReactElement,
    onClosed: ()=>void
};

const Modal = (props:Props) => {
  if (!props.isOpen) return null;

  return (
    <div className="modal-overlay" onClick={props.onClosed}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {props.content}
        <button onClick={props.onClosed}>Fermer</button>
      </div>
    </div>
  );
};

export default Modal;
