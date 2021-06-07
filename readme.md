# VCOM

VCOM es una aplicación de comunicación web para todos en donde estén.
Las principales funcionalidades de la aplicación son:
- Un sistema de autenticación y autorización basado en JWT lo cual mediante el uso de una conexión https lo hace paricularmente resistente.
- Chats de texto con tus amigos, recibe y envia mensajes.
- Comparte tu pantalla.
- Llamalos o realiza videoconferencia.

VCOM usa React como su FrontEnd y Express y nextJS para el BackEnd.

## Instrucciones de instalación
Es sencillo montar tu propio servidor VCOM.


### Software required
Primero de todo un listado del software que usamos

### Frontend
Usaremos el gestor de paquetes npm. 

- [React](https://es.reactjs.org/docs/create-a-new-react-app.html) Este paso vendrá mas tarde debido a NextJS.
- [NextJS](https://johnserrano.co/blog/introduccion-a-next-js-el-framework-de-react). Es un framework FullStack.

### Backend
- [Xampp](https://www.apachefriends.org/es/index.html)
- [NodeJS](https://nodejs.org/es/download/) Es importante instalar node js puesto que viene con npm.
- [NextJS](https://johnserrano.co/blog/introduccion-a-next-js-el-framework-de-react). Es un framework FullStack.
- [Express](https://expressjs.com/es/) Junto a NextJS, gestionan las peticiones de los clientes.



### Obtener los archivos de la aplicación
Simplemente clona el repositorio.


### Instrucciones
Lo primero es instalar Xampp con php y mysql, iniciar el servicio e importar el SQL.

Utilizamos algunas variables de entorno en un .env localizado en la carpeta base del proyecto para asegurar que los datos sean anonimos y continuen cifrados:
- MYSQL_HOST Ubicación del servidor MYSQL.
- MYSQL_PORT Puerto del mismo.
- MYSQL_DATABASE Nombre de la BBDD.
- MYSQL_USER Usuario de la misma (Es necesario crearlo y darle unicamente permisos de Select, update etc..).
- MYSQL_PASSWORD Contraseña del usuario.
- JWT_SECRET Clave unica, totalmente privada, que se utilizará para cifrar y descifrar los tokens y verificar que se trata de usuarios autorizados.
- JWT_EXPIRATION Duración del token

Después instalaremos los elementos del FrontEnd y del BackEnd y una vez instalado todo, hay que ejecutar `npm install` para que utilizando la lista de paquetes del `package.json` instale todas las dependencias y componentes necesarios.

Una vez hecho todo, simplemente ejecute `npm run runserver` y tendrá la aplicación corriendo.



### Importando la BBDD.
Usa el archivo `vcommult.sql` para la BBDD. Importante iniciar la BBDD antes de empezar a interactuar con la aplicación.


### Problemas con el desarrollo.
Algunos de los principales problemas que hemos tenido con el desarrollo de nuestra aplicación han sido los siguientes:

- El estudio de WebRTC, ya que al ser una tecnología relativamente nueva ha sufrido muchos cambios. Debido a esto, los recursos encontrados en internet podrian estar desactualizados. Por ejemplo, antes de empezar con el proyecto en sí, hemos tenido que hacer varios proyectos de prueba como https://github.com/mgermanm0/WebRTCDemoPlayground o https://github.com/mgermanm0/miniWebRTCDemo.
- La obtención de los datos de cada usuario, que se hace mediente una función llamada getServerSideProps y cuya existencia fue dificil de averiguar.
- [Fatiga de JS](https://medium.com/@sergiodxa/sobre-el-ecosistema-y-la-fatiga-de-javascript-73027048413f) Muchas de las tecnologias que usabamos por primera vez, se usan en combinación con muchas otras, todas ellas cambiantes, con componentes y utilidades que van cambiando cada vez más rapido, dada nuestra arquitectura particular ha sido particularmente dificil aplicar muchas de estas tecnologias, el uso de interceptores para almacenar la sesión, el envio al servidor de las credenciales en cada petición, debido a eso, acabamos utilizando cookies con jwt y un middleware propio, puesto que la información al respecto llegaba a ser incluso contradictoria en algunos casos o daba errores en otros.

### Conclusiones
- WebRTC, aunque lo parezca, no es fácil. La única documentación fiable es el estándar del W3C. Hoy en día te puedes encontrar hasta las propias páginas de Mozilla desactualizadas o con secciones sin terminar sobre WebRTC.
- La integración de todas estas tecnologías y frameworks (junto con otras tareas, como las de diseño) nos ha hecho "vivir" una experiencia "fullstack" donde, como en todo proyecto, se han dado improvistos y situaciones inesperadas.
- Gracias también a todo esto, hemos aprendidos los fundamentos de React, NextJS y WebRTC entre otros (HTML5, JS...).

Enlace al repositorio: https://github.com/josemanu3005/VCOMProto/tree/master


