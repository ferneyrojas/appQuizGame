import React from 'react';
import { useNavigate } from 'react-router-dom';

// Componente del menú principal
const Menu: React.FC = () => {
    const navigate = useNavigate(); // Hook para la navegación

    // Función para iniciar el juego con un tema específico, tiempo y título
    // Ahora acepta 'theme', 'initialTime' y 'quizTitle' como parámetros
    const startGame = (theme: string, initialTime: number, quizTitle: string) => {
        // Navega a la ruta del juego, pasando el tema como parámetro y el tiempo y título como estado
        navigate(`/game/${theme}`, { state: { initialTime: initialTime, quizTitle: quizTitle } });
    };

    return (
        // Contenedor principal centrado con padding y sombra
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-md text-center">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Selecciona un Tema</h1>

            {/* Botones para iniciar el juego con diferentes temas, tiempos y títulos específicos */}
            {/* Ahora llamamos startGame con el tema, el tiempo y el título deseado */}
            <button
                onClick={() => startGame('theme1', 5000, 'Quiz General')} // Ejemplo: 5 segundos, Título "Quiz General"
                className="block w-full my-2 p-3 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-300"
            >
                Jugar Quiz General (5s)
            </button>
            <button
                onClick={() => startGame('theme2', 7000, 'Quiz de Historia')} // Ejemplo: 7 segundos, Título "Quiz de Historia"
                className="block w-full my-2 p-3 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-300"
            >
                Jugar Quiz de Historia (7s)
            </button>
            <button
                onClick={() => startGame('theme3', 10000, 'Quiz de Ciencia')} // Ejemplo: 10 segundos, Título "Quiz de Ciencia"
                className="block w-full my-2 p-3 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-300"
            >
                Jugar Quiz de Ciencia (10s)
            </button>
            {/* Botón para el tema de capitales de Colombia */}
            <button
                onClick={() => startGame('colombia_capitals', 6000, 'Capitales de Colombia')} // Ejemplo: 6 segundos, Título "Capitales de Colombia"
                className="block w-full my-2 p-3 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-300"
            >
                Capitales de Colombia (6s)
            </button>
            <button
                onClick={() => startGame('tablas_multiplicar', 6000, 'Tablas de multiplicar')} // Ejemplo: 6 segundos, Título "Capitales de Colombia"
                className="block w-full my-2 p-3 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-300"
            >
                Tablas de multiplicar (6s)
            </button>

        </div>
    );
};

export default Menu;
