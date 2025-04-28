import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Importa useLocation
import { Question } from '../types/Question'; // Importa el tipo Question

// Función auxiliar para mezclar un array aleatoriamente (Algoritmo de Fisher-Yates)
const shuffleArray = <T extends any>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Intercambia elementos
    }
    return shuffled;
};

// Componente principal del juego
const Game: React.FC = () => {
    const { theme } = useParams<{ theme: string }>(); // Obtiene el tema de los parámetros de la URL
    const navigate = useNavigate(); // Hook para la navegación
    const location = useLocation(); // Hook para obtener el estado de la navegación

    // Extrae el tiempo inicial y el título del quiz del estado de la navegación
    // con valores por defecto si no se proporcionan
    const initialTimeFromMenu = (location.state as { initialTime?: number })?.initialTime || 5000;
    const quizTitleFromMenu = (location.state as { quizTitle?: string })?.quizTitle || 'Quiz'; // Valor por defecto 'Quiz'


    const [questions, setQuestions] = useState<Question[]>([]); // Todas las preguntas del tema
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Índice de la pregunta actual
    const [score, setScore] = useState({ correct: 0, incorrect: 0 }); // Puntuación (aciertos y errores)
    const [level, setLevel] = useState(1); // Nivel actual del juego
    // Usa el tiempo inicial pasado desde el menú
    const [timePerQuestion, setTimePerQuestion] = useState(initialTimeFromMenu);
    const [timer, setTimer] = useState(timePerQuestion); // Tiempo restante para la pregunta actual
    // Estado para los 5 círculos del temporizador (true = azul, false = blanco)
    const [circleStates, setCircleStates] = useState<boolean[]>(Array(5).fill(true));
    const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]); // Opciones de respuesta mezcladas para la pregunta actual
    const [showCorrectAnswerFeedback, setShowCorrectAnswerFeedback] = useState(false); // Controla si se muestra la respuesta correcta después de un error
    const [correctAnswerText, setCorrectAnswerText] = useState(''); // Texto de la respuesta correcta para mostrar en el feedback
    const [showCorrectEmojiFeedback, setShowCorrectEmojiFeedback] = useState(false); // Controla si se muestra el emoji de respuesta correcta
    const [gameOver, setGameOver] = useState(false); // Estado de fin del juego

    // Refs para almacenar los IDs de los temporizadores, permitiendo limpiarlos
    const timerRef = useRef<number | null>(null); // Temporizador para el tiempo de respuesta
    const feedbackTimerRef = useRef<number | null>(null); // Temporizador para mostrar el feedback de respuesta correcta
    const emojiTimerRef = useRef<number | null>(null); // Temporizador para ocultar el emoji de respuesta correcta

    // --- Efecto para cargar las preguntas ---
    useEffect(() => {
        const loadQuestions = async () => {
            try {
                // Importa dinámicamente el archivo JSON basado en el parámetro del tema
                const data = await import(`../data/${theme}.json`);
                const loadedQuestions: Question[] = data.default;
                // Validación básica: asegurar que cada pregunta tenga al menos 4 opciones
                const validQuestions = loadedQuestions.filter(q => q.options && q.options.length >= 4);
                if (validQuestions.length === 0) {
                    console.error("No se encontraron preguntas válidas con al menos 4 opciones para este tema.");
                    navigate('/'); // Volver al menú si no hay preguntas válidas
                    return;
                }
                setQuestions(shuffleArray(validQuestions)); // Mezcla el orden de las preguntas válidas
                // Reinicia el estado del juego al cargar un nuevo tema
                setGameOver(false);
                setScore({ correct: 0, incorrect: 0 });
                setLevel(1);
                // Usa el tiempo inicial del menú, pero asegúrate de que el estado timePerQuestion se actualice
                setTimePerQuestion(initialTimeFromMenu);
                setCurrentQuestionIndex(0);
                setShowCorrectAnswerFeedback(false);
                setCorrectAnswerText('');
                setShowCorrectEmojiFeedback(false); // Reinicia el estado del emoji
                setCircleStates(Array(5).fill(true)); // Reinicia los círculos a azul
            } catch (error) {
                console.error("Error al cargar las preguntas:", error);
                // En caso de error, navega de vuelta al menú
                navigate('/');
            }
        };

        loadQuestions();

        // Función de limpieza del efecto
        return () => {
            // Limpia cualquier temporizador activo al desmontar el componente o al cambiar el tema
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
            if (feedbackTimerRef.current !== null) {
                clearTimeout(feedbackTimerRef.current);
            }
            if (emojiTimerRef.current !== null) {
                clearTimeout(emojiTimerRef.current);
            }
        };

    }, [theme, navigate, initialTimeFromMenu]); // Este efecto se ejecuta cuando cambia el tema, navigate o initialTimeFromMenu


    // --- Efecto para el temporizador de la pregunta y los círculos ---
    useEffect(() => {
        // No inicia el temporizador si no hay preguntas, si se acabaron las preguntas o si el juego terminó
        if (questions.length === 0 || currentQuestionIndex >= questions.length || gameOver) {
            return;
        }

        setTimer(timePerQuestion); // Reinicia el temporizador visual para la nueva pregunta
        setCircleStates(Array(5).fill(true)); // Reinicia los círculos a azul

        // Configura el temporizador principal para el tiempo límite de respuesta
        timerRef.current = window.setTimeout(() => {
            // Lógica cuando el tiempo se agota
            console.log("Tiempo agotado");
            setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 })); // Incrementa los errores
            // La respuesta correcta es la primera opción en el array 'options'
            setCorrectAnswerText(questions[currentQuestionIndex].options[0]); // Guarda la respuesta correcta para mostrar
            setShowCorrectAnswerFeedback(true); // Muestra el feedback de respuesta correcta
            // Configura un temporizador para ocultar el feedback y pasar a la siguiente pregunta después de 2 segundos
            feedbackTimerRef.current = window.setTimeout(() => {
                setShowCorrectAnswerFeedback(false);
                moveToNextQuestion(); // Pasa a la siguiente pregunta
            }, 2000); // Muestra el feedback por 2 segundos
        }, timePerQuestion);

        // Configura un intervalo para actualizar la visualización del temporizador y los círculos cada 100ms
        const countdownInterval = setInterval(() => {
            setTimer(prev => {
                const newTime = Math.max(0, prev - 100) + (timer - timer);

                // Calcula el tiempo por círculo
                const timePerCircle = timePerQuestion / 5;
                const updatedCircleStates = Array(5).fill(false); // Inicialmente todos blancos

                // Determina cuántos círculos deben estar azules
                // Usamos Math.floor para que el círculo cambie solo cuando el tiempo restante
                // cae por debajo del umbral del siguiente círculo.
                const filledCircles = Math.floor(newTime / timePerCircle);

                // Llena los círculos correspondientes de azul
                for (let i = 0; i < filledCircles; i++) {
                    updatedCircleStates[i] = true;
                }
                setCircleStates(updatedCircleStates); // Actualiza el estado de los círculos

                return newTime;
            });
        }, 100);


        // Función de limpieza del efecto
        return () => {
            // Limpia el temporizador principal y el intervalo de cuenta regresiva
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
            clearInterval(countdownInterval);
        };

    }, [currentQuestionIndex, questions, timePerQuestion, gameOver]); // Este efecto se ejecuta cuando cambia el índice de la pregunta, las preguntas, el tiempo por pregunta o el estado de fin del juego


    // --- Efecto para mezclar las respuestas ---
    useEffect(() => {
        // Asegura que haya preguntas cargadas y que el índice actual sea válido
        if (questions.length > 0 && currentQuestionIndex < questions.length) {
            const currentQuestion = questions[currentQuestionIndex];
            // Mezcla las opciones de respuesta proporcionadas en el JSON
            setShuffledAnswers(shuffleArray(currentQuestion.options));
        }
    }, [currentQuestionIndex, questions]); // Este efecto se ejecuta cuando cambia el índice de la pregunta o las preguntas


    // --- Efecto para verificar el fin del juego ---
    useEffect(() => {
        // Si el número de errores alcanza o supera 5
        if (score.incorrect >= 5) {
            setGameOver(true); // Establece el estado de fin del juego
            // Limpia cualquier temporizador activo para detener el juego
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
            if (feedbackTimerRef.current !== null) {
                clearTimeout(feedbackTimerRef.current);
            }
            if (emojiTimerRef.current !== null) {
                clearTimeout(emojiTimerRef.current);
            }
        }
    }, [score.incorrect]); // Este efecto se ejecuta cuando cambia el número de errores


    // --- Efecto para el sistema de niveles ---
    useEffect(() => {
        // Sube de nivel cada 10 aciertos.
        // La condición `level < Math.floor(score.correct / 10) + 1` asegura que el nivel solo suba una vez por cada bloque de 10 aciertos.
        if (score.correct > 0 && score.correct % 10 === 0 && level < Math.floor(score.correct / 10) + 1) {
            setLevel(prev => prev + 1); // Incrementa el nivel
            // Disminuye el tiempo por pregunta en 300ms, con un mínimo de 1000ms (1 segundo)
            setTimePerQuestion(prev => Math.max(1000, prev - 300));
            console.log(`¡Subiste al Nivel ${level + 1}! Tiempo por pregunta: ${Math.max(1000, timePerQuestion - 300)}ms`);
        }
    }, [score.correct, level, timePerQuestion]); // Este efecto se ejecuta cuando cambian los aciertos, el nivel o el tiempo por pregunta


    // Manejador de clic en una opción de respuesta
    const handleAnswerClick = (selectedAnswer: string) => {
        // Ignora clics si se está mostrando el feedback, el emoji o si el juego ha terminado
        if (showCorrectAnswerFeedback || showCorrectEmojiFeedback || gameOver) return;

        // La respuesta correcta es siempre la primera opción en el array 'options'
        const correct = questions[currentQuestionIndex].options[0] === selectedAnswer;

        // Limpia el temporizador actual de la pregunta inmediatamente al responder
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (correct) {
            console.log("Respuesta correcta");
            setScore(prev => ({ ...prev, correct: prev.correct + 1 })); // Incrementa aciertos
            setShowCorrectEmojiFeedback(true); // Muestra el emoji de respuesta correcta
            // Configura un temporizador para ocultar el emoji y pasar a la siguiente pregunta después de un breve retraso
            emojiTimerRef.current = window.setTimeout(() => {
                setShowCorrectEmojiFeedback(false);
                moveToNextQuestion(); // Pasa a la siguiente pregunta
            }, 1000); // Muestra el emoji por 1 segundo
        } else {
            console.log("Respuesta incorrecta");
            setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 })); // Incrementa errores
            // Guarda la respuesta correcta (la primera opción) para mostrar en el feedback
            setCorrectAnswerText(questions[currentQuestionIndex].options[0]);
            setShowCorrectAnswerFeedback(true); // Muestra el feedback de respuesta correcta
            // Configura un temporizador para ocultar el feedback y pasar a la siguiente pregunta después de 2 segundos
            feedbackTimerRef.current = window.setTimeout(() => {
                setShowCorrectAnswerFeedback(false);
                moveToNextQuestion(); // Pasa a la siguiente pregunta
            }, 2000); // Muestra el feedback por 2 segundos
        }
    };

    // Función para pasar a la siguiente pregunta
    const moveToNextQuestion = () => {
        // Limpia los temporizadores de feedback y emoji antes de pasar a la siguiente pregunta
        if (feedbackTimerRef.current !== null) {
            clearTimeout(feedbackTimerRef.current);
            feedbackTimerRef.current = null;
        }
        if (emojiTimerRef.current !== null) {
            clearTimeout(emojiTimerRef.current);
            emojiTimerRef.current = null;
        }
        setShowCorrectAnswerFeedback(false); // Asegura que el feedback esté oculto
        setShowCorrectEmojiFeedback(false); // Asegura que el emoji esté oculto

        // Si no es la última pregunta, simplemente avanza al siguiente índice
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Si es la última pregunta, vuelve al principio del array para ciclar las preguntas
            setCurrentQuestionIndex(0);
            // Opcionalmente, podrías añadir lógica aquí para un fin de juego diferente si se completan todas las preguntas
        }
    };

    // Manejador para volver al menú principal
    const handleBackToMenu = () => {
        // Limpia cualquier temporizador activo antes de navegar
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
        }
        if (feedbackTimerRef.current !== null) {
            clearTimeout(feedbackTimerRef.current);
        }
        if (emojiTimerRef.current !== null) {
            clearTimeout(emojiTimerRef.current);
        }
        navigate('/'); // Navega a la ruta raíz (menú)
    };

    // Muestra un mensaje de carga si las preguntas aún no se han cargado o no son válidas
    if (questions.length === 0 && !gameOver) {
        // Podrías añadir un mensaje más específico si no hay preguntas válidas
        return <div className="container mx-auto p-6 text-center">Cargando preguntas o no hay preguntas válidas para este tema...</div>;
    }


    // Muestra la pantalla de fin del juego si gameOver es true
    if (gameOver) {
        return (
            <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-md text-center">
                <h1 className="text-2xl font-bold mb-4 text-red-600">¡Juego Terminado!</h1>
                <p className="text-lg mb-2">Has cometido 5 errores. ¡Inténtalo de nuevo! 😊</p>
                <p className="text-lg mb-4">Aciertos totales: {score.correct} ✅</p>
                <p className="text-lg mb-6">Nivel alcanzado: {level} ⭐</p>
                <button
                    onClick={handleBackToMenu}
                    className="block w-full my-2 p-3 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-300"
                >
                    Volver al Menú
                </button>
            </div>
        );
    }

    // Obtiene la pregunta actual
    const currentQuestion = questions[currentQuestionIndex];

    // Renderiza la interfaz del juego
    return (
        // Contenedor principal centrado con padding y sombra
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-md text-center relative min-h-[500px] flex flex-col"> {/* Añadimos relative, min-h y flex-col */}
            {/* Botón para volver al menú (ahora un icono) */}
            <button
                onClick={handleBackToMenu}
                className="absolute top-4 left-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300 text-lg" // Cambiado a rounded-full y tamaño de texto
                aria-label="Volver al Menú" // Accesibilidad
            >
                🏠 {/* Icono de casa simple */}
            </button>

            {/* Título del quiz (permanece arriba) */}
            {/* Usamos el título pasado desde el menú */}
            <h2 className="text-xl font-semibold mb-4 text-gray-700 mt-4">{quizTitleFromMenu}</h2> {/* Añadimos mt-4 para espacio con el icono */}


            {/* Área de la pregunta (permanece arriba) */}
            <div className="mb-6">
                <p className="text-lg mb-4 text-gray-800">{currentQuestion.question}</p>
                {/* Muestra la imagen SOLO si la URL existe */}
                {currentQuestion.imageUrl && (
                    <img
                        src={currentQuestion.imageUrl}
                        alt="Imagen relacionada con la pregunta"
                        className="mx-auto rounded-md shadow-md mb-4 max-w-full h-auto"
                    />
                )}
            </div>

            {/* Opciones de respuesta (permanecen en el medio) */}
            <div className="flex flex-col items-center mb-auto"> {/* mb-auto empuja el contenido de abajo hacia abajo */}
                {shuffledAnswers.map((answer, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerClick(answer)}
                        // Deshabilita los botones mientras se muestra feedback o emoji
                        disabled={showCorrectAnswerFeedback || showCorrectEmojiFeedback}
                        className="block w-11/12 my-1 p-3 text-base font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {answer}
                    </button>
                ))}
            </div>

            {/* Muestra el feedback de respuesta incorrecta si showCorrectAnswerFeedback es true */}
            {showCorrectAnswerFeedback && (
                <div className="mt-6 p-3 bg-orange-400 text-white rounded-md font-bold text-lg">
                    Respuesta correcta: <strong>{correctAnswerText}</strong> 😔
                </div>
            )}

            {/* Muestra el emoji de respuesta correcta si showCorrectEmojiFeedback es true */}
            {showCorrectEmojiFeedback && (
                <div className="mt-6 text-green-600 text-4xl font-bold">
                    ¡Correcto! 🎉
                </div>
            )}

            {/* Contenedor de la puntuación y los círculos del temporizador (ahora en la parte inferior) */}
            <div className="mt-6 w-full"> {/* mt-6 añade espacio arriba, w-full ocupa todo el ancho */}
                {/* Contenedor de los círculos del temporizador */}
                <div className="flex justify-center items-center mb-4"> {/* mb-4 añade espacio debajo de los círculos */}
                    {circleStates.map((isFilled, index) => (
                        <div
                            key={index}
                            className={`w-5 h-5 rounded-full mx-1 transition-colors duration-300 ${isFilled ? 'bg-blue-500' : 'bg-gray-300'}`}
                        ></div>
                    ))}
                </div>
                {/* Muestra la puntuación y el nivel con emojis */}
                <div className="text-lg text-gray-600"> {/* Eliminamos mb-4 para que esté más cerca de los círculos */}
                    Aciertos: {score.correct} ✅ | Errores: {score.incorrect} ❌ | Nivel: {level} ⭐
                </div>
            </div>

        </div>
    );
};

export default Game;
