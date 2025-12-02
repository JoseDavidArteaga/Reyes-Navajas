package co.edu.unicauca.micronotificaciones.service;

import co.edu.unicauca.micronotificaciones.dto.WhatsAppRequest;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j // Usar el logger estándar de SLF4J
@Service
@RequiredArgsConstructor
public class NotificacionService {

    // Credenciales de Twilio
    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    // Número de teléfono Twilio de origen (debe tener el prefijo whatsapp:)
    @Value("${twilio.from-number}")
    private String fromNumber; // Debe ser whatsapp:+<country><number>

    /**
     * Inicializa el cliente estático de Twilio al inicio del servicio.
     */
    @PostConstruct
    public void init() {
        log.info("Inicializando cliente Twilio con Account SID: {}", accountSid);
        Twilio.init(accountSid, authToken);
    }

    public void enviarWhatsapp(WhatsAppRequest msg) {

        String telefonoDestino = msg.getTelefonoDestino();

        // CORRECCIÓN/VALIDACIÓN: Asegurar formato E.164.
        // Si no empieza con '+', se añade +57 como código de país por defecto (Colombia).
        if (telefonoDestino != null && !telefonoDestino.startsWith("+")) {
            log.warn("El número {} no tiene código de país (+). Asumiendo +57 (Colombia).", telefonoDestino);
            telefonoDestino = "+57" + telefonoDestino;
        }

        // Twilio requiere el prefijo "whatsapp:".
        String destinationNumber = "whatsapp:" + telefonoDestino;

        log.info("📤 Enviando WhatsApp real con Twilio. Origen: {} -> Destino: {}", fromNumber, destinationNumber);

        try {
            Message message = Message.creator(
                    new PhoneNumber(destinationNumber), // Destino (Ahora con +57)
                    new PhoneNumber(fromNumber),      // Origen (Twilio Sandbox o número oficial)
                    msg.getMensajeWhatsapp()
            ).create();

            log.info("WhatsApp enviado correctamente. Twilio SID: {}", message.getSid());
            // Si el SID se genera correctamente, el problema NO está en el código, sino en la configuración de Twilio.

        } catch (Exception e) {
            log.error("Error enviando WhatsApp con Twilio: {}", e.getMessage(), e);
        }
    }
}