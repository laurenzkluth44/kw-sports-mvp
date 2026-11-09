import type { HelpGuide } from "./types";

// Login and password pages exist in German and English; Spanish clubs see them in English.
export const clubGuideEs: HelpGuide = {
  title: "Guía para clubes",
  intro:
    "Todo lo que podéis hacer en KW Club Hub, paso a paso: activar el acceso, mantener la plantilla al día, comunicar necesidades y responder a las propuestas de jugadores de KW Sports.",
  sections: [
    {
      id: "start",
      title: "Primeros pasos",
      topics: [
        {
          id: "zugang",
          title: "Activar el acceso",
          goal: "Una sola vez, tras la invitación de KW Sports.",
          quickstart: true,
          shot: "login",
          steps: [
            "Abre el correo «Your access to KW Club Hub» de KW Sports.",
            "Haz clic en [[Set up access]]. Se abre KW Club Hub.",
            "Haz clic otra vez en [[Set up access]] en esa página.",
            "Escribe dos veces tu nueva contraseña: al menos 10 caracteres, con letras y números. Las marcas indican cuándo todo es correcto.",
            "Haz clic en [[Save password]]. Llegas directamente al resumen de tu club."
          ],
          tip: "Las páginas de acceso se muestran en inglés. El enlace es válido 24 horas. ¿Caducado? Avisa a KW Sports y recibirás uno nuevo."
        },
        {
          id: "login",
          title: "Iniciar sesión y elegir idioma",
          goal: "Cada vez que vuelvas.",
          quickstart: true,
          steps: [
            "Abre KW Club Hub (mejor guardado como favorito).",
            "Escribe [[Email]] y [[Password]] y haz clic en [[Sign in]].",
            "Cambiar el idioma: haz clic en [[DE]] [[EN]] [[FR]] [[ES]] arriba a la derecha. En el móvil está en el [[Menú]]."
          ]
        },
        {
          id: "passwort",
          title: "Contraseña olvidada",
          goal: "Una nueva contraseña mediante un enlace por correo.",
          steps: [
            "En la página de acceso, haz clic en [[Forgot password?]].",
            "Escribe tu correo y haz clic en [[Send link]].",
            "Haz clic en el botón del correo y después en [[Continue]].",
            "Escribe dos veces la nueva contraseña y haz clic en [[Save password]]."
          ],
          tip: "¿No llega el correo? Revisa también la carpeta de spam."
        }
      ]
    },
    {
      id: "uebersicht",
      title: "Resumen",
      topics: [
        {
          id: "cockpit",
          title: "Leer el resumen",
          goal: "Vuestra página de inicio: lo importante de hoy.",
          quickstart: true,
          shot: "cockpit",
          steps: [
            "Arriba hay cuatro cifras: [[Jugadores en plantilla]], [[Necesidades activas]], [[Huecos]] de la próxima temporada y [[Nuevas propuestas KW]]. Cada cifra se puede pulsar.",
            "En [[Hoy]] están las próximas tareas, cada una con un botón: [[Ver]] para nuevas propuestas, [[Crear necesidad]] para un hueco, [[Confirmar]] para una necesidad sin confirmar desde hace tiempo.",
            "La tarjeta [[Plantilla]] muestra los puestos de la próxima temporada: azul = bien cubierto, blanco = un solo jugador, discontinuo = hueco. [[Abrir plantilla]] lleva a la planificación.",
            "Abajo del todo están vuestras necesidades. Un clic en una tarjeta la abre."
          ]
        }
      ]
    },
    {
      id: "kader",
      title: "Plantilla",
      topics: [
        {
          id: "spieler-anlegen",
          title: "Añadir un jugador",
          goal: "Nombre, puesto y fin de contrato bastan.",
          quickstart: true,
          steps: [
            "En el menú, haz clic en [[Plantilla]] y luego en [[Añadir jugador]].",
            "Escribe [[Nombre]] y [[Apellido]] y, si quieres, el [[Dorsal]].",
            "Elige el [[Puesto principal]]. Opcional: [[También puede jugar]] para los puestos que puede cubrir, y [[Puestos en defensa (6:0)]].",
            "Indica el fin del contrato en [[Contrato hasta]]. Los contratos terminan el 30 de junio, al final de la temporada.",
            "Haz clic en [[Añadir jugador]]. Aparece enseguida en la pizarra táctica."
          ],
          tip: "La plantilla solo la ve vuestro club. Ni KW Sports ni las agencias la ven."
        },
        {
          id: "import",
          title: "Importar la plantilla desde Excel",
          goal: "Pasar toda la plantilla de una vez.",
          quickstart: true,
          shot: "import",
          steps: [
            "En el menú, haz clic en [[Plantilla]] y luego en [[Importar desde Excel]].",
            "¿No tienes una lista adecuada? Haz clic en [[Descargar plantilla]], rellénala y guárdala.",
            "Arrastra el archivo (.xlsx o .csv) a la zona o haz clic en [[Elegir archivo]].",
            "Revisa la vista previa: desmarca [[Incluir]] en los jugadores que no quieras importar. Las filas omitidas aparecen arriba con el motivo.",
            "Haz clic en [[Importar jugadores]]. Listo."
          ],
          tip: "Columnas obligatorias: nombre, puesto y contrato hasta. Guarda los archivos .xls antiguos como .xlsx."
        },
        {
          id: "taktiktafel",
          title: "Leer la pizarra táctica y los huecos",
          goal: "Ver dónde faltarán jugadores en las próximas temporadas.",
          quickstart: true,
          shot: "squad",
          steps: [
            "En la página [[Plantilla]], elige la temporada arriba, p. ej. [[2027/28]].",
            "Cambia de sistema con [[Ataque]] y [[Defensa 6:0]].",
            "Los círculos muestran cuántos jugadores tienen contrato en ese puesto esa temporada: azul = cubierto (2+), blanco = justo (1), discontinuo = hueco.",
            "A la derecha, [[Por resolver]] lista los puestos justos y los huecos. [[Crear necesidad]] abre una nueva necesidad con ese puesto y temporada ya rellenados."
          ]
        },
        {
          id: "spieler-bearbeiten",
          title: "Editar o quitar un jugador",
          goal: "Contrato renovado, puesto cambiado, jugador que se va.",
          steps: [
            "En [[Plantilla]], haz clic en [[Editar]] junto al jugador.",
            "Cambia los datos y haz clic en [[Guardar cambios]].",
            "Para quitarlo: haz clic en [[Quitar jugador]] abajo y luego en [[Eliminar definitivamente]]."
          ]
        }
      ]
    },
    {
      id: "bedarfe",
      title: "Necesidades",
      topics: [
        {
          id: "bedarf-anlegen",
          title: "Crear una necesidad",
          goal: "Decir a KW Sports qué puesto o qué entrenador buscáis.",
          quickstart: true,
          shot: "needForm",
          steps: [
            "En el menú, haz clic en [[Nueva necesidad]].",
            "Paso 1 [[Tipo y puesto]]: elige [[Jugador]] o [[Entrenador]]. Para jugadores, toca los puestos en la pista y cambia con [[Ataque]] y [[Defensa 6:0]]. Se pueden elegir varios. Después [[Siguiente]].",
            "Paso 2 [[Fecha y estado]]: temporada, [[Necesario desde]] y [[Prioridad]]. [[Siguiente]].",
            "Paso 3 [[Perfil]] (opcional): edad, altura, tipo de jugador, idiomas, experiencia de liga y una [[Breve descripción]]. Cuanto más preciso, mejores propuestas. [[Siguiente]].",
            "Paso 4 [[Presupuesto y confidencial]] (opcional): indica un presupuesto. El campo [[Confidencial · solo KW Sports]] es para lo que solo debe saber KW Sports, p. ej. la banda salarial.",
            "Haz clic en [[Crear necesidad]]. KW Sports y las agencias colaboradoras ya la ven."
          ],
          tip: "Las agencias colaboradoras también ven la descripción y el presupuesto. Solo el campo confidencial queda en KW Sports."
        },
        {
          id: "bedarf-pflegen",
          title: "Editar, copiar y mantener al día una necesidad",
          goal: "Para que KW Sports y las agencias sepan cómo está.",
          shot: "need",
          steps: [
            "Haz clic en la necesidad en el resumen.",
            "Para cambiarla: [[Editar]], ajustar, [[Guardar cambios]].",
            "Para una necesidad parecida: [[Copiar como plantilla]].",
            "Elige el estado: [[Buscamos activamente]], [[Hablamos con candidatos]], [[El puesto está cubierto]] o [[Ya no es relevante]].",
            "A los 30 días la plataforma pregunta: un clic en [[Sigue vigente]] basta."
          ]
        },
        {
          id: "besetzt",
          title: "Comunicar un puesto cubierto",
          goal: "Cerrar la necesidad.",
          shot: "filled",
          steps: [
            "Abre la necesidad y elige el estado [[El puesto está cubierto]].",
            "Indica cómo: [[A través de KW Sports]], [[A través de otra agencia]], [[Búsqueda propia]] o [[Plantilla propia / cantera]].",
            "La necesidad pasa a [[Necesidades cerradas]]. Ya no recibe propuestas."
          ]
        }
      ]
    },
    {
      id: "vorschlaege",
      title: "Propuestas de jugadores",
      topics: [
        {
          id: "vorschlag-ansehen",
          title: "Ver una propuesta de KW Sports",
          goal: "KW Sports propone jugadores adecuados con perfil y CV.",
          quickstart: true,
          shot: "suggestions",
          steps: [
            "Recibís un correo. O haz clic en [[Propuestas KW]] en el menú (la cifra indica las nuevas).",
            "A la izquierda: el jugador con foto, edad, altura y contrato. La pizarra táctica muestra sus puestos, en azul los que encajan con vuestra necesidad.",
            "En [[Por qué esta propuesta]] veis qué criterios cumple: marca = sí, interrogación = aún no se sabe.",
            "Haz clic en [[Abrir CV (PDF)]] para el CV completo con estadísticas. Los vídeos de partidos están enlazados en el propio CV.",
            "[[Ver vídeo]] abre el vídeo de jugadas destacadas, si existe."
          ],
          tip: "Las propuestas son confidenciales y solo las ve vuestro club. Por favor, no las compartáis."
        },
        {
          id: "antworten",
          title: "Responder a una propuesta",
          goal: "Basta un clic.",
          quickstart: true,
          steps: [
            "Si queréis, añadid una nota para KW Sports, p. ej. salario, fechas o una prueba.",
            "Haz clic en [[Interesa]] o [[No interesa]].",
            "Si os interesa, KW Sports se pone en contacto con vosotros.",
            "¿Cambiáis de opinión? Haz clic en [[Cambiar respuesta]]."
          ]
        }
      ]
    },
    {
      id: "wissen",
      title: "Conviene saber",
      topics: [
        {
          id: "sichtbarkeit",
          title: "¿Quién ve qué?",
          goal: "Vuestros datos se quedan con vosotros.",
          quickstart: true,
          steps: [
            "[[Plantilla]]: solo vuestro club.",
            "Necesidades: KW Sports y las agencias colaboradoras, para encontrar jugadores adecuados. Otros clubes no las ven.",
            "El campo [[Confidencial · solo KW Sports]]: solo KW Sports.",
            "[[Propuestas KW]]: solo vuestro club y KW Sports."
          ]
        },
        {
          id: "erinnerung",
          title: "Correos de KW Club Hub",
          goal: "Lo que llega automáticamente.",
          steps: [
            "Una nueva propuesta de jugador de KW Sports para una de vuestras necesidades.",
            "Una vez al mes, un recordatorio si una necesidad lleva más de 30 días sin confirmar.",
            "Invitación y enlaces de contraseña."
          ]
        }
      ]
    }
  ]
};
