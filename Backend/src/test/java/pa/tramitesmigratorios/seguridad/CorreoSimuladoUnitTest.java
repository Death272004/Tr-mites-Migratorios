package pa.tramitesmigratorios.seguridad;

import static org.assertj.core.api.Assertions.assertThat;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

@ExtendWith(OutputCaptureExtension.class)
class CorreoSimuladoUnitTest {
    @Test
    void elCorreoSimuladoNoRegistraDestinatariosNiTokens(CapturedOutput output) {
        comprobarRedaccion(true, output);
    }

    @Test
    void elCorreoDesactivadoNoRegistraDestinatariosNiTokens(CapturedOutput output) {
        comprobarRedaccion(false, output);
    }

    private void comprobarRedaccion(boolean activo, CapturedOutput output) {
        String destinatario = "privado-qa@example.test";
        String token = "HU28-RESET-SECRET-SENTINEL";
        new CorreoSimulado(activo).enviarRecuperacion(destinatario, token, Instant.parse("2026-10-29T23:00:00Z"));
        assertThat(output.getAll()).doesNotContain(destinatario, token);
        assertThat(output.getAll()).contains("recuperación");
    }
}
