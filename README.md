# Dhyana — Web de talleres

Sitio del Centro de Desarrollo Integral Dhyana para presentar el centro y vender
acceso mensual a talleres grupales en línea. La entrega se coordina personalmente
por WhatsApp y Google Meet.

Este archivo reúne objetivo, alcance, estado y próximos pasos. Las decisiones del
responsable prevalecen sobre los borradores externos. Actualizado: 9 de septiembre
de 2026.

## Estado actual

- Landing de una página con navegación por scroll y diseño integrado desde Google
  AI Studio. El diseño se afinará al incorporar funcionalidades.
- Presentación, servicios, talleres y contacto con contenido de prueba en el código.
- Catálogo público conectado a Supabase, con talleres y horarios editables desde el panel.
- Preguntas frecuentes conectadas a Supabase y editables desde el panel; carga inicial con los cuatro textos del diseño.
- Tarjeta de datos de consulta configurable en el panel: dirección, teléfono, correo, horarios y botón de WhatsApp.
- Contacto todavía simulado. Inscripción demo retirada; no hay checkout ni cobros web.
- Ventas manuales verificadas por el administrador, participantes, acceso mensual y coordinación implementados.
- Acceso administrativo conectado a Supabase Auth: login, recuperación, cambio de
  contraseña y panel protegido con gestión de catálogo.
- Migración inicial aplicada a Supabase: cinco tablas con RLS, todavía sin datos
  comerciales al inicio. Migraciones posteriores incorporan catálogo transaccional y ventas manuales.
- Cliente de servidor preparado en `lib/server/database.ts`; configuración local y
  acceso por Data API verificados. Talleres usa datos persistidos; otras secciones conservan contenido de demo.
- Next.js 16, React 19, TypeScript y Tailwind CSS 4.
- El responsable desarrolla y mantiene el proyecto y tiene seis años de experiencia
  en Flutter. Se priorizan código explícito y explicaciones de React y Next.js.

## Alcance confirmado

| Área | Decisión |
|---|---|
| Oferta | Vender talleres grupales; individuales visibles como **Agotados**, sin compra |
| Información | Centro, profesionales, servicios, precios, horarios y preguntas frecuentes |
| Compra | Elegir taller y horario con disponibilidad; pagar sin crear cuenta |
| Cupos | Mostrar solo los restantes; la capacidad total es privada |
| Duración | Un mes calendario desde la compra de cada participante |
| Nuevas compras | Cada pago es una compra independiente; no existe función de renovación |
| Pagos web | Culqi, tarjeta y Yape |
| Moneda | Soles, también para compradores de otros países; sin conversión automática |
| Entrega | Coordinación personal por WhatsApp y Google Meet |
| Administración | Panel privado para el responsable y otra persona |
| Ventas externas | WhatsApp y Yape directo; registro manual tras verificar el pago |

Al vencer el acceso, la persona puede volver a comprar si hay disponibilidad. No
hay suscripciones, cargos periódicos, extensión del período anterior ni gestión
de renovación anticipada. Cada venta conserva su fecha, importe y período propio.
Ejemplo: compra el 10 de septiembre, vence el 10 de octubre.

El período comienza en la fecha y hora real del pago confirmado, usando
`America/Lima`. Vence a la misma hora del mes siguiente; si ese día no existe,
se ajusta al último día de ese mes (31 de enero → 28 o 29 de febrero). Desde el
instante de vencimiento ya no hay acceso. Registrar una venta manual después
no cambia su fecha de compra. Cada nuevo pago calcula su propio mes calendario.

El panel permitirá editar talleres, horarios, capacidad y publicación; consultar
ventas y participantes; buscar una compra por código o datos del comprador y
marcar la coordinación por WhatsApp. Una venta externa se registra como venta,
sin restar cupos de forma aislada ni perder quién ocupa la plaza.

## Compra y coordinación

