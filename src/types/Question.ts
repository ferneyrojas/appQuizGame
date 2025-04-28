export interface Question {
    question: string; // Texto de la pregunta
    options: string[]; // Arreglo de opciones de respuesta. La primera opción (índice 0) es la correcta.
    imageUrl: string; // URL de la imagen asociada a la pregunta
}