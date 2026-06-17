## Requirements

### Requirement: Interfaz de comunicación masiva
El sistema SHALL proveer una UI para que el PROFESOR redacte, configure el envío y monitoree los mensajes a enviar (o ya enviados) a los estudiantes atrasados. El wizard SHALL aceptar una lista opcional de destinatarios pre-seleccionados al momento de apertura; cuando se provee dicha lista, los destinatarios se muestran pre-cargados en el paso de selección y el usuario puede agregar o quitar destinatarios adicionales.

#### Scenario: Previsualización de mensaje con variables
- **WHEN** el profesor redacta un mensaje usando placeholders como `{{nombre}}`.
- **THEN** la UI muestra la previsualización del texto reemplazando las variables con los datos del primer alumno atrasado de muestra.

#### Scenario: Encolado de mensajes
- **WHEN** el profesor confirma el envío masivo para 30 estudiantes atrasados.
- **THEN** la UI emite el comando a la API y muestra la transición de los mensajes hacia el estado de "Pendiente" y luego de "Enviado", actualizándose en tiempo real o por polling.

#### Scenario: Monitoreo de comunicaciones
- **WHEN** un docente o tutor revisa el estado de los mensajes enviados en el panel.
- **THEN** la UI muestra indicadores claros sobre correos entregados exitosamente, fallidos, o en cola de aprobación.

#### Scenario: Apertura con destinatarios pre-seleccionados
- **WHEN** el wizard es abierto desde el panel de atrasados con una lista de alumnos ya seleccionados.
- **THEN** el paso de selección de destinatarios muestra esos alumnos pre-marcados, permitiendo al PROFESOR añadir o remover destinatarios antes de continuar.