1. El visitante conoce el taller y elige un horario.
2. Completa los datos mínimos de compra y paga mediante Culqi.
3. El backend verifica el pago y registra compra, acceso mensual y ocupación.
4. La web muestra el estado real y un código compartible por WhatsApp. Abrir la
   pantalla de confirmación no convierte por sí solo una compra en pagada.
5. El responsable busca el pago confirmado en el panel y coordina la entrega.

Se mantiene la coordinación personal después de la compra. Los datos definitivos
de talleres, horarios y reuniones se incorporarán cuando el responsable los facilite.

El código o ticket ayuda a localizar la operación; una captura no confirma el pago
por sí sola. Un pago de Culqi confirmado no se vuelve a registrar como venta manual
ni descuenta otra plaza. El estado de coordinación se mantiene separado del pago.

Para Yape directo, el responsable verifica el dinero y registra la venta manual.
El sistema comprueba disponibilidad y conserva participante, importe, referencia
cuando exista y fecha real de compra. Registrarla posteriormente no debe desplazar
silenciosamente el período de acceso.

### Datos de compra y correo

No hay cuenta, contraseña, perfil ni activación por correo. La API de cargos de
Culqi consultada exige el correo del cliente: se pedirá una sola vez durante la
compra, junto con los datos que finalmente requiera la integración. El envío de
una confirmación propia por correo es opcional y aún no está decidido. No se
planifica un portal privado de materiales o Meet.

