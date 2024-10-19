//*==========================================================================*//
//*            HELPERS PARA SELECTORES Y ESCUCHADORES DE EVENTOS             *//
//*==========================================================================*//

export const $ = selector => document.querySelector(selector);
export const $$ = selector => document.querySelectorAll(selector);

export function on(event, handler) {
    this.addEventListener(event, handler);
}

export function off(event, handler) {
    this.removeEventListener(event, handler);
}

Node.prototype.on = on;
Node.prototype.off = off;
