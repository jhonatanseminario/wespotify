//!==========================================================================!//
//!                             IMPORTAR MÓDULOS                             !//
//!==========================================================================!//

import { container } from './dom-events.js';
import { fetchArtists } from '../index.js';


//*==========================================================================*//
//*                 MANEJADOR DE DEBOUNCING PARA LA BÚSQUEDA                 *//
//*==========================================================================*//

export function debouncedHandler() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
        if (this.value) {
            container.innerHTML = '';
            fetchArtists(this.value);
        } 
    }, 400);
}


//*==========================================================================*//
//*                  OBTENER EL COLOR PROMEDIO DE UNA IMAGEN                 *//
//*==========================================================================*//

export function getAverageColor(imageUrl, callback) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
            count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        callback(`rgb(${r}, ${g}, ${b})`);
    };
}
