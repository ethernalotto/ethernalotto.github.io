import React, {useState} from 'react';

import {Modal as BSModal} from 'react-bootstrap';


export const ModalContext = React.createContext(null);


export const ModalContainer = ({children}) => {
  const [modal, setModal] = useState(['']);
  const showModal = (name, ...params) => setModal([name, ...params]);
  const hideModal = () => setModal(['']);
  return (
    <ModalContext.Provider value={{
      modal,
      name: modal[0],
      params: modal.slice(1),
      showModal,
      hideModal,
    }}>
      {children}
    </ModalContext.Provider>
  );
};


export const Modal = ({name, title, children, className}) => (
  <ModalContext.Consumer>{({modal, hideModal}) => (
    <BSModal
        show={modal[0] === name}
        centered
        dialogClassName={`modal-dialog-sm ${className}`}
        onHide={() => hideModal()}
    >
      <button type="button" className="btn btn-close-custom" onClick={() => hideModal()}/>
      <div className="modal-shadow">
        <div className="modal-shadow__title">
          <div className="one-row-title">
            <div className="one-row-title__top-frame">
              <div className="one-row-title__top-frame-clip"></div>
            </div>
            <div className="one-row-title__frame">
              <div className="one-row-title__frame-in">
                <div className="one-row-title__main-text">{title}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-clip">
          <div className="modal-content-wrapper">
            <div className="modal-inside">{children}</div>
            <div className="modal-clip__lines">
              <span className="modal-clip__line1"></span>
              <span className="modal-clip__line2"></span>
              <span className="modal-clip__line3"></span>
              <span className="modal-clip__line4"></span>
              <span className="modal-clip__line5"></span>
              <span className="modal-clip__line6"></span>
            </div>
          </div>
        </div>
        <div className="modal-behind"></div>
      </div>
    </BSModal>
  )}</ModalContext.Consumer>
);
