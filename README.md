// Sitio publicado
https://amac-web-one.vercel.app/

// Integrantes y qué hizo cada uno

Integrantes:
Luis Mario Cortez Castro - Manejo del código
Milton Carlos Leal Tamez - Manejo del código
Julio Eduardo Gomez Wilson - Gestión de presentación
Carlos Ignacio Marván Ramirez - Gestión de presentación


// Tecnologías
Interfaz: React 19, React Router 7 y Vite
Estilos: CSS propio de la Entrega 2 (src/styles/), sin frameworks
Backend: Supabase (PostgreSQL, Auth y Row Level Security)
Despliegue: Vercel


// Estructura del proyecto
index.html
vercel.json -- redirige todas las rutas a index.html para que React Router funcione al recargar
supabase/esquema.sql -- tablas, trigger, funciones y políticas RLS
src/main.jsx -- BrowserRouter, AuthProvider y estilos
src/App.jsx -- rutas públicas y protegidas por rol
src/lib/ -- cliente de Supabase, formato, validación y hooks
src/context/AuthContext.jsx -- sesión y perfil del usuario
src/components/ -- Encabezado, Pie, Boton, TarjetaVacante, EtiquetaEstatus, RutaProtegida...
src/pages/ -- una página por ruta
src/styles/ -- variables.css, base.css, layout.css, componentes.css


// Rutas
/ -- Listado de vacantes -- Público
/vacantes/:id -- Detalle de vacante -- Público
/login -- Inicio de sesión -- Público
/registro -- Registro de candidato -- Público
/registro-empresa -- Registro de empresa -- Público
/mis-solicitudes -- Mis solicitudes -- Candidato
/empresa/vacantes -- Mis vacantes -- Empresa
/empresa/publicar -- Publicar vacante -- Empresa
/empresa/vacantes/:id/solicitudes -- Solicitudes recibidas -- Empresa


// Base de datos
perfiles -- id, rol (candidato, empresa o admin), nombre, telefono, edad, colonia, experiencia, giro, aprobado
vacantes -- id, empresa_id, titulo, sueldo, ubicacion, horario, categoria, descripcion, requisitos, prestaciones, telefono_contacto, estado (activa, pausada o cerrada)
solicitudes -- id, vacante_id, candidato_id, estatus (Enviada, En revisión, Aceptada, Rechazada o Cancelada)

auth.users 1 a 1 perfiles (el trigger al_crear_usuario crea el perfil al registrarse)
perfiles 1 a muchos vacantes (la empresa publica)
perfiles 1 a muchos solicitudes (el candidato se postula)
vacantes 1 a muchos solicitudes

Una persona solo puede postularse una vez a cada vacante: unique (vacante_id, candidato_id)


// Seguridad
El frontend solo usa VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY
La llave service_role / secret key no está en el código ni en el repositorio
.env.local está en .gitignore; en Vercel las variables se configuran en Environment Variables
Las contraseñas y sesiones las maneja Supabase Auth
Nadie puede registrarse como admin; ese rol se asigna a mano
Un candidato nuevo queda con aprobado = false y no puede postularse hasta que AMAC lo apruebe

Políticas RLS (activas en las tres tablas, nadie puede borrar filas desde la API):
perfiles -- cada usuario lee y edita su propio perfil (sin poder cambiar rol ni aprobado); los perfiles de empresa son públicos; la empresa ve a los candidatos que se postularon a sus vacantes
vacantes -- sin sesión solo se ven las activas; la empresa crea y edita solo las suyas
solicitudes -- el candidato aprobado se postula a vacantes activas y solo puede cancelar las suyas si están Enviada o En revisión; la empresa ve y cambia el estatus de las solicitudes de sus vacantes


// Requerimientos funcionales
RF-001 -- Listado de vacantes activas con el nombre de la empresa
RF-002, RF-007 -- Búsqueda por palabra clave, filtros por horario y categoría, y mensaje "No hay vacantes para mostrar."
RF-003, RF-051 -- Detalle de la vacante; "Llamar" solo aparece si hay teléfono de contacto
RF-004, RF-054 -- Postulación solo para candidatos aprobados, con aviso de duplicado y confirmación
RF-005, RF-006 -- Mis solicitudes con estatus y cancelación con confirmación
RF-008, RF-009 -- Inicio y cierre de sesión con error genérico "Correo o contraseña incorrectos."
RF-010 -- Rutas protegidas por sesión y rol
RF-011, RF-012, RF-013 -- Registro de candidato con aceptación obligatoria de términos
RF-015 -- Registro de empresa
RF-019 -- Publicar vacante con validación de campos
RF-020, RF-021 -- Mis vacantes con conteo de solicitudes y botones para pausar, reactivar y cerrar
RF-022, RF-024 -- Solicitudes recibidas y cambio de estatus


// Cuentas de prueba
Candidato aprobado -- correo: -- contraseña:
Candidato sin aprobar -- correo: -- contraseña:
Empresa -- correo: -- contraseña:


// Colores y tipografías
src/styles/variables.css

--color-primario -- #1f2a4a
--color-acento -- #ff7f5c -- botón principal y ayuda
--color-texto -- #1b2440 -- Texto principal
--color-superficie -- #ebebeb -- Fondo de página

Tipografías: Libre Baskerville para títulos
Inter para texto
El texto base es de 18px/1.125 rem


// Componentes reutilizables
.boton
.tarjeta
.tarjeta-vacante
.solicitud
.vacante-empresa
.campo-formulario
.campo-casilla
.grupo-campos
.etiqueta-estatus
.encabezado
.nav-principal
.nav-inferior
.pie
.buscador


// Capturas
docs/capturas/ -- validador de la Entrega 2
Pendiente: capturas de la Entrega 3 en celular y escritorio, y puntaje de Lighthouse
