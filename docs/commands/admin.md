# ⚙ Administrador

{% hint style="danger" %}
Estos comandos solo pueden ser utilizados por miembros que tengan permiso **ADMINISTRAR_SERVIDOR**
{% endhint %}

### Establecer Prefijo

- **Descripción**: Establecer el prefijo del bot
- **Uso**: `!setprefix <nuevoPrefijo>`

### Enviar Embed

- **Descripción**: Enviar un mensaje incrustado
- **Uso**: `!embed <#canal>`

### Automoderación

{% hint style="info" %}
Por defecto, los eventos de auto moderación se ignoran para los miembros que tienen los siguientes permisos ya que se les considera moderadores de canal/servidor:

**KICK_MEMBERS**, **BAN_MEMBERS**, **MANAGE_GUILD**, **MANAGE_MESSAGES**

`!automodconfig debug on` anula esta configuración por defecto
{% endhint %}

|                                                 |                                                                |
| ----------------------------------------------- | -------------------------------------------------------------- |
| **!automodconfig status**                       | Ver estado de la configuración                                   |
| **!automodconfig strikes \<cantidad>**          | Establecer la cantidad máxima de strikes antes de tomar acción  |
| **!automodconfig action \<timeout\|mute\|ban>** | Establecer la acción a realizar después de recibir strikes máximo |
| **!automodconfig debug \<on\|off>**             | Activar auto moderación para mensajes enviados por administradores y moderadores |
| **!automodconfig whitelist**                    | Lista de canales que están en la lista blanca                    |
| **!automodconfig whitelistadd \<canal>**        | Agregar un canal a la lista blanca                                |
| **!automodconfig whitelistremove \<canal>**     | Eliminar un canal de la lista blanca                              |

**Configuraciones**

| Nombre                                        | Descripción                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **!anti ghostping \<on\|off>**                | registrar menciones fantasma en su servidor (requiere el establecimiento del canal `/modlog`) |
| **!anti spam \<on\|off>**                     | habilitar o desactivar la detección antispam                                               |
| **!anti massmention \<on\|off> \[threshold]** | habilitar o deshabilitar la detección de menciones masivas (el umbral predeterminado es de 3 menciones) |

**Autoborrado**

| Nombre                                   | Descripción                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------|
| **!autodelete attachments \<on\|off>** | registrar menciones fantasma en su servidor (requiere el establecimiento del canal `/modlog`) |
| **!autodelete invites \<on\|off>**     | permitir o prohibir enviar invitaciones de Discord en mensajes                                    |
| **!automod links \<on\|off>**          | permitir o prohibir enviar enlaces en mensajes                                             |
| **!automod maxlines \<cantidad>**        | establecer el máximo de líneas permitidas por mensaje                                      |

{% hint style="warning" %}
Cada vez que un miembro intenta romper la regla automatizada, **recibe un strike**. Después de recibir el número máximo de strikes (por defecto 10), se realiza la acción de moderación (por defecto TIMEOUT) en ellos.
{% endhint %}

### Contadores de canales

- **Descripción**: configurar el canal de contador en el servidor
- **Uso**: `!counter <tipo_contador> <nombre>`
- **Tipos de contadores** **disponibles**
  - USERS: cuenta el total de miembros del servidor (miembros + bots)
  - MEMBERS: cuenta el número total de miembros
  - BOTS: cuenta el número total de bots

### Advertencias

- **!maxwarn limit \<cantidad>**: establecer un máximo de advertencias que puede recibir un miembro antes de tomar una acción
- **!maxwarn action \<timeout\|kick\|ban>**: establecer la acción a realizar después de recibir un máximo de advertencias

### Registro de moderación

- **Descripción**: activar o desactivar el registro de moderación
- **Uso**: `!modlog <canal|off>`

{% hint style="info" %}
El registro de moderación permite el registro de todas las **acciones de moderación** y los **eventos de auto moderación**
{% endhint %}

### Traducciones de banderas

