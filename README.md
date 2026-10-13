# Fichas de participación

Herramienta web para premiar la participación en clase con una **economía de fichas**. Cada respuesta suma una ficha, las fichas se convierten en puntos del examen parcial y cada estudiante avanza por cinco títulos ilustrados («la escalera del dragón»).

Está pensada para asignaturas universitarias que cuesta motivar (métodos de investigación, estadística, psicometría…), pero sirve para cualquier materia.

## Qué hace

- **Panel de inicio** con tus asignaturas (colores UFV, ESIC u otro) y la escalera de títulos.
- **Tres modalidades de participación**:
  - **Libre**: preguntas a la clase, responde quien levanta la mano y tocas su tarjeta para darle la ficha.
  - **Ruleta**: una ruleta con sonido elige a una persona al azar. Quien sale no vuelve a salir hasta que pulsas *Restablecer todos*.
  - **Elige un amigo**: quien acaba de responder dice un número y ese número descubre a la siguiente persona. Los números están mezclados al azar y no se repiten en la misma clase.
- **Títulos por criterio absoluto**: se ganan por número de fichas y nunca por posición, así que todo el mundo puede llegar al último. Cuando alguien sube de nivel aparece una celebración a pantalla completa, con una fanfarria original al llegar al máximo.
- **Configuración por asignatura**: lista de estudiantes (pegada o CSV), fichas máximas por parcial, puntos que suman, meta grupal con recompensa, títulos, imágenes y frase final.
- **Dos parciales**: al cerrar el primero, los marcadores vuelven a 0 y el historial se conserva.
- **Vista del profesor** (privada) con ranking, estudiantes sin fichas y correcciones manuales.
- **Excel** con una hoja por asignatura (fichas y puntos de cada parcial y total) y una hoja *Registro* con fecha y hora de cada participación.
- **Banco de preguntas por tema o semana**: la tarjeta gira y muestra la respuesta al dar la ficha.
- **Acceso con contraseña** desde cualquier ordenador, con los datos en tu Google Sheets, o uso sin conexión.
- **Copias de seguridad** en JSON para restaurar todo el curso o moverlo a otro ordenador.

## Uso

1. Descarga o clona el repositorio y abre `index.html` en el navegador. También puedes publicarlo con **GitHub Pages**: *Settings → Pages → Deploy from branch → main / (root)*.
2. Pulsa **Nueva asignatura**, elige la institución y pega la lista de estudiantes. Formatos válidos:
   - una persona por línea, como `Apellidos, Nombre` o `Nombre Apellidos`;
   - un CSV con columnas `Nombre;Apellidos`.
3. Entra en la asignatura, elige la modalidad y empieza a dar fichas. *Deshacer* (o Ctrl/Cmd + Z) retira la última.

## Dónde se guardan los datos

La primera vez que abres la app eliges entre dos opciones:

- **Conectar con hoja de cálculo** (recomendado si usas varios ordenadores). Tus asignaturas, fichas y preguntas se guardan en tu Google Sheets. En cualquier ordenador del aula entras con tu **contraseña** y ves todo el historial. Requiere una configuración previa, una sola vez.
- **Usar sin conexión**. Los datos se quedan solo en ese navegador. Sirve para probar o para un día sin internet; descarga copias de seguridad con frecuencia.

### Configurar la hoja (una sola vez, unos 5 minutos)

La app te guía en *Conectar con hoja de cálculo → Configurar ahora*:

1. **Crea la hoja.** Sube `google-sheets/Fichas_participacion.xlsx` a tu Google Drive y ábrela con Hojas de cálculo de Google.
2. **Pega el script.** En la hoja: *Extensiones → Apps Script*. Borra lo que haya y pega `google-sheets/Codigo.gs`.
3. **Elige tu contraseña.** Escríbela en la línea `const CLAVE = '…'` y guarda.
4. **Publica.** *Implementar → Nueva implementación →* engranaje *→ Aplicación web*. **Ejecutar como:** Yo. **Quién tiene acceso:** Cualquier usuario. Autoriza con tu cuenta (si sale «app no verificada»: *Configuración avanzada → Ir a…*).
5. **Conecta.** Pega en la app la dirección que termina en `/exec` y tu contraseña, y pulsa *Probar y entrar*.
6. **Opcional pero recomendado:** descarga `config.js` desde la app y súbelo a este repositorio, sustituyendo el que hay. A partir de entonces, en cualquier ordenador la app solo pedirá la contraseña.

