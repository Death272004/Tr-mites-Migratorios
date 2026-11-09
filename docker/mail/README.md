# Correo institucional local

El servicio `mailserver` aloja las cuentas `@tr-utp.com` y `webmail` publica
Roundcube únicamente en `http://localhost:8081`.

## Aprovisionamiento automático

El servicio interno `mail-provisioner` crea o actualiza el buzón cuando una cuenta se registra,
cambia su contraseña o completa una recuperación. No publica puertos en el equipo y no utiliza
el socket de Docker. El backend se comunica con él únicamente por la red privada de Compose.

La dirección y la contraseña del buzón son las mismas que las credenciales del portal. Docker
Mailserver detecta el cambio en `postfix-accounts.cf` y lo aplica mientras está ejecutándose.

Las cuentas del equipo usan como contraseña inicial el mismo texto que aparece
antes de `@tr-utp.com`, por ejemplo `kenneth.carter`. Las contraseñas del archivo
de aprovisionamiento están almacenadas como hashes SHA512-CRYPT.

Este entorno no configura DNS público, no publica SMTP/IMAP en la computadora y
no entrega mensajes a Gmail, Outlook ni otros servidores de Internet.
