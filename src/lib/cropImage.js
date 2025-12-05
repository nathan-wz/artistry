/**
 * getCroppedImg
 * @param {string} imageSrc - URL or data URL of the image
 * @param {Object} pixelCrop - { x, y, width, height } from react-easy-crop
 * @param {File} file - original File object (optional, used to preserve type)
 * @returns {Promise<File>} - cropped image as File
 */

export async function getCroppedImg(imageSrc, pixelCrop, file) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    // Draw the cropped image onto the canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Canvas is empty"));
                return;
            }
            // Preserve the original file type if available
            const fileType = file?.type || "image/jpeg";
            const croppedFile = new File([blob], file?.name || "cropped.jpeg", {
                type: fileType,
                lastModified: Date.now(),
            });
            resolve(croppedFile);
        }, file?.type || "image/jpeg");
    });
}

/**
 * Helper to create HTMLImageElement from src
 */
function createImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", (err) => reject(err));
        img.setAttribute("crossOrigin", "anonymous"); // to avoid CORS issues
        img.src = url;
    });
}