### En el aula

- Abre la app (por ejemplo, desde un enlace en Canvas), escribe tu contraseña y deja **sin marcar** «Recordar en este ordenador».
- Al terminar, pulsa **Cerrar sesión**: los cambios pendientes se guardan en la hoja y se borra la copia del ordenador. Si cierras el navegador sin hacerlo, la copia también se borra.
- Tras 8 contraseñas incorrectas seguidas, el script bloquea el acceso 10 minutos.

La hoja tiene tres pestañas: **Notas** (fichas, puntos y respuestas por estudiante; se reescribe en cada guardado), **Registro** (fecha, hora, resultado y pregunta de cada participación) y **_datos** (oculta; la copia completa que usa la app, no la edites).

La dirección del script no es secreta: sin la contraseña no da acceso a nada. La contraseña sí: no la publiques. Si modificas el script, usa *Implementar → Gestionar implementaciones →* lápiz *→ Nueva versión* para conservar la misma dirección. Algunas cuentas de Google de universidades no permiten elegir «Cualquier usuario»; en ese caso usa una cuenta personal.

## Banco de preguntas

Para que la ficha dependa de una respuesta contrastable y no del criterio del momento, cada asignatura puede tener preguntas cortas por **tema o semana**:

- En *Configurar → Banco de preguntas* subes un archivo **CSV, Excel o JSON** con las columnas **Tema** (o Semana), **Pregunta**, **Respuesta** y, opcionalmente, **Explicación**. Hay una plantilla en `google-sheets/plantilla_preguntas.csv` y en el botón *Descargar plantilla*. También puedes añadirlas una a una.
- En clase eliges el tema y pulsas **Sacar pregunta**. Eliges quién responde con cualquiera de las tres modalidades. Pulsas **Correcta · +1 ficha** o **Incorrecta**, y la tarjeta **gira y muestra la respuesta** a toda la clase. *Mostrar respuesta* la gira sin asignar a nadie.
- Las preguntas usadas se marcan para no repetirlas. Cuando se agotan, se reutilizan empezando por las más antiguas, y puedes volver a marcarlas como no usadas por tema.
- El Excel y la hoja registran qué pregunta respondió cada estudiante y si acertó.

Formato JSON aceptado: una lista de objetos `{"tema": "...", "pregunta": "...", "respuesta": "...", "explicacion": "..."}` (o `{"preguntas": [...]}`).

El Excel necesita conexión a internet la primera vez, porque carga la librería [SheetJS](https://sheetjs.com/) desde cdnjs. Sin conexión se descarga un CSV que Excel abre igual.

## Estructura

```
index.html                               La aplicación completa (HTML, CSS y JavaScript, sin compilación)
config.js                                Dirección de tu hoja (se genera desde la app)
img/                                     Banner y las ilustraciones de los cinco títulos
google-sheets/Codigo.gs                  Script que conecta la app con tu hoja de Google
google-sheets/Fichas_participacion.xlsx  Plantilla de la hoja (Notas, Registro, _datos)
google-sheets/plantilla_preguntas.csv    Ejemplo del formato del banco de preguntas
LICENSE                                  Licencia MIT
```

## Principios de diseño conductual

- **Refuerzo inmediato y visible**: la ficha aparece al instante, con sonido y animación.
- **Criterio absoluto**: no hay plazas limitadas ni comparación pública. El ranking solo aparece en la vista del profesor.
- **Meta grupal**: la barra de la clase suma las fichas de todo el grupo hacia una recompensa común.
- **Reparto de oportunidades**: la ruleta y *Elige un amigo* dan turno a quienes no suelen levantar la mano.
- **Criterio contrastable**: la respuesta correcta se muestra a toda la clase, así la ficha no depende de la percepción de favoritismo.
- **Feedback de competencia**: al acertar y al subir de nivel, el mensaje habla de lo aprendido, no de los puntos.

## Licencia

El código se publica bajo la [licencia MIT](LICENSE). Las ilustraciones de `img/` se generaron con IA para este proyecto y se distribuyen con el repositorio para su uso educativo.
