# 🔧 Solución de Problemas de Conexión

## Diagnóstico
El problema parece ser una combinación de:
1. Restricciones de permisos en macOS
2. Posible falta de conexión a internet
3. Problemas de DNS

## Soluciones

### Opción 1: Verificar Conexión a Internet (Más Probable)

1. **Abre tu navegador** y verifica que puedas acceder a:
   - https://www.google.com
   - https://github.com

2. **Si no tienes internet:**
   - Verifica tu conexión Wi-Fi o Ethernet
   - Reinicia el router si es necesario
   - Verifica que no estés en modo avión

### Opción 2: Verificar DNS

Abre Terminal (fuera de Cursor) y ejecuta:

```bash
# Probar DNS con Google
nslookup github.com 8.8.8.8

# O probar con Cloudflare
nslookup github.com 1.1.1.1
```

Si funciona, el problema es el DNS local. Puedes cambiarlo temporalmente:

```bash
# Cambiar DNS a Google (requiere contraseña de administrador)
sudo networksetup -setdnsservers Wi-Fi 8.8.8.8 8.8.4.4

# O a Cloudflare
sudo networksetup -setdnsservers Wi-Fi 1.1.1.1 1.0.0.1
```

### Opción 3: Usar SSH en lugar de HTTPS

Si tienes SSH configurado con GitHub:

```bash
# Cambiar remote a SSH
git remote set-url origin git@github.com:leomena-gif/recauda.git

# Intentar push
git push -u origin feature/dark-mode-ui-improvements
```

### Opción 4: Verificar Proxy/VPN

Si usas VPN o proxy:
- Desactívalo temporalmente
- O configura git para usar el proxy:
  ```bash
  git config --global http.proxy http://proxy:puerto
  ```

### Opción 5: Reiniciar Servicios de Red (macOS)

```bash
# Reiniciar DNS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Reiniciar red (requiere contraseña)
sudo ifconfig en0 down
sudo ifconfig en0 up
```

### Opción 6: Verificar Firewall

1. Ve a **Preferencias del Sistema** → **Seguridad y Privacidad** → **Firewall**
2. Verifica que Terminal o Cursor no estén bloqueados

## Solución Rápida Recomendada

1. **Cierra Cursor completamente**
2. **Abre Terminal.app directamente** (no desde Cursor)
3. **Navega al proyecto:**
   ```bash
   cd /Users/leo/Desktop/prueba_cursor2
   ```
4. **Intenta el push:**
   ```bash
   git push -u origin feature/dark-mode-ui-improvements
   ```

Si funciona en Terminal pero no en Cursor, el problema es de permisos de Cursor.

## Verificación Final

Una vez que tengas conexión, verifica:

```bash
# Verificar que puedes acceder a GitHub
curl -I https://github.com

# Verificar configuración de git
git remote -v

# Hacer push
git push -u origin feature/dark-mode-ui-improvements
```

## Si Nada Funciona

Puedes hacer el push desde otra máquina o usar GitHub Desktop:
1. Copia los cambios a otra máquina con conexión
2. O usa GitHub Desktop para hacer el push visualmente
