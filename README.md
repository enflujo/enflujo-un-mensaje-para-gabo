# Un mensaje para Gabo

...

## 📍 Pines del Panel LED 32x16 P10 Hub12

> 📐 **Orientación de referencia:** Al observar el panel desde atrás, ubica el conector con el hueco guía hacia la izquierda.

|     |     |
| --- | --- |
| OE  | A   |
| GND | B   |
| GND | NC  |
| GND | CLK |
| GND | LAT |
| GND | DR  |
| GND | NC  |
| GND | NC  |

### 🔌 Conectores del Panel

El panel cuenta con **dos grupos de pines** (conectores tipo IDC de 16 pines), uno a la izquierda (entrada de señal) y otro a la derecha (salida o encadenamiento a otro panel).

### 🧭 Tabla de Pines - Lado Izquierdo

| Nombre | Descripción                                                   |
| ------ | ------------------------------------------------------------- |
| OE     | Output Enable – Habilita o deshabilita la salida de los LEDs  |
| GND    | Tierra (Ground) – Conecta con GND del ESP32 o fuente de poder |

---

### 🧭 Tabla de Pines - Lado Derecho

| Nombre | Descripción                                                                 |
| ------ | --------------------------------------------------------------------------- |
| A      | Dirección A – Línea de dirección vertical del panel                         |
| B      | Dirección B – Línea de dirección vertical del panel                         |
| NC     | No Conectado – Sin función asignada                                         |
| CLK    | Clock – Señal de reloj que sincroniza los datos                             |
| LAT    | Latch (o STB) – Señal que transfiere los datos al registro de visualización |
| DR     | Data Register – Entrada de datos del panel                                  |
| NC     | No Conectado – Reservado o sin uso                                          |

---

### ⚠️ Notas:

- **Los pines de GND** deben conectarse al GND de la ESP32 para compartir la referencia eléctrica.
- Si vas a conectar más de un panel en serie, **usa el conector del lado derecho como salida** al siguiente panel. El último panel recibe la conexión del panel anterior y luego los pines de la derecha quedan desconectados.
- Asegúrate de seguir la dirección de las flechas en la parte trasera del panel para el orden de conexión.

---

## Raspberry

Configurar WiFi

```bash
sudo nmtui
```

Ver a que red esta conectado

```bash
 iwgetid
```

## Enlaces con información útil

- https://www.yipinglink.com/huidu-w3-single-color-wi-fi-control-card-for-single-color-led-display-product/
- Aplicación Windows: https://cvtat.cn/article/Software/49.html
- HSPI: https://github.com/Qudor-Engineer/DMD32/pull/5/files
- Toca bajar la versión de ESP32 en Arduino IDE a 2.0.2 - ver: https://github.com/Qudor-Engineer/DMD32/issues/25
- https://gr33nonline.wordpress.com/2020/01/16/p10-displays/
