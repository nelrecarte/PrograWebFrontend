# PrograWebFrontend — ApagónYa

Frontend en Angular del proyecto ApagónYa. El backend está en el repo `ProyectoPrograWeb`
y los endpoints están documentados en `docs/API-CONTRACT.md`.

## Requisitos

- Node 22 o superior (Angular no arranca con versiones más viejas)
- El backend corriendo en `http://localhost:5099`

## Cómo correrlo

```bash
npm install
npm start
```

Abre en `http://localhost:4200`.

Para el backend, en otra terminal:

```bash
cd ProyectoPrograWeb
dotnet run
```

La primera vez hay que crear las zonas y hacerse administrador. Los comandos están en
`docs/API-CONTRACT.md` del backend.

> El archivo `.npmrc` tiene `legacy-peer-deps=true` porque sin eso `npm install` falla
> con un error de vitest. No lo borren.

## Estructura

```
src/app/
  models/       interfaces de lo que manda y devuelve el backend
  services/     un servicio por cada parte de la API, mas los guards de rutas
  interceptors/ le pone el token a las peticiones
  shared/       componentes que se usan en varias pantallas
  layout/       el navbar
  pages/        una carpeta por pantalla: nombre.ts + nombre.html + nombre.css
```

## Cosas que hay que saber antes de programar

**El token.** Se guarda en localStorage junto con el usuario. El interceptor lo agrega a cada
petición y, si el backend responde 401, borra la sesión y manda al login. El token de Firebase
dura una hora.

**El rol.** Viene de `/api/users/me`. Si un administrador te cambia el rol, hay que cerrar sesión
y volver a entrar para que el cambio se note.

**Los errores.** El backend siempre responde `{ error, code, data }`. En los componentes:

```ts
error: (err) => this.toast.error(err.error?.error ?? 'Mensaje por si acaso.'),
```

El caso especial es crear un reporte: si la zona ya tiene un corte abierto, el backend responde
409 con `code: 'reporte_duplicado'` y en `data` viene el id del reporte que ya existe, para
ofrecer confirmarlo. Está resuelto en `pages/report-create/report-create.ts`.

**Las fechas.** El backend toma como UTC cualquier fecha que llegue sin zona horaria, así que lo
que sale de un input hay que pasarlo por las funciones de `shared/date-utils.ts`.

## Lo que ya funciona

Login, registro, inicio con los cortes abiertos, lista de reportes con filtros, mis reportes,
crear un reporte y el detalle con las acciones de cada rol.

## Lo que falta

- Perfil del usuario
- Dashboard del administrador (estadísticas)
- Pantalla para administrar zonas
- Pantalla para administrar técnicos
- Pantalla del técnico

Los servicios de todo eso ya están hechos (`statistics.service.ts`, `technicians.service.ts`,
`users.service.ts`), así que para agregar una pantalla hay que crear la carpeta del componente en `pages/`
y registrar la ruta en `app.routes.ts`. Ahí quedó un ejemplo comentado de cómo usar el guard
de administrador.

## Flujo de trabajo

Rama por persona y PR hacia `main` con 2 aprobaciones, igual que en el backend.

```bash
git checkout main
git pull origin main
git checkout -b feat/tu-nombre
```