Referencia: [API de cargos de Culqi](https://apidocs.culqi.com/#tag/Cargos).

## Plan de construcción propuesto

Estas etapas organizan el trabajo; no fijan fecha de publicación ni obligan a
publicar antes de disponer del checkout.

1. **Base técnica — completada:** proyecto Supabase creado, migración aplicada y
   conexión de servidor verificada. Acceso administrativo implementado y primera
   identidad activa. Invitación aceptada y contraseña definida por el responsable.
2. **Catálogo y gestión — base implementada:** crear y editar talleres/horarios,
   precios, capacidad y publicación; lectura pública desde Supabase. Falta cargar
   contenido real y afinar presentación y detalle compartible si se requiere.
3. **Ventas y capacidad — base implementada:** registro manual, participantes,
   períodos mensuales y coordinación. Concurrencia verificada entre ventas manuales
   y edición de capacidad. Faltan reservas temporales para checkout.
4. **Culqi en pruebas:** compra, verificación, consulta de estado y código para
   WhatsApp. Comprobar duplicados, fallos y pagos demorados.
5. **Publicación:** contenido real, políticas comerciales y comprobantes,
   verificación móvil y habilitación de producción con Culqi.

Se aceptó desarrollar con el entorno de pruebas antes de activar pagos reales.
La fecha de publicación, hosting y requisitos comerciales se confirmarán durante
la preparación. El proyecto Supabase de Dhyana ya está creado en el plan Free.

### Avance de la base técnica

- `supabase/migrations/` contiene talleres, grupos/horarios, administradores,
  compras y accesos mensuales. Precios en céntimos de sol, fecha histórica de
  compra y coordinación separada del pago.
- `lib/types/catalog.ts` define el catálogo público sin capacidad total;
  `lib/types/checkout.ts` separa pago pendiente y acceso confirmado.
- `lib/types/database.ts` contiene los tipos generados desde el esquema remoto;
  `lib/server/database.ts` crea el cliente privilegiado, protegido con `server-only`.
- Las tablas tienen RLS y acceso directo bloqueado para visitantes y usuarios
  autenticados. El acceso administrativo valida identidad con Supabase Auth y
  autorización activa en `admin_users` en cada operación privada.
- `npm run test:db` prueba la migración y sus restricciones con PostgreSQL en
  memoria (PGlite, solo dependencia de desarrollo). No necesita proyecto remoto.
- `npm run check:database` verifica acceso desde el equipo a `workshops` por la
  Data API con la configuración de `.env.local`, sin descargar datos comerciales.

Proyecto remoto: [dhyana-web](https://supabase.com/dashboard/project/vabbjwjfwcypweucfjhx),
referencia `vabbjwjfwcypweucfjhx`, organización `company test`
(`fysoudmbapnawvlrpbci`), región `us-east-1`. Creación confirmada a US$0/mes en Free.
Migración aplicada: `20260909033912_initial_commerce.sql`. El archivo local usa la
misma versión del historial remoto. Se verificaron permisos, vencimientos y
rechazo de accesos duplicados o pendientes en Supabase; los datos de prueba se
revirtieron. La conexión del agente y el acceso mediante el SDK desde el equipo funcionan.

La configuración local está en `.env.local`, excluido de Git. `.env.example`
contiene la plantilla sin credenciales; completar `SUPABASE_URL`,
`SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY` y `APP_URL` en cada entorno. La clave privada se usa solo
desde servidor, sin prefijo `NEXT_PUBLIC_`. El cliente privilegiado está separado del cliente de sesión;
`requireAdmin()` verifica identidad y permisos antes de cada operación privada.

Ventas manuales y control concurrente de capacidad ya funcionan; siguen reservas y checkout Culqi.
Supabase permite dos proyectos Free activos entre las organizaciones donde se es
Owner o Admin. [Regla oficial](https://supabase.com/docs/guides/platform/billing-on-supabase).
Los proyectos Free pueden pausarse tras una semana de inactividad;
[condiciones del plan](https://supabase.com/pricing).

Las reservas temporales y la integración Culqi pertenecen a las siguientes etapas.
El registro manual ya guarda compra/acceso de forma atómica con control de cupos.

## Acceso administrativo implementado

- `/admin/login`: correo y contraseña. No hay registro público desde la aplicación.
- `/admin/recover`: solicita enlace de recuperación; abrirlo en el mismo navegador.
- `/auth/confirm`: recibe invitación o recuperación, valida el enlace al pulsar
  Continuar y lleva a `/admin/password` para definir la contraseña.
- `/admin` y `/admin/password`: requieren identidad verificada y entrada activa en
  `admin_users`; el panel muestra la cuenta, acceso a gestión de talleres, cambio de contraseña y cierre de sesión.
- Primer administrador activo: `troy.esname@gmail.com`. Invitación aceptada y
  contraseña definida personalmente; correo confirmado verificado en Supabase.

Para enviar la invitación inicial, ejecutar solo cuando se solicite el envío:

```bash
npm run admin:invite -- troy.esname@gmail.com
```

El comando comprueba que el correo pertenece a un administrador activo. No permite
crear administradores ni envía credenciales por consola. La contraseña se define
personalmente en la pantalla y no se guarda en el repositorio ni se pide por chat.

`APP_URL` es el origen exacto de la aplicación (`http://localhost:3000` localmente).
Los enlaces deben abrirse en este equipo mientras corre Next. Al publicar, usar
HTTPS y configurar Site URL y Redirect URLs en Supabase Auth para el dominio y
`/auth/confirm`. La plantilla estándar de invitación funciona sin personalizarla.

El correo predeterminado de Supabase solo entrega a miembros del equipo del proyecto
y tiene límites reducidos. La primera invitación fue recibida y aceptada. Configurar
SMTP propio antes de producción o de invitar direcciones fuera del equipo.
[Condiciones oficiales de correo](https://supabase.com/docs/guides/auth/auth-smtp).

`npm run test:auth` prueba HTTP contra una aplicación ejecutándose en `AUTH_TEST_ORIGIN`
(por defecto `http://localhost:3000`). Se debe usar compilación de producción para
comprobar cabeceras: Next dev cambia las cabeceras de redirecciones. Sin fixtures
las pruebas no escriben datos ni envían correos; dos pruebas autenticadas se omiten.
Con `AUTH_TEST_FIXTURES` apuntando a un JSON privado de identidades temporales, prueban
invitación/recuperación, cookies HttpOnly, cambio de contraseña, login, logout y rechazo
de usuario sin permiso aunque se autoasigne metadatos. Nunca usar cuentas reales
como fixtures: la prueba cambia la contraseña. La entrega de correo se verifica aparte.

## Catálogo implementado

En `/admin/workshops` un formulario crea o edita el taller y sus horarios con un solo
botón «Guardar taller y horarios». El primer horario está disponible desde el inicio;
«+ Agregar horario» añade otros y «Quitar» los retira al guardar. El identificador se
genera desde el título, sin tildes y con guiones; los nombres repetidos reciben sufijo.
La lista muestra «Editar taller». «Eliminar taller» pide confirmación y solo permite
borrar talleres sin compras; los demás se pueden despublicar. Cada horario conserva
su precio en soles y capacidad privada. Taller y horario tienen publicación independiente: ambos deben
estar publicados para mostrar el horario. Despublicar conserva historial y datos.

La sección pública `/#talleres` consulta `/api/workshops`. Solo devuelve campos públicos,
precios PEN y cupos restantes. Los individuales se muestran agotados y no exponen
horarios comprables. Borradores no aparecen. Sin talleres publicados, se muestra un
estado vacío real: el catálogo de ejemplo y su inscripción simulada ya no se montan.

La disponibilidad actual resta los accesos mensuales vigentes de la capacidad.
No cuenta accesos vencidos ni futuros; aún no hay reservas ni cobros. El precio se
convierte de soles a céntimos para guardarlo como entero. Se bloquean valores inválidos,
horarios ajenos o repetidos y capacidad inferior a accesos vigentes al comprobarla.
El editor y las ventas manuales comparten bloqueos transaccionales y comprueban la
ocupación máxima de los períodos afectados. El checkout deberá usar el mismo protocolo
e incorporar reservas antes de habilitar pagos web.

Guardado y eliminación usan funciones SQL privadas (`save_workshop_catalog` y
`delete_workshop_catalog`), con transacción y permisos exclusivos del servidor.
Migración `20260910023948_catalog_atomic_editor.sql` aplicada y tipos regenerados.

Verificación del editor unificado: 27 pruebas SQL, build con webpack y lint; creación
con dos horarios, edición y horario adicional desde navegador conectado a Supabase.
También se comprobó eliminación y rollback directamente en Supabase. La prueba HTTP
pública comprueba lectura y rechazo de visitantes. La suite HTTP con escrituras
requiere CATALOG_TEST_FIXTURES y cuentas temporales; nunca usar cuentas reales como fixtures.


## Preguntas frecuentes editables

`/admin/faqs` permite crear y editar preguntas/respuestas, definir orden de aparición,
publicar u ocultar y eliminar con confirmación. Se conserva el acordeón del diseño.
Las preguntas nuevas empiezan como borrador; guardar una publicada actualiza su
contenido en la siguiente carga del sitio. Los números menores aparecen primero;
para elegir un orden exacto, usar números distintos.

Migración `20260910043132_editable_faqs.sql` aplicada y tipos regenerados. Carga inicial:
los cuatro textos originales del diseño, publicados y en el mismo orden. El contenido
estático se retiró; editar, ocultar o borrar no lo restaura. Sin preguntas publicadas,
el bloque se oculta; errores de lectura permiten reintentar.

Tabla `faqs` con RLS y sin acceso directo de `anon` ni `authenticated`. La API privada
valida administrador y Origin; `/api/faqs` entrega solo ID, pregunta y respuesta de
publicadas, sin caché. `npm run test:faqs` comprueba lectura pública y rechazo de
visitantes contra Next en ejecución; `npm run test:db` cubre carga inicial, permisos
y restricciones de texto/orden. Verificado: 43 pruebas SQL, 2 pruebas HTTP,
creación de borrador y publicación de una edición desde navegador; registro temporal
retirado. Build con Webpack y lint correctos. Turbopack no pudo abrir su puerto
interno en el entorno de verificación; no se cambió la configuración del proyecto.

## Datos de la consulta editables

`/admin/contact` edita título, dirección y referencia, teléfono y nota, correo,
horarios principal/adicional y botón de WhatsApp (número, texto y mensaje inicial).
Teléfono de contacto y WhatsApp pueden ser distintos. Las notas y el mensaje son
opcionales. Guardar actualiza toda la tarjeta en la siguiente carga del sitio.
El footer conserva sus textos de demo; esta configuración corresponde a la tarjeta.

Migración `20260910132359_editable_contact_settings.sql` aplicada con los valores
originales del diseño. `contact_settings` admite una sola fila y el servidor solo
tiene permisos para leerla y actualizarla, tras verificar al administrador.
No hay creación ni borrado desde el panel. RLS bloquea acceso directo de visitantes;
la API pública entrega campos explícitos y genera enlaces seguros desde números y
correo validados. El botón abre WhatsApp con un mensaje preparado, sin enviarlo.

`npm run test:contact` comprueba contrato público, enlaces, acceso privado y Origin.
Las pruebas SQL cubren configuración única, permisos y restricciones de campos.
Verificado: 46 pruebas SQL, 2 pruebas HTTP, build con Webpack y lint. Desde navegador
se comprobó rechazo de teléfono inválido, guardado y lectura pública de una edición;
después se restauró el texto original usado en la prueba.

## Ventas manuales y participantes

`/admin/sales` permite registrar pagos externos ya verificados (Yape directo,
transferencia, efectivo u otro medio). Se elige taller grupal y horario, participante,
correo, teléfono, importe recibido, fecha real del pago en Perú y referencia opcional.
El formulario pide confirmar la verificación del dinero; registrar no realiza ningún cobro.
El precio actual se sugiere, pero el importe histórico corresponde a lo realmente pagado.

Compra y acceso se guardan juntos por `register_manual_sale`. Una misma solicitud
reintentada devuelve la misma venta; reutilizar su clave con datos distintos se rechaza.
Una referencia manual repetida para el mismo medio también se rechaza. Sin referencia,
no se puede reconocer automáticamente el mismo pago si se inicia un formulario nuevo;
el responsable debe revisar el listado. Una referencia conocida de Culqi no se registra
como manual. Cada compra conserva un mes calendario desde el pago, incluso al cargarla tarde.
No hay renovación, suscripción ni devolución automática.

El listado privado tiene búsqueda literal por nombre, correo, teléfono, código o referencia;
filtros de acceso y coordinación; paginación de 20 filas y actualización manual.
Marcar o desmarcar coordinación guarda al administrador y la fecha; no cambia pago ni acceso,
y no envía mensajes por WhatsApp. Muestra compras pagadas y anuladas con su período original.

Migración `20260910032040_manual_sales.sql` aplicada. Las funciones son privadas y
SECURITY INVOKER. Ventas y catálogo bloquean primero taller y luego grupo, comprueban
ocupación y escriben dentro de una transacción. La ocupación máxima considera cruces de
períodos, no la suma de todos los participantes históricos. No hay reservas todavía:
Culqi deberá respetar estos mismos bloqueos y reglas antes de habilitar el checkout.

Verificación: 40 pruebas SQL; 2 comprobaciones HTTP de privacidad/origen; 5 escenarios
en Supabase (último cupo, reintentos, venta frente a reducción de capacidad, anulación
y borrado concurrente con reintento).
También se probó el formulario y su confirmación histórica desde el navegador.
Build con webpack y lint correctos. Las pruebas usan registros artificiales, sin cobros.

`npm run test:sales` corre las pruebas HTTP contra Next en ejecución. Los escenarios
remotos requieren `SALES_RPC_TEST_ADMIN_ID` de un administrador de pruebas activo y
`SALES_RPC_TEST_ARTIFACTS` apuntando a un archivo privado para los IDs de limpieza.
Estos escenarios crean talleres y ventas temporales en el proyecto configurado;
deben limpiarse por SQL privilegiado siguiendo esos IDs (accesos, compras, grupos,
talleres y marcadores técnicos de solicitud). El borrado directo por Data API queda
bloqueado por triggers; el panel usa la función confirmada para ventas manuales.

### Anular o eliminar una venta

En cada venta pagada, «Anular venta» pide un motivo de 5 a 500 caracteres. Conserva
importe, fecha del pago, coordinación, período original y administrador responsable;
libera cupo desde la anulación. No devuelve dinero. El filtro «Anulados» permite
consultar ese historial; las anuladas no quedan pendientes de coordinación.

Las ventas manuales también ofrecen «Eliminar definitivamente», para pruebas o
registros erróneos. Exige escribir su código (con o sin DHY-) y confirmar el motivo
de uso mediante una casilla. Borra compra y acceso, sin recuperación. Culqi solo
admite anulación. Queda únicamente un UUID técnico en `deleted_manual_sale_requests`
para impedir que reenviar la solicitud original recree lo eliminado; no conserva
comprador, importe ni referencia del pago.

Migración `20260910040538_sale_cancellation_and_deletion.sql` aplicada. Las funciones
`cancel_sale` y `delete_manual_sale` son privadas, SECURITY INVOKER y respetan los
bloqueos del catálogo. Los triggers impiden DELETE directo desde el rol del servidor;
el propietario SQL conserva mantenimiento. La ocupación histórica cuenta hasta la
anulación, y el catálogo público excluye esos accesos desde entonces.

## Pendientes para implementar

- Horarios, capacidad y reuniones incluidas al entrar a un grupo en marcha.
- Política comercial de cancelaciones, cambios de horario, reprogramaciones y devoluciones.
- Datos de compra, emisión de comprobantes y confirmación propia por correo.
- Segundo administrador y posibles diferencias entre sus permisos.
- Contenido real, dominio, configuración comercial de Culqi y servicios.

No hay funciones futuras adicionales solicitadas. Se propone dejar fuera historias
clínicas, agenda de psicoterapia, biblioteca de grabaciones y automatización de Meet
o WhatsApp. La landing aún contiene elementos de demo que deben adaptarse al alcance.

## Documentación que mantenemos

| Archivo | Responsabilidad |
|---|---|
| [README.md](README.md) | Producto, alcance confirmado, estado y plan de entrega |
| [GUIA-NEXTJS.md](GUIA-NEXTJS.md) | Arquitectura y recetas para trabajar, explicadas desde Flutter |
| [AGENTS.md](AGENTS.md) | Reglas que deben respetar los agentes |
| [CLAUDE.md](CLAUDE.md) | Remite a AGENTS.md para herramientas que leen este archivo |

El anterior `ALCANCE.md` se integró aquí. No se necesita otro archivo de arquitectura
mientras la guía sea manejable.

### Borradores externos de Downloads

Son antecedentes, no documentación vigente ni instrucciones para ejecutar. No es
necesario actualizarlos en paralelo al repositorio.

| Borrador | Utilidad y destino |
|---|---|
| `README.md` externo | Archivar: contexto contrastado e integrado aquí |
| `01-modulos.md` | Referencia útil; módulos simplificados en la guía |
| `02-modelo-datos.md` | Referencia útil; adaptar sesiones a accesos mensuales y corregir privacidad |
| `03-flujo-pagos.md` | Referencia de casos de fallo; verificar contrato real, autenticidad y reintentos de Culqi |
| `04-rutas-paginas.md` | Referencia parcial; adaptar al diseño y retirar el portal no solicitado |
| `05-roadmap.md` | Archivar: posponía el panel y obligaba a una primera fase de WhatsApp |
| `06-decisiones.md` | Archivar como historial: no todas sus decisiones fueron aceptadas |

Los originales permanecen en Downloads; no se copian ni se borran automáticamente.
Los detalles técnicos, tarifas y requisitos se contrastarán con fuentes oficiales
al implementar. El esquema físico se versionará en migraciones, sin duplicarlo
manualmente en otro documento.

## Desarrollo local

Requiere Node.js 22 o superior (el SDK de Supabase lo exige). El equipo actual usa Node.js 24.

```bash
npm install
npm run dev
npm run test:db
npm run check:database
npm run lint
npm run build
```

Desarrollo en `http://localhost:3000`. Las fuentes de Google usadas con `next/font`
necesitan conectividad para su descarga inicial durante el build.