_Habilitar esta función permitirá a los miembros simplemente reaccionar a cualquier mensaje con un emoji de bandera del país, traduciendo el contenido del mensaje a la lengua regional_

- **Descripción**: configurar la traducción de la bandera en el servidor
- **Uso**: `!flagtr <on|off>`

![](../.gitbook/assets/image.png)

### Auto Rol

- **Descripción**: configurar el rol que se debe dar cuando un miembro se une al servidor
- **Uso**: `!autorole <rol|off>`

### Saludos

{% tabs %}
{% tab title="Bienvenida" %}
**!welcome status \<on\|off>**

- activar o desactivar el mensaje de bienvenida

**!welcome channel \<#canal>**

- configurar el canal donde deben enviarse los mensajes de bienvenida

**!welcome preview**

- enviar una vista previa de bienvenida

**!welcome desc \<contenido>**

- establecer la descripción incrustada de bienvenida

**!welcome footer \<contenido>**

- establecer el pie de página incrustado de bienvenida

**!welcome thumbnail \<on\|off>**

- activar o desactivar la miniatura de mensaje de bienvenida

**!welcome color \<#hex>**

- establecer el color incrustado de bienvenida

**!welcome image \<URL_imagen>**

- establecer la imagen incrustada de bienvenida
  {% endtab %}

{% tab title="Despedida" %}
**!farewell status \<on\|off>**

- activar o desactivar el mensaje de despedida

**!farewell channel \<#canal>**

- configurar el canal donde deben enviarse los mensajes de despedida

**!farewell preview**

- enviar una vista previa de despedida

**!farewell desc \<contenido>**

- establecer la descripción incrustada de despedida

**!farewell footer \<contenido>**

- Establecer el pie de página incrustado de despedida

**!farewell thumbnail \<on\|off>**

- activar o desactivar la miniatura de mensaje de despedida

**!farewell color \<#hex>**

- establecer el color incrustado de despedida

**!farewell image \<#URL_imagen>**

- establecer la imagen incrustada de despedida
  {% endtab %}
  {% endtabs %}

{% hint style="success" %}

#### Reemplazos permitidos de contenido

- \n : nueva línea&#x20;
- {server} : Nombre del servidor&#x20;
- {count} : cuenta de miembros del servidor&#x20;
- {member:nick} : Apodo del miembro&#x20;
- {member:name} : Nombre del miembro&#x20;
- {member:dis} : Discriminador del miembro &#x20;
- {member:tag} : Etiqueta del miembro&#x20;
- {member:mention} : Mención del miembro&#x20;
- {member:avatar} : URL de avatar del miembro&#x20;
- {inviter:name} : Nombre del invitador&#x20;
- {inviter:tag} : Etiqueta del invitador&#x20;
- {invites} : Invitaciones del invitador
  {% endhint %}

### Roles de reacción

**Crear roles de reacción**

- **Uso**: `!addrr <#canal> <idMensaje> <rol> <emoticono>`
- **Descripción**: configurar roles de reacción para el mensaje especificado

**Eliminar Roles de reacción**

- **Uso**: `!removerr <#canal> <idMensaje>`
- **Descripción**: eliminar la reacción configurada para el mensaje especificado

### Ticketing

**Configuración**

- **!ticket setup \<#canal>**: configurar un nuevo mensaje de ticket
- **!ticket log \<#canal>**: configurar el canal de registro de tickets
- **!ticket limit \<cantidad>**: establecer el número máximo de tickets abiertos simultáneamente
- **!ticket closeall**: cerrar todos los tickets abiertos

**Comandos de canal de ticket**

- **!ticket close**: cerrar el ticket
- **!ticket add \<idUsuario\|idRol>**: agregar usuario/rol al ticket
- **!ticket remove \<idUsuario\|idRol>**: eliminar usuario/rol del ticket

**Comandos de categoría de ticket**

- **!ticketcat list**: listar todas las categorías de ticket
- **!ticketcat add \<categoría> \| \<nombre>**: crear una nueva categoría de ticket
- **!ticketcat remove \<categoría>**: eliminar una categoría de ticket