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
- **Guardado en este ordenador o en Google Sheets**, a elegir.
- **Copias de seguridad** en JSON para restaurar todo el curso o moverlo a otro ordenador.

## Uso

1. Descarga o clona el repositorio y abre `index.html` en el navegador. También puedes publicarlo con **GitHub Pages**: *Settings → Pages → Deploy from branch → main / (root)*.
2. Pulsa **Nueva asignatura**, elige la institución y pega la lista de estudiantes. Formatos válidos:
   - una persona por línea, como `Apellidos, Nombre` o `Nombre Apellidos`;
   - un CSV con columnas `Nombre;Apellidos`.
3. Entra en la asignatura, elige la modalidad y empieza a dar fichas. *Deshacer* (o Ctrl/Cmd + Z) retira la última.

## Dónde se guardan los datos (importante)

Puedes elegirlo en **Inicio → Dónde se guardan los datos** (también aparece en *Configurar* dentro de cada asignatura):

- **Este ordenador**: los datos se guardan en el navegador (`localStorage`). Descarga una **copia de seguridad** al menos una vez por semana (*Datos y copias → Descargar copia*); la app te avisa si no lo has hecho. Para cambiar de ordenador, descarga la copia y usa *Restaurar copia* en el otro.
- **Google Sheets**: cada cambio se guarda en una hoja de tu Google Drive. Puedes abrir la app desde cualquier ordenador o móvil y ver las notas directamente en la hoja. El navegador conserva además una copia, así que si un día falla la conexión puedes seguir dando fichas y se suben cuando vuelve.

### Guardar en Google Sheets (se configura una vez, unos 5 minutos)

1. **La hoja.** Usa la hoja que ya está creada en tu Drive (*Fichas de participación · datos*) o crea una importando `google-sheets/Fichas_participacion.xlsx` (Drive → Nuevo → Subir archivo → abrir con Hojas de cálculo de Google).
2. **El script.** En la hoja: *Extensiones → Apps Script*. Borra lo que haya y pega todo el contenido de `google-sheets/Codigo.gs`.
3. **La clave.** Cambia `CAMBIA-ESTA-CLAVE` por una palabra secreta tuya y guarda (icono del disquete).
4. **Publicar.** *Implementar → Nueva implementación →* engranaje *→ Aplicación web*. En **Ejecutar como** elige *Yo* y en **Quién tiene acceso** elige *Cualquier usuario*. Pulsa *Implementar* y autoriza con tu cuenta. Google mostrará un aviso de «app no verificada» porque el script es tuyo: *Configuración avanzada → Ir a … (no seguro)*.
5. **Conectar.** Copia la URL que termina en `/exec`. En la app: *Inicio → Dónde se guardan los datos → Google Sheets*, pega la URL y la clave y pulsa **Conectar**.

Al conectar, si la hoja ya tiene datos, la app pregunta si quieres combinarlos con los del ordenador, usar solo los de la hoja o sustituirlos.

La hoja tiene tres pestañas:

- **Notas**: fichas y puntos de cada estudiante por parcial. Se reescribe en cada guardado, así que copia los datos a otro sitio antes de tocarlos.
- **Registro**: fecha y hora de cada participación.
- **_datos** (oculta): la copia completa que usa la app. No la edites.

La URL y la clave funcionan como una contraseña: no las publiques. Si modificas el código del script, usa *Implementar → Gestionar implementaciones →* lápiz *→ Nueva versión* para conservar la misma URL. Si usas una cuenta de Google de la universidad, puede que no deje elegir *Cualquier usuario*; en ese caso usa una cuenta personal.

El Excel necesita conexión a internet la primera vez, porque carga la librería [SheetJS](https://sheetjs.com/) desde cdnjs. Sin conexión se descarga un CSV que Excel abre igual.

## Estructura

```
index.html                               La aplicación completa (HTML, CSS y JavaScript, sin compilación)
img/                                     Banner y las ilustraciones de los cinco títulos
google-sheets/Codigo.gs                  Script que conecta la app con tu hoja de Google
google-sheets/Fichas_participacion.xlsx  Plantilla de la hoja (Notas, Registro, _datos)
LICENSE                                  Licencia MIT
```

## Principios de diseño conductual

- **Refuerzo inmediato y visible**: la ficha aparece al instante, con sonido y animación.
- **Criterio absoluto**: no hay plazas limitadas ni comparación pública. El ranking solo aparece en la vista del profesor.
- **Meta grupal**: la barra de la clase suma las fichas de todo el grupo hacia una recompensa común.
- **Reparto de oportunidades**: la ruleta y *Elige un amigo* dan turno a quienes no suelen levantar la mano.

## Licencia

El código se publica bajo la [licencia MIT](LICENSE). Las ilustraciones de `img/` se generaron con IA para este proyecto y se distribuyen con el repositorio para su uso educativo.
