# Correo institucional local

El servicio `mailserver` aloja las cuentas `@tr-utp.com` y `webmail` publica
Roundcube únicamente en `http://localhost:18084`.

Las cuentas del equipo usan como contraseña inicial el mismo texto que aparece
antes de `@tr-utp.com`, por ejemplo `kenneth.carter`. Las contraseñas del archivo
de aprovisionamiento están almacenadas como hashes SHA512-CRYPT.

Este entorno no configura DNS público, no publica SMTP/IMAP en la computadora y
no entrega mensajes a Gmail, Outlook ni otros servidores de Internet.
