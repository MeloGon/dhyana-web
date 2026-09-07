# Dhyana — Web de talleres

Sitio del Centro de Desarrollo Integral Dhyana para presentar el centro y vender
acceso mensual a talleres grupales en línea. La entrega se coordina personalmente
por WhatsApp y Google Meet.

Este archivo reúne objetivo, alcance, estado y próximos pasos. Las decisiones del
responsable prevalecen sobre los borradores externos. Actualizado: 6 de septiembre
de 2026.

## Estado actual

- Landing de una página con navegación por scroll y diseño integrado desde Google
  AI Studio. El diseño se afinará al incorporar funcionalidades.
- Presentación, servicios, talleres y contacto con contenido de prueba en el código.
- Formularios simulados: todavía no hay pagos, backend comercial ni panel.
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

1. **Base técnica:** concretar contratos, modelo de datos y permisos según la guía.
   Supabase está recomendado; la elección final sigue pendiente.
2. **Catálogo y gestión:** conectar talleres y horarios a datos persistidos;
   incorporar acceso administrativo y edición básica, conservando el diseño base.
3. **Ventas y capacidad:** ventas manuales, períodos mensuales y reservas temporales;
   comprobar que no se vende la última plaza a dos personas.
4. **Culqi en pruebas:** compra, verificación, consulta de estado y código para
   WhatsApp. Comprobar duplicados, fallos y pagos demorados.
5. **Publicación:** contenido real, políticas comerciales y comprobantes,
   verificación móvil y habilitación de producción con Culqi.

Se aceptó desarrollar con el entorno de pruebas antes de activar pagos reales.
La fecha de publicación, hosting y requisitos comerciales se confirmarán durante
la preparación. No se han creado recursos externos.

## Pendientes para implementar

- Días sin equivalente en el mes siguiente, zona horaria y hora de vencimiento.
- Horarios, capacidad y reuniones incluidas al entrar a un grupo en marcha.
- Cancelaciones, cambios de horario, reprogramaciones y devoluciones.
- Datos de compra, emisión de comprobantes y confirmación propia por correo.
- Permisos y recuperación de acceso de administradores.
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

```bash
npm install
npm run dev
npm run lint
npm run build
```

Desarrollo en `http://localhost:3000`. Las fuentes de Google usadas con `next/font`
necesitan conectividad para su descarga inicial durante el build.
